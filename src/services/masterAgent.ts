import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import { InventoryService } from "./inventoryService";
import { CfoAgentService } from "../Agents/cfo";

/**
 * THE MUNSHI ORCHESTRATOR
 * Decides "Who should handle this request?"
 */
export const MasterAgentService = {
    async* streamRequest(userId: number, text: string) {
        console.log(`🧠 Munim Ji (Master): Routing "${text}"...`);

        // Initial status
        yield {
            type: 'routing',
            message: 'समझ रहा हूँ...'
        };

        const model = new ChatGoogleGenerativeAI({
            model: "gemini-2.0-flash-exp",
            temperature: 0,
            apiKey: process.env.GOOGLE_API_KEY
        });

        // 1. Classification Step
        const RoutingSchema = z.object({
            intent: z.enum(['INVENTORY_ADD', 'FINANCIAL_QUERY', 'UNKNOWN']),
            confidence: z.number()
        });

        const structuredLlm = model.withStructuredOutput(RoutingSchema);
        const prompt = `
            You are the Master Router for a shop app. Classify the user's intent.
            User Input: "${text}"
            
            Categories:
            - INVENTORY_ADD: User wants to add/stock items (e.g., "50 maggi add karo", "stock aagaya", "likho 10kg chawal").
            - FINANCIAL_QUERY: User asks about money, sales, debt, or profit (e.g., "aaj ka hisab", "kya profit hua", "Raju ka udhaar kitna hai").
            - UNKNOWN: Chit-chat or unrelated.
        `;

        const routing = await structuredLlm.invoke(prompt);
        console.log(`📍 Routed to: ${routing.intent}`);

        // Yield routing result
        yield {
            type: 'routed',
            intent: routing.intent,
            confidence: routing.confidence
        };

        // 2. Delegation Step
        switch (routing.intent) {
            case 'INVENTORY_ADD': {
            yield { type: 'status', message: 'Inventory parse कर रहा हूँ...' };
            
            const draft = await InventoryService.parseVoiceToDraft(text);
            
            yield {
                type: 'INVENTORY_DRAFT',
                message: "Ji boss, maine list bana li hai. Check karlo?",
                data: draft,
                isVisual: true
            };
            
            yield { type: 'complete' };
            break;
            }

            case 'FINANCIAL_QUERY': {
            // Stream from CFO Agent
            for await (const update of CfoAgentService.streamFinancialQuery(userId, text)) {
                // Forward all updates from CFO agent
                yield update;
            }
            break;
            }

            default: {
            yield {
                type: 'UNKNOWN',
                message: "Maaf karna boss, main samjha nahi. Inventory add karu ya hisab batau?",
                data: null,
                isVisual: false
            };
            
            yield { type: 'complete' };
            break;
            }
        }
        },
  processRequest: async (userId: number, text: string) => {
    console.log(`🧠 Munim Ji (Master): Routing "${text}"...`);

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      temperature: 0,
      apiKey: process.env.GOOGLE_API_KEY
    });

    // 1. Classification Step
    const RoutingSchema = z.object({
      intent: z.enum(['INVENTORY_ADD', 'FINANCIAL_QUERY', 'UNKNOWN']),
      confidence: z.number()
    });

    const structuredLlm = model.withStructuredOutput(RoutingSchema);

    const prompt = `
      You are the Master Router for a shop app. Classify the user's intent.

      User Input: "${text}"

      Categories:
      - INVENTORY_ADD: User wants to add/stock items (e.g., "50 maggi add karo", "stock aagaya", "likho 10kg chawal").
      - FINANCIAL_QUERY: User asks about money, sales, debt, or profit (e.g., "aaj ka hisab", "kya profit hua", "Raju ka udhaar kitna hai").
      - UNKNOWN: Chit-chat or unrelated.
    `;

    const routing = await structuredLlm.invoke(prompt);

    console.log(`📍 Routed to: ${routing.intent}`);

    // 2. Delegation Step
    switch (routing.intent) {
      
      case 'INVENTORY_ADD':
        // Delegate to Inventory Agent (Step 1: Parse)
        // Note: Inventory Agent returns a "Draft" for confirmation
        const draft = await InventoryService.parseVoiceToDraft(text);
        return {
          type: 'INVENTORY_DRAFT',
          message: "Ji boss, maine list bana li hai. Check karlo?",
          data: draft,
          isVisual : true
        };

        case 'FINANCIAL_QUERY':
            // Delegate to CFO Agent's Query Handler
            const analysis = await CfoAgentService.answerFinancialQuery(userId, text);
            return {
                type: 'FINANCE_ANSWER',
                message: analysis.reply,
                data: analysis.dataPoint,
                isVisual : false

            };
      default:
        return {
          type: 'UNKNOWN',
          message: "Maaf karna boss, main samjha nahi. Inventory add karu ya hisab batau?",
          data: null,
          isVisual : false
        };
    }
  }
};