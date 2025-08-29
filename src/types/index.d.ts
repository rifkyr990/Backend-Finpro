import type { JwtUserPayload } from "../../utils/token";

declare global {
    namespace Express {
        interface Request {
            user?: JwtUserPayload;
        }
    }
}
export {};
