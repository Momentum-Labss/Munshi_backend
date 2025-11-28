import jwt, { type SignOptions } from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "default_secret_key";

interface Payload {
    [key: string]: any;
}
 
export function sign(payload: Payload, expiresIn: string | number = "1d"): string {
    return jwt.sign(payload, SECRET_KEY, { expiresIn } as SignOptions);
}

export function verify(token: string): Payload | null {
    try {
        return jwt.verify(token, SECRET_KEY) as Payload;
    } catch (e) {
        return null;
    }
}

