import { response, type Response } from "express";
import { UdhaarService } from "../services/uddharService";
import type { AuthenticatedRequest } from "../middleware/auth";
import { badRequest } from "../utils/http";

export const udhaarController = {
    addCustomer: async (req: AuthenticatedRequest, res: Response) => {
        const userId = req.user?.userId || req.body.userId 
        if(userId!) {
            badRequest(response, "User Id is required")
        }
        const { name, phone } = req.body;
        const result = await UdhaarService.createCustomer(userId, name, phone);
        return res.status(201).json({ success: true, data: result });
    },
    getCustomers: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = String(req.query.search || "");
            const userId = req.user?.userId || req.body.userId 
            if(userId!) {
                badRequest(response, "User Id is required")
            }
            // If ?type=debtors, filtering only those who owe money
            const onlyDebtors = req.query.type === 'debtors';

            const result = await UdhaarService.getCustomers(userId, page, limit, search, onlyDebtors);
            
            return res.status(200).json({ success: true, ...result });
        } catch (error) {
             console.error("Get Customers Error:", error);
             return res.status(500).json({ success: false, message: "Failed to fetch customers" });
        }
    }
};