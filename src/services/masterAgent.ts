import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import { InventoryService } from "./inventoryService";
import { CfoAgentService } from "../Agents/cfo";

/**
 * THE MUNSHI ORCHESTRATOR
 * Decides "Who should handle this request?"
 */
export const MasterAgentService = {
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
          data: draft
        };

        case 'FINANCIAL_QUERY':
            // Delegate to CFO Agent's Query Handler
            const analysis = await CfoAgentService.answerFinancialQuery(userId, text);
            return {
                type: 'FINANCE_ANSWER',
                message: analysis.reply,
                data: analysis.dataPoint
            };
      default:
        return {
          type: 'UNKNOWN',
          message: "Maaf karna boss, main samjha nahi. Inventory add karu ya hisab batau?",
          data: null
        };
    }
  }
};