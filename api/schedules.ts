import type { Config, Context } from "@netlify/functions";

import schedules from "./data/schedules.json";
import travels from "./data/travels.json";
import stations from "./data/stations.json";
import cities from "./data/cities.json";
import { getStation } from "./stations.js";

export function getSchedule({
  travel: travelId,
  ...schedule
}: (typeof schedules)[number]) {
  const travel = travels.find((travel) => travel.id === travelId);
  if (!travel) {
    throw new Error("Travel not found");
  }
  const { from: fromId, to: toId, ...travelObject } = travel;

  const from = stations.find((stations) => stations.id === fromId);
  if (!from) {
    throw new Error("From stations not found");
  }

  const to = stations.find((stations) => stations.id === toId);
  if (!to) {
    throw new Error("To stations not found");
  }

  return {
    ...schedule,
    travel: {
      ...travelObject,
      from: getStation(from),
      to: getStation(to),
    },
  };
}

export default async (req: Request, context: Context) => {
  if (req.method !== "GET") {
    context.next();
  }
  const searchParams = new URL(req.url, context.site.url).searchParams;

  let stationFrom = null;
  let cityFrom = null;
  const rawStationFrom = searchParams.get("stationFrom");
  const rawCityFrom = searchParams.get("cityFrom");
  if (rawStationFrom) {
    stationFrom = stations.find((s) => s.id === Number(rawStationFrom));
    if (!stationFrom) {
      return new Response("stationFrom not found", { status: 404 });
    }
  } else if (rawCityFrom) {
    cityFrom = cities.find((c) => c.id === Number(rawCityFrom));
    if (!cityFrom) {
      return new Response("cityFrom not found", { status: 404 });
    }
  } else {
    return new Response("stationFrom or cityFrom not specified", {
      status: 400,
    });
  }

  let stationTo = null;
  let cityTo = null;
  const rawStationTo = searchParams.get("stationTo");
  const rawCityTo = searchParams.get("cityTo");
  if (rawStationTo) {
    stationTo = stations.find((s) => s.id === Number(rawStationTo));
    if (!stationTo) {
      return new Response("stationTo not found", { status: 404 });
    }
  } else if (rawCityTo) {
    cityTo = cities.find((c) => c.id === Number(rawCityTo));
    if (!cityTo) {
      return new Response("cityTo not found", { status: 404 });
    }
  } else {
    return new Response("stationTo or cityTo not specified", { status: 400 });
  }

  let date = null;
  try {
    const rawDate = searchParams.get("date");
    if (rawDate) {
      date = new Date(rawDate);
    }
  } catch (error) {
    return new Response("date is not a valid date", { status: 400 });
  }

  let timeFrom = null;
  const rawTimeFrom = searchParams.get("timeFrom");
  if (rawTimeFrom) {
    timeFrom = toMinutes(rawTimeFrom);
    if (isNaN(timeFrom)) {
      return new Response("timeFrom is not a valid time", { status: 400 });
    }
  }

  let timeTo = null;
  const rawTimeTo = searchParams.get("timeTo");
  if (rawTimeTo) {
    timeTo = toMinutes(rawTimeTo);
    if (isNaN(timeTo)) {
      return new Response("timeTo is not a valid time", { status: 400 });
    }
  }

  return Response.json(
    schedules.map(getSchedule).filter((schedule) => {
      if (stationFrom) {
        if (stationFrom.id !== schedule.travel.from.id) {
          return false;
        }
      } else if (cityFrom?.id !== schedule.travel.from.cityId) {
        return false;
      }

      if (stationTo) {
        if (stationTo.id !== schedule.travel.to.id) {
          return false;
        }
      } else if (cityTo?.id !== schedule.travel.to.cityId) {
        return false;
      }

      if (
        date &&
        new Date(schedule.date).toDateString() !== date.toDateString()
      ) {
        return false;
      }

      const departureTime = toMinutes(schedule.departureTime);
      if (timeFrom && departureTime < timeFrom) {
        return false;
      }

      if (timeTo && departureTime > timeTo) {
        return false;
      }
      return true;
    }),
  );
};

export const config: Config = {
  path: "/api/schedules",
};

function toMinutes(time: String) {
  const [hours, minutes] = time.split(":");
  return Number(hours) * 60 + Number(minutes);
}
