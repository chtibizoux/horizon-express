import type { Config, Context } from "@netlify/functions";

import cities from "./data/cities.json";

export default async (req: Request, context: Context) => {
  if (req.method !== "GET") {
    context.next();
  }
  return Response.json(cities);
};

export const config: Config = {
  path: "/api/cities",
};
