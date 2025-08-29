import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const signToken = (payload: object) => {
    return jwt.sign(payload, JWT_SECRET, {  expiresIn: "1d" });
};

export const verifyToken= (token: string) => {
    return jwt.verify(token, JWT_SECRET);
};