import users from "./data/users.json";
import type { Config, Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  if (req.method !== "GET") {
    context.next();
  }
  return Response.json(users);
};

export const config: Config = {
  path: "/api/users",
};
