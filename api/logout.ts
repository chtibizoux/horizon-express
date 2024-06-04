import type { Config, Context } from "@netlify/functions";

import users from "./data/users.json";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    context.next();
  }

  const { id } = await req.json();

  if (!id) {
    return new Response("", { status: 400 });
  }

  const user = users.find((user) => user.id === id);

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  return new Response("");
};

export const config: Config = {
  path: "/api/logout",
};
