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
    },
    askStream: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { query } = req.body;

            if (!query) {
                return res.status(400).json({ success: false, message: "Query is required" });
            }

            const userId = req.user?.userId || req.body.userId;

            if (!userId) {
                return res.status(401).json({ success: false, message: "User ID not found" });
            }

            console.log(`📡 Starting stream for userId: ${userId}, query: "${query}"`);

            // Set SSE headers
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
            res.flushHeaders();

            // Variables to track final result
            let finalIntent = 'UNKNOWN';
            let finalMessage = '';
            let finalData: any = null;
            let isVisual = false;

            // Stream responses
            for await (const update of MasterAgentService.streamRequest(userId, query)) {
                console.log('Stream update:', update);

                // Send instant acknowledgment
                if (update.type === 'acknowledgment' && 'message' in update) {
                    res.write(`data: ${JSON.stringify({
                        type: 'acknowledgment',
                        message: update.message
                    })}\n\n`);
                }

                // Send waiting messages
                if (update.type === 'waiting' && 'message' in update) {
                    res.write(`data: ${JSON.stringify({
                        type: 'waiting',
                        message: update.message
                    })}\n\n`);
                }

                // Stream LLM text chunks to frontend
                if (update.type === 'text' && 'chunk' in update && 'fullText' in update) {
                    res.write(`data: ${JSON.stringify({
                        type: 'text',
                        chunk: update.chunk,
                        fullText: update.fullText
                    })}\n\n`);
                }

                // Collect final result data
                if (update.type === 'complete' && 'reply' in update && 'dataPoint' in update) {
                    finalIntent = 'FINANCE_ANSWER';
                    finalMessage = update.reply || '';
                    finalData = update.dataPoint;
                    isVisual = false;
                } else if (update.type === 'INVENTORY_DRAFT' && 'message' in update && 'data' in update) {
                    finalIntent = update.type;
                    finalMessage = update.message || '';
                    finalData = update.data;
                    isVisual = 'isVisual' in update ? update.isVisual || false : false;
                } else if (update.type === 'UNKNOWN' && 'message' in update && 'data' in update) {
                    finalIntent = update.type;
                    finalMessage = update.message || '';
                    finalData = update.data;
                    isVisual = 'isVisual' in update ? update.isVisual || false : false;
                }
            }

            // Send final complete response
            res.write(`data: ${JSON.stringify({
                type: 'final',
                success: true,
                intent: finalIntent,
                reply: finalMessage,
                payload: finalData,
                isVisual: isVisual
            })}\n\n`);

            res.end();

        } catch (error: any) {
            console.error('Streaming error:', error);

            if (!res.headersSent) {
                return res.status(500).json({
                    success: false,
                    message: error?.message || 'Streaming failed'
                });
            }

            res.write(`data: ${JSON.stringify({
                type: 'error',
                message: error?.message || 'Something went wrong'
            })}\n\n`);
            res.end();
        }
    }
};