import type { Config, Context } from "@netlify/functions";

import schedules from "./data/schedules.json";
import { getSchedule } from "./schedules.js";

export default async (req: Request, context: Context) => {
  if (req.method !== "GET") {
    context.next();
  }

  if (!context.params.scheduleId) {
    return new Response("", { status: 400 });
  }

  const schedule = schedules.find(
    (schedule) => Number(context.params.scheduleId) === schedule.id,
  );

  if (!schedule) {
    return new Response("Schedule not found", { status: 404 });
  }

  return Response.json(getSchedule(schedule));
};

export const config: Config = {
  path: "/api/schedules/info/:scheduleId",
};
