import prisma from "../utils/prismaClient"
import { randomUUID } from "crypto"
import { sendOTP } from "../utils/resend"

const tempStore: Record<string, { email: string; otp: string; timeoutId: NodeJS.Timeout }> = {}
const OTP_EXPIRY_MS = 1000 * 60 * 2 // 2 minutes

function cleanupTempStore(tempId: string) {
  if (tempStore[tempId]) {
    clearTimeout(tempStore[tempId].timeoutId)
    delete tempStore[tempId]
  }
}

export const AuthService = {
  async signup(email: string) {
    const existingUser = await prisma.user.findUnique({ where: { emailId: email } })

    if (existingUser?.isVerified) {
      throw new Error("User already exists. Please sign in.")
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const tempId = randomUUID()
    const timeoutId = setTimeout(() => cleanupTempStore(tempId), OTP_EXPIRY_MS)

    tempStore[tempId] = { email, otp, timeoutId }

    await prisma.user.upsert({
      where: { emailId: email },
      update: { isVerified: false },
      create: { emailId: email, isVerified: false },
    })

    if (process.env.NODE_ENV !== "production") {
      console.log(`[SIGNUP] OTP for ${email}: ${otp}`)
    } else {
      const sendOk = await sendOTP(otp, email)
      if (!sendOk) throw new Error("OTP could not be sent")
    }

    return { tempId }
  },

  async signupVerify(tempId: string, otp: string) {
    const tempData = tempStore[tempId]
    if (!tempData) throw new Error("Invalid or expired session")
    if (tempData.otp !== otp) throw new Error("Invalid OTP")

    const user = await prisma.user.update({
      where: { emailId: tempData.email },
      data: { isVerified: true },
    })

    cleanupTempStore(tempId)
    return user
  },

  async signin(email: string) {
    const user = await prisma.user.findUnique({ where: { emailId: email } })
    if (!user) throw new Error("User not found. Please sign up first.")
    if (!user.isVerified) throw new Error("User not verified. Please complete signup first.")

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const tempId = randomUUID()
    const timeoutId = setTimeout(() => cleanupTempStore(tempId), OTP_EXPIRY_MS)
    tempStore[tempId] = { email, otp, timeoutId }

    if (process.env.NODE_ENV !== "production") {
      console.log(`[SIGNIN] OTP for ${email}: ${otp}`)
    } else {
      const sendOk = await sendOTP(otp, email)
      if (!sendOk) throw new Error("OTP could not be sent")
    }

    return { tempId }
  },

  async signinVerify(tempId: string, otp: string) {
    const tempData = tempStore[tempId]
    if (!tempData) throw new Error("Invalid or expired session")
    if (tempData.otp !== otp) throw new Error("Invalid OTP")

    const user = await prisma.user.findUnique({
      where: { emailId: tempData.email },
    })
    if (!user || !user.isVerified) throw new Error("User not verified or does not exist.")

    cleanupTempStore(tempId)
    return user
  }
}
