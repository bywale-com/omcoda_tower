import { handle } from "hono/vercel";
import { app } from "../../server/auth-service/app";

// Keep this entry free of wire-service imports (Twilio). Wire is api/wire only.
export const config = {
  runtime: "nodejs",
  memory: 1024,
  maxDuration: 10,
};

export default handle(app);
