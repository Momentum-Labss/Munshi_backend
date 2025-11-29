import { Resend } from "resend";


const resend_api_key = process.env.RESEND_API_KEY ?? new Error("Resend API KEY IS REQUIRED")
const resend = new Resend()


export const sendOTP = (otp : string, to : string) => {
    try {
        resend.emails.send({
            from: 'onboarding@resend.dev',
            to,
            subject: 'Verification OTP',
            html: `<p>Your verification OTP is ${otp}</p>`
        });
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}