import travels from "./travels.json" assert { type: "json" };
import cities from "./cities.json" assert { type: "json" };
import stations from "./stations.json" assert { type: "json" };

const citiesTravels = [];
for (const travel of travels) {
  const cityFrom = cities.find(
    (city) =>
      city.id === stations.find((station) => station.id === travel.from).city,
  );
  const cityTo = cities.find(
    (city) =>
      city.id === stations.find((station) => station.id === travel.to).city,
  );

  const cityTravel = citiesTravels.find(
    ([from, to]) =>
      (from === cityFrom.name && to === cityTo.name) ||
      (from === cityTo.name && to === cityFrom.name),
  );
  if (!cityTravel) {
    citiesTravels.push([cityFrom.name, cityTo.name]);
    console.log(cityFrom.name + " <=> " + cityTo.name);
  }
}
