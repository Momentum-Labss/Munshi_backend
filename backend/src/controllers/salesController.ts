import type { Response } from "express";
import { badRequest } from "../utils/http";
import type { AuthenticatedRequest } from "../middleware/auth";
import { SalesService } from "../services/salesService";
import { PaymentMode } from "../generated/prisma/enums";
import { CfoAgentService } from "../Agents/cfo";




export const salesController = {
    getSuggestion: async (request: AuthenticatedRequest, response: Response) => {
        try {
            const { price } = request.query
            const userId = request.user?.userId || request.body.userId
            if (!price) {
                badRequest(response, "The price is required")
            }

            const numericPrice = Number(price)
            if (isNaN(numericPrice)) {
                badRequest(response, "Price must be a valid number")
            }

            const suggestions = await SalesService.getSuggestion(numericPrice, userId)
            return response.status(200).json({
                success: true,
                data: suggestions
            });


        } catch (error) {
            console.error("Prediction Error:", error);
            return response.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }



    },
    createTransaction: async (request: AuthenticatedRequest, response: Response) => {
        try {
            const { items, totalAmount, mode, customerId } = request.body;
            const userId = request.user?.userId || request.body.userId

            const force = request.query.force === 'true';

            // ---------------------------------------------------------
            // 🤖 CFO AGENT INVOCATION LOGIC
            // ---------------------------------------------------------
            // We invoke the agent ONLY if:
            // 1. Payment Mode is UDHAAR (Credit Risk)
            // 2. OR Total Amount > 5000 (Fat Finger / Anomaly Risk)
            if (!force &&  mode === PaymentMode.UDHAAR) {
                console.log("👮 Suspending transaction... Calling CFO Agent for Audit.");

                const cfoVerdict = await CfoAgentService.evaluateTransaction(
                    userId,
                    totalAmount,
                    mode,
                    customerId
                );

                console.log('cfo verdict', JSON.stringify(cfoVerdict))

                if (cfoVerdict) {
                    // Scenario A: BLOCK
                    // The CFO has deemed this transaction too risky (e.g., Bad Debt).
                    // We DO NOT allow proceeding.
                    if (cfoVerdict.status === 'BLOCK') {
                        return response.status(403).json({
                            success: false,
                            message: "Transaction Blocked by CFO",
                            cfoDecision: cfoVerdict
                        });
                    }

                    // Scenario B: WARN
                    // The CFO flagged an issue (e.g., Fat Finger, High Credit Usage).
                    // We allow proceeding ONLY IF the user explicitly confirms (force=true).
                    if (cfoVerdict.status === 'WARN' && !force) {
                        return response.status(409).json({ // 409 Conflict indicates user needs to resolve state
                            success: false,
                            message: "CFO Warning Triggered",
                            cfoDecision: cfoVerdict,
                            actionRequired: "Review the suggestion. To override, add ?force=true to your request URL."
                        });
                    }
                }
            }

            const result = await SalesService.processTransaction({
                userId,
                items,
                totalAmount,
                mode: mode || PaymentMode.CASH,
                customerId
            })

            return response.status(200).json({
                success: true,
                message: "Transaction Recorded",
                transactionId: result.transactionId,
                nudges: result.nudges
            });
        } catch (error) {
            console.error("Transaction Error:", error);
            return response.status(500).json({
                success: false,
                message: "Failed to record transaction"
            });
        }
    },
    getTransactions: async (req: AuthenticatedRequest, res: Response) => {
        try {
            // 1. Pagination Params
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 20;

            // 2. Filter Params
            const mode = req.query.mode as PaymentMode | undefined;
            const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
            const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;

            // 3. User Context (Hardcoded for Demo)
            const userId = req.user?.userId || req.body.userId

            // console.log(userId)
            // 4. Call Service
            const result = await SalesService.getTransaction(userId, page, limit, {
                mode,
                startDate,
                endDate
            });

            return res.status(200).json({
                success: true,
                ...result
            });

        } catch (error) {
            console.error("Fetch History Error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to retrieve transaction history"
            });
        }
    }
}