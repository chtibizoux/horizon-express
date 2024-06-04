if (userId === null) {
  document.location.href = "./";
}

const ticketList = document.querySelector("#ticket-list");

document.querySelector("#logout").onclick = () => {
  window.sessionStorage.removeItem("userId");
  document.location.href = "./";
};

fetchHistory();

function setAccountInfo(user) {
  document.querySelector("#name").textContent =
    `${user.firstname} ${user.surname}`;
  document.querySelector("#mail").textContent = user.mail;
  document.querySelector("#mail").href = "mailto:" + user.mail;
  document.querySelector("#address").innerHTML =
    `${user.address.number} ${user.address.street}<br>${user.address.postcode} ${user.address.city}`;
}

async function fetchHistory() {
  try {
    const res = await fetch(BASE_URL + "/users/history/" + userId);
    if (!res.ok) {
      throw res;
    }
    try {
      const tickets = await res.json();
      for (const { schedule } of tickets) {
        const [arrivalHours, arrivalMinutes] =
          schedule.departureTime.split(":");
        const arrivalMinutesNumber =
          Number(arrivalHours) * 60 +
          Number(arrivalMinutes) +
          schedule.travel.duration;
        const arrivalTime = durationToString(arrivalMinutesNumber);

        ticketList.append(
          createTravel({
            id: schedule.id,
            date: new Date(schedule.date),
            price: schedule.price,
            type: schedule.travel.type,
            from: schedule.travel.from.name,
            to: schedule.travel.to.name,
            departureTime: schedule.departureTime,
            arrivalTime,
          }),
        );
      }
    } catch (e) {
      if (e instanceof SyntaxError) {
        throw new Error("Impossible de récupérer les billets");
      } else {
        throw e;
      }
    }
  } catch (e) {
    const error = await createErrorElement(e);
    ticketList.appendChild(error);
  }
}

function createTravel(schedule) {
  const scheduleElement = document.createElement("li");
  scheduleElement.classList.add("schedule");
  const travel = document.createElement("div");
  travel.classList.add("travel");
  const type = document.createElement("span");
  type.classList.add("type");
  type.textContent = schedule.type;
  travel.appendChild(type);

  const h3 = document.createElement("h3");
  const departure = document.createElement("span");
  departure.textContent = schedule.from;
  h3.appendChild(departure);
  h3.innerHTML += `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14.8281 6.137L19.0223 10.531L19.0233 10.532C19.7089 11.2703 19.7089 12.3297 19.0233 13.0681L14.8223 17.4691L14.8207 17.4707C14.7142 17.5772 14.5399 17.7 14.35 17.7C14.1801 17.7 14.0023 17.6437 13.8793 17.5207C13.7563 17.3977 13.7 17.2199 13.7 17.05C13.7 16.8806 13.756 16.7032 13.8784 16.5802L17.7665 12.5H5.04998C4.69475 12.5 4.39997 12.2053 4.39997 11.85C4.39997 11.6797 4.45621 11.4959 4.56373 11.3525C4.67259 11.2074 4.83771 11.1 5.04998 11.1H17.7665L13.8776 7.01901L13.8719 7.01249C13.6464 6.73067 13.6365 6.32213 13.8793 6.07931C14.0023 5.95632 14.1801 5.90002 14.35 5.90002C14.5207 5.90002 14.7044 5.95748 14.8281 6.137Z"></path></svg>`;
  const arrival = document.createElement("span");
  arrival.textContent = schedule.to;
  h3.appendChild(arrival);
  travel.appendChild(h3);

  scheduleElement.appendChild(travel);

  const details = document.createElement("div");
  details.classList.add("details");
  const date = document.createElement("span");
  date.textContent =
    "Le " +
    schedule.date.toLocaleDateString() +
    " de " +
    schedule.departureTime +
    " à " +
    schedule.arrivalTime;
  details.appendChild(date);
  const price = document.createElement("span");
  price.classList.add("price");
  price.textContent = toPrice(schedule.price);
  details.appendChild(price);

  scheduleElement.appendChild(details);

  return scheduleElement;
}
