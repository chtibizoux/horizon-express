import type { Config, Context } from "@netlify/functions";

import tickets from "./data/tickets.json";
import users from "./data/users.json";

export default async (req: Request, context: Context) => {
  if (req.method !== "DELETE") {
    context.next();
  }

  if (!context.params.ticketId) {
    return new Response("ticket is not specified", { status: 400 });
  }

  const searchParams = new URL(req.url, context.site.url).searchParams;

  const mail = searchParams.get("mail");
  if (!mail) {
    return new Response("mail is not specified", { status: 400 });
  }

  const ticket = tickets.find(
    (ticket) =>
      Number(context.params.ticketId) === ticket.id &&
      users.find((user) => ticket.user === user.id)?.mail == mail,
  );

  if (!ticket) {
    return new Response("Ticket not found", { status: 404 });
  }

  return Response.json("");
};

export const config: Config = {
  path: "/api/ticket/:ticketId",
};
