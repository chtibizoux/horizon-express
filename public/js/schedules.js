const ABSOLUTE_BASE_URL = BASE_URL.startsWith("http")
  ? BASE_URL
  : document.location.origin + BASE_URL;
const params = new URLSearchParams(document.location.search);

const from = params.get("from");
const to = params.get("to");
const dateTime = params.get("datetime");
const bound = params.get("bound");

if (!from || !to || !dateTime || !bound) {
  document.location.href = "./";
}

const scheduleList = document.querySelector("#schedule-list");

dateTimeInput.value = dateTime;
document.querySelector("#bound").value = bound;
hiddenFrom.value = from;
hiddenTo.value = to;

document.querySelector("#switch-locations").onclick = () => {
  [fromInput.value, toInput.value] = [toInput.value, fromInput.value];
};

searchSchedules(from, to, new Date(dateTime), bound);

async function searchSchedules(from, to, date, bound) {
  try {
    const url = new URL(ABSOLUTE_BASE_URL + "/schedules");
    url.searchParams.set(
      (from[0] === "c" ? "city" : "station") + "From",
      from.slice(1),
    );
    url.searchParams.set(
      (to[0] === "c" ? "city" : "station") + "To",
      to.slice(1),
    );
    url.searchParams.set(
      "date",
      `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
    );
    url.searchParams.set(
      "time" + (bound === "from" ? "From" : "To"),
      `${date.getHours()}:${date.getMinutes()}`,
    );

    const res = await fetch(url);

    if (!res.ok) {
      throw res;
    }
    const schedules = await res.json();
    if (schedules.length === 0) {
      throw new Error("Pas de trajets disponibles");
    }

    for (const schedule of schedules) {
      const [arrivalHours, arrivalMinutes] = schedule.departureTime.split(":");
      const arrivalMinutesNumber =
        Number(arrivalHours) * 60 +
        Number(arrivalMinutes) +
        schedule.travel.duration;
      const arrivalTime = durationToString(arrivalMinutesNumber);

      const item = createTravel({
        id: schedule.id,
        price: schedule.price,
        type: schedule.travel.type,
        stations: [
          { ...schedule.travel.from, time: schedule.departureTime },
          { ...schedule.travel.to, time: arrivalTime },
        ],
        duration: durationToString(schedule.travel.duration),
      });
      scheduleList.appendChild(item);
    }
  } catch (e) {
    const error = await createErrorElement(e);
    scheduleList.appendChild(error);
  }
}

function createTravel(travel) {
  const item = document.createElement("li");
  item.classList.add("schedule");
  const details = document.createElement("button");
  details.classList.add("details");
  const stations = document.createElement("ul");
  stations.classList.add("stations");

  for (const station of travel.stations) {
    const stationElement = document.createElement("li");
    const time = document.createElement("strong");
    time.textContent = station.time;
    stationElement.appendChild(time);
    const stationName = document.createElement("span");
    stationName.textContent = station.name;
    stationElement.appendChild(stationName);
    stations.appendChild(stationElement);
  }
  details.appendChild(stations);
  details.appendChild(document.createElement("hr"));

  const infos = document.createElement("div");
  infos.classList.add("extra-infos");
  infos.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C10.0222 2 8.08879 2.58649 6.4443 3.6853C4.79981 4.78412 3.51809 6.3459 2.76121 8.17317C2.00433 10.0004 1.8063 12.0111 2.19215 13.9509C2.578 15.8907 3.53041 17.6725 4.92894 19.0711C6.32746 20.4696 8.10929 21.422 10.0491 21.8079C11.9889 22.1937 13.9996 21.9957 15.8268 21.2388C17.6541 20.4819 19.2159 19.2002 20.3147 17.5557C21.4135 15.9112 22 13.9778 22 12C21.997 9.34877 20.9424 6.80699 19.0677 4.93228C17.193 3.05758 14.6512 2.00303 12 2ZM12 21C10.22 21 8.47991 20.4722 6.99987 19.4832C5.51983 18.4943 4.36628 17.0887 3.68509 15.4442C3.0039 13.7996 2.82567 11.99 3.17294 10.2442C3.5202 8.49836 4.37737 6.89471 5.63604 5.63604C6.89472 4.37737 8.49836 3.5202 10.2442 3.17293C11.99 2.82567 13.7996 3.0039 15.4442 3.68508C17.0887 4.36627 18.4943 5.51983 19.4832 6.99987C20.4722 8.47991 21 10.22 21 12C20.9973 14.3861 20.0482 16.6737 18.361 18.361C16.6737 20.0482 14.3861 20.9973 12 21ZM17.3755 7.55273C17.4219 7.59915 17.4588 7.65425 17.4839 7.71491C17.509 7.77556 17.522 7.84058 17.522 7.90623C17.522 7.97188 17.509 8.0369 17.4839 8.09755C17.4588 8.15821 17.4219 8.21331 17.3755 8.25973L12.3213 13.3134C12.2749 13.3599 12.2198 13.3967 12.1591 13.4218C12.0985 13.447 12.0334 13.4599 11.9678 13.4599C11.9021 13.4599 11.8371 13.447 11.7765 13.4218C11.7158 13.3967 11.6607 13.3599 11.6143 13.3134L7.87207 9.57129C7.77988 9.47721 7.72854 9.35055 7.7292 9.21884C7.72987 9.08712 7.78249 8.96098 7.87563 8.86784C7.96877 8.7747 8.0949 8.72208 8.22662 8.72142C8.35834 8.72075 8.485 8.7721 8.57907 8.86429L11.9677 12.253L16.6684 7.55276C16.7148 7.50631 16.77 7.46947 16.8306 7.44433C16.8913 7.41919 16.9563 7.40625 17.022 7.40625C17.0876 7.40624 17.1526 7.41918 17.2133 7.44431C17.274 7.46945 17.3291 7.50629 17.3755 7.55273Z"></path></svg>`;

  const duration = document.createElement("span");
  duration.textContent = travel.duration;
  infos.appendChild(duration);

  const trainType = document.createElement("span");
  trainType.textContent = travel.type;
  infos.appendChild(trainType);
  details.appendChild(infos);
  item.appendChild(details);

  const priceContainer = document.createElement("button");
  priceContainer.classList.add("price-container");
  const span = document.createElement("span");
  span.textContent = "dès";
  priceContainer.appendChild(span);
  const price = document.createElement("h3");
  price.textContent = toPrice(travel.price);
  priceContainer.appendChild(price);

  priceContainer.onclick = details.onclick = addToCart.bind(null, travel.id);
  item.appendChild(priceContainer);
  return item;
}

function addToCart(scheduleId) {
  if (cart.includes(scheduleId)) {
    toast("Déjà ajouté au panier", "error");
    return;
  }

  toast("Ajouté au panier", "good");

  cart.push(scheduleId);
  window.sessionStorage.setItem("cart", JSON.stringify(cart));

  const cartItemsNumber = document.querySelector("#items-number");
  if (cartItemsNumber) {
    cartItemsNumber.textContent = cart.length.toString();
  } else {
    setCart();
  }
}
