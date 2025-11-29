import { StateGraph, END, Annotation } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import prisma from "../utils/prismaClient";
import { ProductType } from "../generated/prisma/enums";

// ------------------------------------------------------------------
// 1. DEFINE THE STATE ANNOTATIONS
// ------------------------------------------------------------------
const ParseStateAnnotation = Annotation.Root({
  input: Annotation<string>,
  userId: Annotation<number>,
  parsedItems: Annotation<{
    rawName: string;
    quantity: number;
    unit?: string;
    probableType: 'loose' | 'packaged';
  }[]>
});

const ExecuteStateAnnotation = Annotation.Root({
  userId : Annotation<number>,
  parsedItems: Annotation<{
    rawName: string;
    quantity: number;
    unit?: string;
    probableType: 'loose' | 'packaged';
  }[]>,
  finalResult: Annotation<{
    success: boolean;
    updates: string[];
    errors: string[];
  }>
});

// ------------------------------------------------------------------
// 2. AGENT A: THE CASHIER (PARSER)
// ------------------------------------------------------------------
const cashierAgent = async (state: typeof ParseStateAnnotation.State) => {
  console.log("🤖 Agent A (Cashier): Parsing voice command...");
  
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY
  });

  const ExtractionSchema = z.object({
    items: z.array(z.object({
      rawName: z.string().describe("The name of the product mentioned"),
      quantity: z.number().describe("The numeric quantity"),
      unit: z.string().optional().describe("Unit like kg, gm, packet, box"),
      probableType: z.enum(['loose', 'packaged']).describe("Guess if it is loose or packaged")
    }))
  });

  const structuredLlm = model.withStructuredOutput(ExtractionSchema);

  const prompt = `
You are an expert Kirana Store Cashier. Extract inventory items from this Hinglish or English voice command:
"${state.input}".

Rules:
- If unit is missing for countables (maggie, soap), assume 'packets'.
- If 'kilo' or 'g' is mentioned, type is 'loose'.
- If brand names are mentioned, type is 'packaged'.
  `;

  const result = await structuredLlm.invoke(prompt);
  
  return { parsedItems: result.items };
};

// ------------------------------------------------------------------
// 3. AGENT C: THE STOCK MANAGER (EXECUTOR)
// ------------------------------------------------------------------
const stockManagerAgent = async (state: typeof ExecuteStateAnnotation.State) => {
  console.log("🤖 Agent C (Stock Manager): Committing Verified Inventory...");

  if (!state.parsedItems || state.parsedItems.length === 0) {
    return {
      finalResult: {
        success: false,
        updates: [],
        errors: ["No items to add."]
      }
    };
  }

  if (!state.userId) {
    return {
      finalResult: { success: false, updates: [], errors: ["User ID is missing in context."] }
    };
  }

  const updates: string[] = [];
  const errors: string[] = [];

  for (const item of state.parsedItems) {
    try {
      // Fuzzy Search
      const existingProduct = await prisma.product.findFirst({
        where: {
          name: { contains: item.rawName, mode: 'insensitive' }
        }
      });

      if (existingProduct) {
        const updated = await prisma.product.update({
          where: { id: existingProduct.id },
          data: { stock: { increment: item.quantity } }
        });
        updates.push(`Updated ${updated.name}: +${item.quantity} (Total: ${updated.stock})`);
      } else {
        const newProduct = await prisma.product.create({
          data: {
            name: item.rawName,
            type: item.probableType === 'loose' ? ProductType.Loose : ProductType.Packaged,
            price: 0,
            stock: item.quantity,
            userId: 1,
            icon: item.probableType === 'loose' ? '🥡' : '📦'
          }
        });
        updates.push(`Created New Item: ${newProduct.name} (Stock: ${newProduct.stock})`);
      }
    } catch (err) {
      console.error(err);
      errors.push(`Failed to process ${item.rawName}`);
    }
  }

  return {
    finalResult: {
      success: true,
      updates,
      errors
    }
  };
};

// ------------------------------------------------------------------
// 4. WORKFLOWS (Split for Human-in-the-Loop)
// ------------------------------------------------------------------

// Workflow 1: Parsing Only
export const parseWorkflow = new StateGraph(ParseStateAnnotation)
  .addNode("cashier", cashierAgent)
  .addEdge("__start__", "cashier")
  .addEdge("cashier", "__end__");

// Workflow 2: Execution Only
export const executeWorkflow = new StateGraph(ExecuteStateAnnotation)
  .addNode("stockManager", stockManagerAgent)
  .addEdge("__start__", "stockManager")
  .addEdge("stockManager", "__end__");
