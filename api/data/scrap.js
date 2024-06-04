import fs from "fs";

const BASE_URL = "http://nathanael-spriet.fr:1111";
let res;

res = await fetch(BASE_URL + "/cities");
const cities = await res.json();
fs.writeFileSync("./cities.json", JSON.stringify(cities));

res = await fetch(BASE_URL + "/stations");
const stations = await res.json();
fs.writeFileSync(
  "./stations.json",
  JSON.stringify(
    stations.map(({ city: _, cityId: city, ...station }) => ({
      ...station,
      city,
    })),
  ),
);

res = await fetch(BASE_URL + "/users");
const users = await res.json();
fs.writeFileSync("./users.json", JSON.stringify(users));

const history = [];
for (const user of users) {
  res = await fetch(BASE_URL + "/users/history/" + user.id);
  try {
    const userHistory = await res.json();
    history.push(
      ...userHistory.map(
        ({ id, info: { user }, schedule: { id: schedule } }) => ({
          id,
          user,
          schedule,
        }),
      ),
    );
  } catch (e) {}
}
fs.writeFileSync("./tickets.json", JSON.stringify(history));

// import cities from "./cities.json" assert { type: "json" };

const schedules = [];
const travels = [];
for (const from of cities) {
  for (const to of cities) {
    res = await fetch(
      `${BASE_URL}/schedules?cityFrom=${from.id}&cityTo=${to.id}`,
    );

    const apiSchedules = await res.json();
    console.log(from.name, to.name, apiSchedules.length);

    for (const {
      travel: { from, to, ...travel },
    } of apiSchedules) {
      if (!travels.find((t) => t.id === travel.id)) {
        travels.push({
          ...travel,
          from: from.id,
          to: to.id,
        });
      }
    }

    schedules.push(
      ...apiSchedules.map(({ travel: { id: travel }, ...schedule }) => ({
        ...schedule,
        travel,
      })),
    );
  }
}

fs.writeFileSync("./schedules.json", JSON.stringify(schedules));
fs.writeFileSync("./travels.json", JSON.stringify(travels));
