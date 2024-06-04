import type { Config, Context } from "@netlify/functions";

import users from "./data/users.json";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    context.next();
  }
  const { mail, password } = await req.json();

  if (!mail || !password) {
    return new Response("", { status: 400 });
  }
  const user = users.find((user) => user.mail === mail);
  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  if (password !== user.mail) {
    return new Response("Password is not correct", { status: 403 });
  }

  return new Response(user.id.toString());
};

export const config: Config = {
  path: "/api/login",
};
