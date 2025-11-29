import type { Request, Response } from "express";
import type { ProductType } from "../generated/prisma/enums";
import { InventoryService } from "../services/inventoryService";
import type { AuthenticatedRequest } from "../middleware/auth";
import { badRequest } from "../utils/http";

export const inventoryController = {
    listProducts: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = String(req.query.search || "");
            const type = req.query.type as ProductType | undefined;
            const lowStock = req.query.lowStock === 'true';

            const userId = req.user?.userId || req.body.userId
            if(!userId) {
                badRequest(res, "Bad Request : user Id Required")
            }
            const result = await InventoryService.getProducts(userId, page, limit, {
                search,
                type,
                lowStock
            });

            return res.status(200).json({ success: true, ...result });

        } catch (error) {
            console.error("List Products Error:", error);
            return res.status(500).json({ success: false, message: "Failed to fetch inventory" });
        }
    },
    
    voiceParse: async (req: Request, res: Response) => {
        try {
            const { command } = req.body;
            if (!command) return res.status(400).json({ success: false, message: "Voice command required" });

            console.log(`🎤 Parsing: "${command}"`);
            
            // Agent A runs here
            const draftItems = await InventoryService.parseVoiceToDraft(command);

            return res.status(200).json({
                success: true,
                message: "Please confirm these items",
                draft: draftItems // Frontend should show this in a Modal
            });

        } catch (error) {
            console.error("Parse Error:", error);
            return res.status(500).json({ success: false, message: "Agent failed to parse" });
        }
    },

    // STEP 2: Confirm Draft -> Update DB
    voiceConfirm: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = Number(req.user?.userId) || req.body.userId
            const { items } = req.body; // These items might be EDITED by the user on Frontend
            
            if (!items || !Array.isArray(items)) {
                return res.status(400).json({ success: false, message: "Verified items list required" });
            }

            console.log(`✅ Confirming ${items.length} items...`);

            // Agent C runs here
            const result = await InventoryService.confirmAndExecute(items, userId);

            return res.status(200).json({
                success: true,
                message: "Inventory Updated",
                data: result
            });

        } catch (error) {
            console.error("Confirm Error:", error);
            return res.status(500).json({ success: false, message: "Agent failed to execute" });
        }
    }
}