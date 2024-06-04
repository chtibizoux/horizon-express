import type { Config, Context } from "@netlify/functions";

import users from "./data/users.json";

export default async (req: Request, context: Context) => {
  if (req.method !== "GET") {
    context.next();
  }

  if (!context.params.userId) {
    return new Response("", { status: 400 });
  }

  const user = users.find((user) => Number(context.params.userId) === user.id);

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  return Response.json(user);
};

export const config: Config = {
  path: "/api/users/info/:userId",
};
