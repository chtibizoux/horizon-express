import type { Config, Context } from "@netlify/functions";

import users from "../data/users.json";
import tickets from "../data/tickets.json";
import schedules from "../data/schedules.json";
import { getSchedule } from "../schedules/index.js";

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

  return Response.json(
    tickets
      .filter((ticket) => ticket.user === user.id)
      .map(({ id, schedule: scheduleId }) => {
        const { id: userId, ...userObject } = user;

        const schedule = schedules.find(
          (schedule) => schedule.id === scheduleId,
        );

        if (!schedule) {
          throw new Error("Schedule not found");
        }

        return {
          id,
          info: { ...userObject, user: userId },
          schedule: getSchedule(schedule),
        };
      }),
  );
};

export const config: Config = {
  path: "/api/users/history/:userId",
};
