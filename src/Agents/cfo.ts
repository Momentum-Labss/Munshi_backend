import { StateGraph, Annotation } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import prisma from "../utils/prismaClient";
import { PaymentMode, TimeBucket, ProductType } from "../generated/prisma/enums";

// ============================================================
// PART 1: TRANSACTION EVALUATION AGENT (Real-time Risk Assessment)
// ============================================================

const CfoStateAnnotation = Annotation.Root({
  userId: Annotation<number>,
  amount: Annotation<number>,
  mode: Annotation<PaymentMode>,
  customerId: Annotation<string | null | undefined>,

  customerContext: Annotation<{
    name: string;
    currentDebt: number;
    daysSinceLastPayment: number;
    riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
    purchaseHistory: number;
  }>,

  storeContext: Annotation<{
    todayTotalCash: number;
    todayTotalUdhaar: number;
    cashToCreditRatio: number;
    totalPendingDebt: number;
  }>,

  anomalyContext: Annotation<{
    isOutlier: boolean;
    averageTransactionSize: number;
    deviation: string;
  }>,

  decision: Annotation<{
    status: 'APPROVE' | 'WARN' | 'BLOCK';
    reason: string;
    suggestion: string;
  }>
});

type CfoState = typeof CfoStateAnnotation.State;

const customerRiskNode = async (state: CfoState) => {
  console.log("🕵️ CFO Node (Risk): Analyzing Customer...");

  let data = {
    name: "Walk-in Customer",
    currentDebt: 0,
    daysSinceLastPayment: 0,
    riskScore: 'LOW' as 'LOW' | 'MEDIUM' | 'HIGH',
    purchaseHistory: 0
  };

  if (state.mode === 'UDHAAR' && state.customerId) {
    const customer = await prisma.customer.findUnique({
      where: { id: state.customerId },
      include: {
        transactions: {
          select: { totalAmount: true },
          take: 10
        }
      }
    });

    if (customer) {
      data.name = customer.name;
      data.currentDebt = Number(customer.currentDebt);
      data.purchaseHistory = customer.transactions.length;
      
      if (customer.lastPaymentDate) {
        const diff = Math.abs(new Date().getTime() - new Date(customer.lastPaymentDate).getTime());
        data.daysSinceLastPayment = Math.ceil(diff / (1000 * 60 * 60 * 24));
      } else {
        data.daysSinceLastPayment = data.currentDebt > 0 ? 999 : 0;
      }

      // Enhanced Risk Scoring
      if (data.currentDebt > 5000 || data.daysSinceLastPayment > 60) data.riskScore = 'HIGH';
      else if (data.currentDebt > 2000 || data.daysSinceLastPayment > 30) data.riskScore = 'MEDIUM';
      
      // New customer with no history asking for credit = HIGH RISK
      if (data.purchaseHistory === 0 && state.mode === 'UDHAAR') data.riskScore = 'HIGH';
    }
  }

  return { customerContext: data };
};

const storeHealthNode = async (state: CfoState) => {
  console.log("📈 CFO Node (Store): Checking Liquidity...");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [stats, totalDebt] = await Promise.all([
    prisma.transaction.groupBy({
      by: ['mode'],
      where: {
        userId: state.userId,
        createdAt: { gte: todayStart }
      },
      _sum: { totalAmount: true }
    }),
    prisma.customer.aggregate({
      where: { userId: state.userId, currentDebt: { gt: 0 } },
      _sum: { currentDebt: true }
    })
  ]);

  const cash = Number(stats.find(t => t.mode === 'CASH')?._sum.totalAmount || 0);
  const udhaar = Number(stats.find(t => t.mode === 'UDHAAR')?._sum.totalAmount || 0);
  const ratio = cash === 0 ? 0 : (udhaar / cash);

  return { 
    storeContext: {
      todayTotalCash: cash,
      todayTotalUdhaar: udhaar,
      cashToCreditRatio: ratio,
      totalPendingDebt: Number(totalDebt._sum.currentDebt || 0)
    }
  };
};

