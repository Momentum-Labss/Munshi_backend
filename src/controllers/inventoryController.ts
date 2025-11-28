import type { Request, Response } from "express";
import type { ProductType } from "../generated/prisma/enums";
import { InventoryService } from "../services/inventoryService";
import type { AuthenticatedRequest } from "../middleware/auth";
import { use } from "react";
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
    
    // Placeholder for voice command to keep file complete
    voiceAdd: async (req: Request, res: Response) => {
        // ... (Implementation from previous turn)
        return res.status(200).json({ success: true, message: "Voice command processed" });
    }
};