import z from "zod"



export const authZSchema = z.object({
    email : z.email().describe("Email is required"),
})


export const verifyZSchema = z.object({
    otp : z.string().length(6).describe("OTP is required"),
    tempId : z.string().describe("TempId is required")
})