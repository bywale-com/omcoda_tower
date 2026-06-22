import { handle } from "hono/vercel";
import { app } from "../../server/auth-service/app";

export const config = {
  runtime: "nodejs",
};

export default handle(app);
