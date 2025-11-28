import type { Response } from "express";
import { badRequest } from "../utils/http";
import type { AuthenticatedRequest } from "../middleware/auth";
import { SalesService } from "../services/salesService";
import { PaymentMode } from "../generated/prisma/enums";

export const salesController = {
    getSuggestion : async (request : AuthenticatedRequest, response : Response) => {
        try{
            const {price} = request.query
            const userId = request.user?.userId || request.body.userId
            if(!price ){
                badRequest(response, "The price is required")
            }
    
            const numericPrice = Number(price)
            if(isNaN(numericPrice)) {
                badRequest(response, "Price must be a valid number")
            }
    
            const suggestions = await SalesService.getSuggestion(numericPrice, userId)
            return response.status(200).json({
                success: true,
                data: suggestions
            });
    
            
        }catch(error) {
            console.error("Prediction Error:", error);
            return response.status(500).json({ 
                success: false, 
                message: "Internal Server Error" 
            });
        }

        

    },
    createTransaction : async (request : AuthenticatedRequest, response : Response) => {
        try{
            const {items, totalAmount, mode, customerId} = request.body;
            const userId = request.user?.userId || request.body.userId 
            const result = await SalesService.processTransaction({
                userId,
                items,
                totalAmount,
                mode : mode || PaymentMode.CASH,
                customerId
            })

            return response.status(200).json({
                success: true,
                message: "Transaction Recorded",
                transactionId: result.transactionId,
                nudges: result.nudges
            });
        }catch(error){
            console.error("Transaction Error:", error);
            return response.status(500).json({ 
                success: false, 
                message: "Failed to record transaction" 
            });
        }
    }
}