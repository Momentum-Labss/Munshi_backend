import type { Request, Response } from "express";
import { MasterAgentService } from "../services/masterAgent";
import type { AuthenticatedRequest } from "../middleware/auth";

export const agentController = {
    /**
     * The Single Entry Point for "Munshi Ji"
     * Handles both Inventory Commands and Financial Questions
     */
    ask: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { query } = req.body;
            
            if (!query) {
                return res.status(400).json({ success: false, message: "Query is required" });
            }
            const userId = req.user?.userId || req.body.userId
            const result = await MasterAgentService.processRequest(userId, query);

            return res.status(200).json({
                success: true,
                intent: result.type,
                reply: result.message,
                payload: result.data // Can be Inventory List OR Financial Stat
            });

        } catch (error) {
            console.error("Master Agent Error:", error);
            return res.status(500).json({ success: false, message: "Munim Ji is offline" });
        }
    }
};