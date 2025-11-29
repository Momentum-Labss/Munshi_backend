import type { Response } from "express";

export function badRequest(response: Response, message: string){
    return response.status(400).json({
        success : false,
        message
    })
}

export function serverError(response: Response){
    return response.status(500).json({
        success : false,
        message : "Internal Server Error"
    })
}

export function ok(response: Response, body: Record<string, unknown>){
    return response.status(200).json({ success: true, ...body })
}


