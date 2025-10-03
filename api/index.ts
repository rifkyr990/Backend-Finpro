import { VercelRequest, VercelResponse } from "@vercel/node";
import App from "../src/app";

// inisialisasi express app TANPA listen()
const appInstance = new App(3000);

// ambil express instance dari class App
const app = (appInstance as any).app;

// export ke Vercel handler
export default (req: VercelRequest, res: VercelResponse) => {
  (app as any)(req, res);
};