const anomalyNode = async (state: CfoState) => {
  console.log("🚨 CFO Node (Anomaly): Scanning for Outliers...");

  const aggregations = await prisma.transaction.aggregate({
    where: { userId: state.userId },
    _avg: { totalAmount: true },
    _count: true
  });

  const avgTx = Number(aggregations._avg.totalAmount || 0);
  const count = aggregations._count;
  const baseline = count < 10 ? 500 : avgTx; 
  const isOutlier = state.amount > (baseline * 5) && state.amount > 2000;
  
  let deviation = "Normal";
  if (state.amount > baseline * 2) deviation = "2x Average";
  if (state.amount > baseline * 5) deviation = "5x Average (High Risk)";

  return {
    anomalyContext: {
      isOutlier,
      averageTransactionSize: Math.round(baseline),
      deviation
    }
  };
};

const controllerAgent = async (state: CfoState) => {
  console.log("⚖️ CFO Agent (Controller): Finalizing Verdict...");

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY
  });

  const DecisionSchema = z.object({
    status: z.enum(['APPROVE', 'WARN', 'BLOCK']),
    reason: z.string(),
    suggestion: z.string()
  });

  const structuredLlm = model.withStructuredOutput(DecisionSchema);
  const cust = state.customerContext!;
  const store = state.storeContext!;
  const anomaly = state.anomalyContext!;
  
  const prompt = `
    You are the CFO of 'Munshi Kirana Store'. Evaluate this transaction critically.

    TRANSACTION DETAILS:
    - Amount: ₹${state.amount} (${state.mode})
    - Anomaly Check: ${anomaly.deviation} (Avg Tx: ₹${anomaly.averageTransactionSize})

    CUSTOMER PROFILE (${cust.name}):
    - Risk Score: ${cust.riskScore}
    - Current Debt: ₹${cust.currentDebt}
    - Days Since Payment: ${cust.daysSinceLastPayment}
    - Purchase History: ${cust.purchaseHistory} transactions

    STORE HEALTH (TODAY):
    - Cash In: ₹${store.todayTotalCash}
    - Credit Out: ₹${store.todayTotalUdhaar}
    - Credit Ratio: ${store.cashToCreditRatio.toFixed(2)} (Healthy: < 0.5)
    - Total Pending Debt: ₹${store.totalPendingDebt}

    CRITICAL DECISION RULES (MUST FOLLOW):
    1. **BLOCK** if:
       - Customer Risk = HIGH AND mode = UDHAAR
       - Store Credit Ratio > 1.5 (liquidity crisis)
       - New customer (0 history) asking for credit
       - Total pending debt > ₹50,000 and new UDHAAR request
    
    2. **WARN** if:
       - Customer Risk = MEDIUM AND mode = UDHAAR
       - Anomaly detected (amount > 2x average)
       - Store Credit Ratio between 1.0 and 1.5
       - Days pending > 30
       - Total pending debt > ₹30,000
    
    3. **APPROVE** otherwise

    Return JSON with:
    - status: Your decision
    - reason: Short Hinglish (max 15 words)
    - suggestion: Actionable advice
  `;

  const result = await structuredLlm.invoke(prompt);
  return { decision: result };
};

const transactionWorkflow = new StateGraph(CfoStateAnnotation)
  .addNode("customerRisk", customerRiskNode)
  .addNode("storeHealth", storeHealthNode)
  .addNode("anomalyDetector", anomalyNode)
  .addNode("controller", controllerAgent)
  .addEdge("__start__", "customerRisk")
  .addEdge("__start__", "storeHealth")
  .addEdge("__start__", "anomalyDetector")
  .addEdge("customerRisk", "controller")
  .addEdge("storeHealth", "controller")
  .addEdge("anomalyDetector", "controller")
  .addEdge("controller", "__end__");

// ============================================================
// PART 2: COMPREHENSIVE FINANCIAL QUERY AGENT (Streaming)
// ============================================================

