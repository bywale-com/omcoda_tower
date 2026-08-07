import { handle } from "hono/vercel";
import { app } from "../../server/wire-service/app";

export const config = {
  runtime: "nodejs",
};

export default handle(app);
