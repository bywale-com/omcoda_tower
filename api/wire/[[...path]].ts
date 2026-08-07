import { handle } from "hono/vercel";
import { app } from "../../server/wire-service/app";

export const config = {
  runtime: "nodejs",
  memory: 1024,
  maxDuration: 15,
};

export default handle(app);