async function* streamFinancialQuery(userId: number, query: string) {
  console.log("💰 Munshi Agent: Processing financial query (STREAMING)...");

  yield { type: 'status', message: 'समझ रहा हूँ...' };

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
    streaming: true
  });

  // Step 1: Parse Intent
  const IntentSchema = z.object({
    dataNeeded: z.enum([
      'TODAY_SUMMARY',
      'CUSTOMER_DEBT',
      'SPECIFIC_CUSTOMER_INFO',
      'MONTHLY_PROFIT',
      'WEEKLY_SUMMARY',
      'TOP_DEBTORS',
      'CASH_FLOW_ANALYSIS',
      'INVENTORY_VALUE',
      'LOW_STOCK_ALERT',
      'TOP_SELLING_PRODUCTS',
      'TIME_BUCKET_ANALYSIS',
      'SMART_PRICING_INSIGHTS',
      'PAYMENT_MODE_DISTRIBUTION',
      'CUSTOMER_PURCHASE_PATTERN',
      'DEBT_RECOVERY_STATUS'
    ]),
    customerName: z.string().optional(),
    timeframe: z.enum(['today', 'week', 'month', 'all']).optional(),
    productName: z.string().optional()
  });

  const intentLlm = model.withStructuredOutput(IntentSchema);
  const intent = await intentLlm.invoke(`
    Parse this Hinglish financial query: "${query}"
    Determine what specific data is needed.
    
    Examples:
    - "aaj ka hisab" → TODAY_SUMMARY
    - "Raju ka udhaar" → SPECIFIC_CUSTOMER_INFO, customerName: "Raju"
    - "sabse zyada kaun udhaar leta hai" → TOP_DEBTORS
    - "is mahine ka profit" → MONTHLY_PROFIT
    - "stock kam hai kisme" → LOW_STOCK_ALERT
    - "maggi kitni biki" → TOP_SELLING_PRODUCTS, productName: "maggi"
  `);

  yield { type: 'status', message: 'डेटा निकाल रहा हूँ...' };

  // Step 2: Fetch Comprehensive Data
  let dataContext: any = {};

  try {
    switch (intent.dataNeeded) {
      case 'TODAY_SUMMARY': {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [stats, customerCount, txCount] = await Promise.all([
          prisma.transaction.groupBy({
            by: ['mode'],
            where: { userId, createdAt: { gte: todayStart } },
            _sum: { totalAmount: true },
            _count: true
          }),
          prisma.customer.count({
            where: { 
              userId, 
              transactions: { some: { createdAt: { gte: todayStart } } }
            }
          }),
          prisma.transaction.count({
            where: { userId, createdAt: { gte: todayStart } }
          })
        ]);

        const cash = Number(stats.find(t => t.mode === 'CASH')?._sum.totalAmount || 0);
        const udhaar = Number(stats.find(t => t.mode === 'UDHAAR')?._sum.totalAmount || 0);
        const upi = Number(stats.find(t => t.mode === 'UPI')?._sum.totalAmount || 0);

        dataContext = {
          cash, udhaar, upi,
          total: cash + udhaar + upi,
          totalTransactions: txCount,
          uniqueCustomers: customerCount,
          averageTicket: txCount > 0 ? Math.round((cash + udhaar + upi) / txCount) : 0
        };
        break;
      }

      case 'SPECIFIC_CUSTOMER_INFO': {
        if (intent.customerName) {
          const customer = await prisma.customer.findFirst({
            where: {
              userId,
              name: { contains: intent.customerName, mode: 'insensitive' }
            },
            include: {
              transactions: {
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { totalAmount: true, createdAt: true, mode: true }
              }
            }
          });

          if (customer) {
            const daysSincePayment = customer.lastPaymentDate 
              ? Math.ceil((new Date().getTime() - new Date(customer.lastPaymentDate).getTime()) / (1000 * 60 * 60 * 24))
              : 999;

            dataContext = {
              found: true,
              name: customer.name,
              phone: customer.phone,
              debt: Number(customer.currentDebt),
              daysSincePayment,
              lastPurchase: customer.lastPurchaseDate,
              recentTransactions: customer.transactions.map(t => ({
                amount: Number(t.totalAmount),
                date: t.createdAt,
                mode: t.mode
              }))
            };
          } else {
            dataContext = { found: false, searchedName: intent.customerName };
          }
        }
        break;
      }

      case 'TOP_DEBTORS': {
        const debtors = await prisma.customer.findMany({
          where: { userId, currentDebt: { gt: 0 } },
          orderBy: { currentDebt: 'desc' },
          take: 10,
          select: { 
            name: true, 
            currentDebt: true, 
            lastPaymentDate: true,
            phone: true 
          }
        });

        const totalDebt = debtors.reduce((sum, d) => sum + Number(d.currentDebt), 0);

        dataContext = {
          debtors: debtors.map(d => ({
            name: d.name,
            debt: Number(d.currentDebt),
            phone: d.phone,
            daysSincePayment: d.lastPaymentDate 
              ? Math.ceil((new Date().getTime() - new Date(d.lastPaymentDate).getTime()) / (1000 * 60 * 60 * 24))
              : 999
          })),
          totalDebt,
          debtorCount: debtors.length
        };
        break;
      }

      case 'MONTHLY_PROFIT': {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const [revenue, txCount] = await Promise.all([
          prisma.transaction.aggregate({
            where: {
              userId,
              createdAt: { gte: monthStart },
              mode: { in: ['CASH', 'UPI'] }
            },
            _sum: { totalAmount: true }
          }),
          prisma.transaction.count({
            where: { userId, createdAt: { gte: monthStart } }
          })
        ]);

        dataContext = {
          revenue: Number(revenue._sum.totalAmount || 0),
          transactions: txCount,
          month: monthStart.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
          averageDaily: Math.round(Number(revenue._sum.totalAmount || 0) / new Date().getDate())
        };
        break;
      }

      case 'LOW_STOCK_ALERT': {
        const lowStock = await prisma.product.findMany({
          where: {
            userId,
            stock: { lte: prisma.product.fields.lowStockThreshold }
          },
          orderBy: { stock: 'asc' },
          take: 15
        });

        dataContext = {
          products: lowStock.map(p => ({
            name: p.name,
            stock: Number(p.stock),
            threshold: Number(p.lowStockThreshold),
            type: p.type,
            price: Number(p.price)
          })),
          count: lowStock.length
        };
        break;
      }

      case 'TOP_SELLING_PRODUCTS': {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Get all transactions and parse items
        const transactions = await prisma.transaction.findMany({
          where: {
            userId,
            createdAt: { gte: thirtyDaysAgo }
          },
          select: { items: true }
        });

        // Aggregate sales
        const salesMap = new Map<string, { count: number; revenue: number }>();
        
        transactions.forEach(tx => {
          const items = tx.items as any[];
          items.forEach((item: any) => {
            const existing = salesMap.get(item.name) || { count: 0, revenue: 0 };
            salesMap.set(item.name, {
              count: existing.count + (item.quantity || 1),
              revenue: existing.revenue + Number(item.price || 0) * (item.quantity || 1)
            });
          });
        });

        const topProducts = Array.from(salesMap.entries())
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 10);

        dataContext = {
          products: topProducts.map(([name, data]) => ({
            name,
            soldCount: data.count,
            revenue: data.revenue
          })),
          timeframe: '30 days'
        };
        break;
      }

      case 'TIME_BUCKET_ANALYSIS': {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const buckets = await prisma.transaction.groupBy({
          by: ['timeBucket'],
          where: {
            userId,
            createdAt: { gte: todayStart },
            timeBucket: { not: null }
          },
          _sum: { totalAmount: true },
          _count: true
        });

        dataContext = {
          buckets: buckets.map(b => ({
            time: b.timeBucket,
            revenue: Number(b._sum.totalAmount || 0),
            transactions: b._count
          }))
        };
        break;
      }

      case 'INVENTORY_VALUE': {
        const products = await prisma.product.findMany({
          where: { userId },
          select: { name: true, stock: true, price: true, type: true }
        });

        const totalValue = products.reduce((sum, p) => 
          sum + (Number(p.stock) * Number(p.price)), 0
        );

        dataContext = {
          totalValue,
          productCount: products.length,
          looseItems: products.filter(p => p.type === 'Loose').length,
          packagedItems: products.filter(p => p.type === 'Packaged').length
        };
        break;
      }

      case 'PAYMENT_MODE_DISTRIBUTION': {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const distribution = await prisma.transaction.groupBy({
          by: ['mode'],
          where: { userId, createdAt: { gte: sevenDaysAgo } },
          _sum: { totalAmount: true },
          _count: true
        });

        dataContext = {
          distribution: distribution.map(d => ({
            mode: d.mode,
            amount: Number(d._sum.totalAmount || 0),
            count: d._count
          })),
          timeframe: '7 days'
        };
        break;
      }

      case 'WEEKLY_SUMMARY': {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);

        const [revenue, txCount, newCustomers] = await Promise.all([
          prisma.transaction.aggregate({
            where: { userId, createdAt: { gte: weekStart } },
            _sum: { totalAmount: true }
          }),
          prisma.transaction.count({
            where: { userId, createdAt: { gte: weekStart } }
          }),
          prisma.customer.count({
            where: { userId, createdAt: { gte: weekStart } }
          })
        ]);

        dataContext = {
          revenue: Number(revenue._sum.totalAmount || 0),
          transactions: txCount,
          newCustomers,
          dailyAverage: Math.round(Number(revenue._sum.totalAmount || 0) / 7)
        };
        break;
      }

      default:
        dataContext = { message: "Query type not yet implemented" };
    }
  } catch (error) {
    console.error("Database query error:", error);
    dataContext = { error: "Failed to fetch data" };
  }

  // Yield the raw data
  yield { type: 'data', payload: dataContext };
  yield { type: 'status', message: 'जवाब तैयार कर रहा हूँ...' };

  // Step 3: Stream Natural Language Response
  const prompt = `
    User asked (in Hinglish): "${query}"
    
    Here's the data from our shop database:
    ${JSON.stringify(dataContext, null, 2)}

    Generate a helpful, conversational response in natural Hinglish (mix of Hindi and English).
    - Use Indian number format (e.g., ₹1,23,456)
    - Be concise (2-4 sentences)
    - Include specific numbers and insights
    - Add a helpful suggestion if relevant
    - Sound like a friendly accountant (Munshi Ji)
    
    Examples of good responses:
    - "Boss, aaj ka total ₹12,450 hai. Cash mein ₹8,200, UPI ₹3,250, aur ₹1,000 udhaar diya. Accha din raha!"
    - "Raju ka ₹2,500 udhaar baaki hai boss. Last payment 45 din pehle hua tha. Ek baar remind kar lo."
    - "Stock low hai boss! Maggi sirf 5 packet bache, aur chawal bhi 2kg se kam hai. Order kar lo."
  `;

  const stream = await model.stream(prompt);
  
  let fullText = '';
  for await (const chunk of stream) {
    const text = chunk.content.toString();
    fullText += text;
    yield { 
      type: 'text', 
      chunk: text,
      fullText: fullText 
    };
  }

  yield { 
    type: 'complete', 
    reply: fullText,
    dataPoint: dataContext 
  };
}

// ============================================================
// EXPORTED SERVICE
// ============================================================

export const CfoAgentService = {
  /**
   * Real-time transaction risk evaluation
   */
  evaluateTransaction: async (
    userId: number, 
    amount: number, 
    mode: PaymentMode, 
    customerId?: string | null
  ) => {
    const app = transactionWorkflow.compile();
    const result = await app.invoke({ userId, amount, mode, customerId });
    return result.decision;
  },

  /**
   * Streaming financial query handler
   */
  streamFinancialQuery: streamFinancialQuery,

  /**
   * Non-streaming version (backward compatibility)
   */
  answerFinancialQuery: async (userId: number, query: string) => {
    let finalResponse = { reply: '', dataPoint: {} };
    
    for await (const update of streamFinancialQuery(userId, query)) {
      if (update.type === 'complete') {
        finalResponse = {
          reply: update.reply || "",
          dataPoint: update.dataPoint
        };
      }
    }
    
    return finalResponse;
  }
};