import type { Config, Context } from "@netlify/functions";

import stations from "./data/stations.json";
import cities from "./data/cities.json";

export function getStation({
  city: cityId,
  ...station
}: (typeof stations)[number]) {
  const city = cities.find((city) => city.id === cityId);
  if (!city) {
    throw new Error(`Unable to find city with id ${cityId}`);
  }

  return { ...station, city: city.name, cityId };
}

export default async (req: Request, context: Context) => {
  if (req.method !== "GET") {
    context.next();
  }
  return Response.json(stations.map(getStation));
};

export const config: Config = {
  path: "/api/stations",
};
