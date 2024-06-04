import type { Config, Context } from "@netlify/functions";

import users from "./data/users.json";

let i = Math.floor(Math.random() * 10000);

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    context.next();
  }
  const { info, schedules } = await req.json();

  if (!info) {
    return new Response("info is not specified", { status: 400 });
  }

  if (!schedules) {
    return new Response("schedules is not specified", { status: 400 });
  }

  if (!Array.isArray(schedules)) {
    return new Response("schedules is not an array", { status: 400 });
  }

  if (schedules.length === 0) {
    return new Response("schedules is empty", { status: 400 });
  }

  if (info.user) {
    const user = users.find((user) => Number(info.user) === user.id);
    if (!user) {
      return new Response("User not found", { status: 404 });
    }
  }

  return Response.json(
    schedules.map((schedule) => ({ id: i++, info, schedule })),
  );
};

export const config: Config = {
  path: "/api/book",
};
