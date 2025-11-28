import { StateGraph, END } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import prisma from "../utils/prismaClient";
import { ProductType } from "../generated/prisma/enums";

// ------------------------------------------------------------------
// 1. DEFINE THE STATE
// ------------------------------------------------------------------

interface AgentState {
  input: string;
  parsedItems?: {
    rawName: string;
    quantity: number;
    unit?: string;
    probableType: 'loose' | 'packaged';
  }[];
  finalResult?: {
    success: boolean;
    updates: string[];
    errors: string[];
  };
}

// ------------------------------------------------------------------
// 2. AGENT A: THE CASHIER (PARSER)
// ------------------------------------------------------------------

const cashierAgent = async (state: AgentState) => {
  console.log("🤖 Agent A (Cashier): Parsing voice command...");

  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0,
    apiKey: process.env.OPENAI_API_KEY // Ensure this is set
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
    You are an expert Kirana Store Cashier. 
    Extract inventory items from this Hinglish voice command: "${state.input}".
    
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

const stockManagerAgent = async (state: AgentState) => {
  console.log("🤖 Agent C (Stock Manager): Committing Verified Inventory...");

  // INPUT VALIDATION: This agent expects 'parsedItems' to be populated (and verified by human)
  if (!state.parsedItems || state.parsedItems.length === 0) {
    return {
      finalResult: { success: false, updates: [], errors: ["No items to add."] }
    };
  }

  const updates: string[] = [];
  const errors: string[] = [];

  for (const item of state.parsedItems) {
    try {
      // Fuzzy Search
      const existingProduct = await prisma.product.findFirst({
        where: { name: { contains: item.rawName, mode: 'insensitive' } }
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
            price: 0, // Flag for review
            stock: item.quantity,
            userId: 1, // Hardcoded
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
    finalResult: { success: true, updates, errors }
  };
};

// ------------------------------------------------------------------
// 4. WORKFLOWS (Split for Human-in-the-Loop)
// ------------------------------------------------------------------

// Workflow 1: Parsing Only
const parseWorkflow = new StateGraph({
    channels: {
      input: { value: (l : any, r: any) => r, default: () => "" },
      parsedItems: { value: (l : any, r : any) => r, default: () => [] }
    }
  })
  .addNode("cashier", cashierAgent)
  .addEdge("__start__", "cashier")
  .addEdge("cashier", "__end__");

// Workflow 2: Execution Only
const executeWorkflow = new StateGraph({
    channels: {
      parsedItems: { value: (l : any, r : any) => r, default: () => [] },
      finalResult: { value: (l : any, r : any) => r, default: () => undefined }
    }
  })
  .addNode("stockManager", stockManagerAgent)
  .addEdge("__start__", "stockManager")
  .addEdge("stockManager", "__end__");


export const InventoryAgentService = {
  /**
   * Step 1: Voice -> JSON
   * Returns a list of items for the user to review.
   */
  parseVoiceToDraft: async (text: string) => {
    const app = parseWorkflow.compile();
    const result = await app.invoke({ input: text });
    return result.parsedItems;
  },

  /**
   * Step 2: Verified JSON -> DB
   * Takes the (potentially edited) list and commits it.
   */
  confirmAndExecute: async (items: any[]) => {
    const app = executeWorkflow.compile();
    const result = await app.invoke({ parsedItems: items });
    return result.finalResult;
  }
};