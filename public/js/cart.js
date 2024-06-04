const scheduleList = document.querySelector("#schedule-list");
const orderList = document.querySelector("#order-list");
const totalElement = document.querySelector("#order-price");
const payButton = document.querySelector("#pay-button");

let total = 0;

fetchCart(cart);

payButton.onclick = () => {
  document.location.href = "./book.html?price=" + total.toFixed(2);
};

async function fetchCart(cart) {
  if (cart.length === 0) {
    showEmptyCart();
    return;
  }
  for (const scheduleId of cart) {
    fetch(BASE_URL + "/schedules/info/" + scheduleId)
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw res;
      })
      .then((schedule) => {
        const [arrivalHours, arrivalMinutes] = schedule.departureTime.split(":");
        const arrivalMinutesNumber = Number(arrivalHours) * 60 + Number(arrivalMinutes) + schedule.travel.duration;
        const arrivalTime = durationToString(arrivalMinutesNumber);

        const orderItem = document.createElement("li");
        orderItem.textContent = "1 voyage ";
        const span = document.createElement("span");
        span.textContent = toPrice(schedule.price);
        orderItem.appendChild(span);
        orderList.appendChild(orderItem);

        const item = createTravel(
          {
            id: scheduleId,
            date: new Date(schedule.date),
            price: schedule.price,
            type: schedule.travel.type,
            from: schedule.travel.from.name,
            to: schedule.travel.to.name,
            departureTime: schedule.departureTime,
            arrivalTime,
          },
          orderItem
        );

        scheduleList.appendChild(item);

        total += Number(schedule.price);
        updateTotal();
      })
      .catch(async (e) => {
        const error = await createErrorElement(e);
        scheduleList.appendChild(error);
      });
  }
}

function createTravel(schedule, orderItem) {
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
  date.textContent = "Le " + schedule.date.toLocaleDateString() + " de " + schedule.departureTime + " à " + schedule.arrivalTime;
  details.appendChild(date);
  const price = document.createElement("span");
  price.classList.add("price");
  price.textContent = toPrice(schedule.price);
  details.appendChild(price);

  scheduleElement.appendChild(details);
  const hr = document.createElement("hr");
  scheduleElement.appendChild(hr);
  const button = document.createElement("button");
  button.onclick = deleteSchedule.bind(null, schedule, scheduleElement, orderItem);
  button.textContent = "Supprimer ce voyage";
  button.innerHTML += `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.0554 4.48047H14.7698V3.21C14.7693 2.88915 14.6417 2.58157 14.4147 2.35473C14.1878 2.12789 13.8802 2.00032 13.5593 2H10.4402C10.1194 2.00042 9.81188 2.12803 9.58505 2.35486C9.35822 2.58169 9.23061 2.88922 9.23019 3.21V4.48047H2.94458C2.81197 4.48047 2.68479 4.53315 2.59103 4.62692C2.49726 4.72068 2.44458 4.84786 2.44458 4.98047C2.44458 5.11308 2.49726 5.24026 2.59103 5.33402C2.68479 5.42779 2.81197 5.48047 2.94458 5.48047H3.30029L4.95142 20.2978C5.00334 20.7661 5.22622 21.1987 5.57734 21.5128C5.92847 21.8269 6.38314 22.0004 6.85425 22H16.9724C17.4397 21.9996 17.8907 21.8285 18.2406 21.5188C18.5905 21.2091 18.8152 20.7821 18.8723 20.3184L20.6903 5.48047H21.0554C21.188 5.48047 21.3152 5.42779 21.409 5.33402C21.5027 5.24026 21.5554 5.11308 21.5554 4.98047C21.5554 4.84786 21.5027 4.72068 21.409 4.62692C21.3152 4.53315 21.188 4.48047 21.0554 4.48047ZM10.2302 3.21C10.2302 3.1543 10.2523 3.10089 10.2917 3.06151C10.3311 3.02212 10.3845 3 10.4402 3H13.5594C13.587 2.99995 13.6143 3.00534 13.6399 3.01587C13.6654 3.0264 13.6886 3.04186 13.7081 3.06137C13.7277 3.08087 13.7432 3.10404 13.7538 3.12954C13.7644 3.15505 13.7698 3.18239 13.7698 3.21V4.48047H10.2302V3.21ZM17.8801 20.1973C17.8526 20.4187 17.7451 20.6224 17.578 20.7702C17.4109 20.918 17.1955 20.9997 16.9724 21H6.85425C6.62914 21.0003 6.41186 20.9174 6.24414 20.7673C6.07642 20.6171 5.97008 20.4103 5.94556 20.1865L4.30688 5.48047H19.6833L17.8801 20.1973ZM8.45093 9.95605L8.96558 18.1924C8.97371 18.3247 8.92903 18.4548 8.84133 18.5542C8.75364 18.6537 8.63009 18.7142 8.4978 18.7227C8.48706 18.7237 8.47632 18.7237 8.46606 18.7237C8.33897 18.7235 8.21672 18.6749 8.12414 18.5878C8.03155 18.5008 7.97556 18.3817 7.96753 18.2549L7.45288 10.0186C7.44475 9.88627 7.48943 9.75614 7.57712 9.65673C7.66482 9.55732 7.78836 9.49675 7.92065 9.48831C7.98635 9.48339 8.05237 9.49167 8.11483 9.51265C8.17728 9.53363 8.23491 9.56689 8.28432 9.61047C8.33373 9.65406 8.37393 9.70708 8.40254 9.76643C8.43115 9.82578 8.4476 9.89025 8.45093 9.95605ZM15.0339 18.1924L15.5491 9.95605C15.5526 9.89032 15.5692 9.82594 15.5979 9.76669C15.6265 9.70744 15.6667 9.65449 15.7161 9.61095C15.7655 9.5674 15.823 9.53412 15.8854 9.51306C15.9477 9.492 16.0137 9.48358 16.0793 9.48828C16.2116 9.49672 16.3352 9.55729 16.4229 9.6567C16.5106 9.75611 16.5552 9.88624 16.5471 10.0185L16.032 18.2549C16.024 18.3817 15.968 18.5007 15.8754 18.5878C15.7828 18.6749 15.6606 18.7234 15.5335 18.7236C15.5227 18.7236 15.5125 18.7236 15.5017 18.7226C15.3694 18.7142 15.2459 18.6536 15.1582 18.5542C15.0705 18.4548 15.0258 18.3247 15.0339 18.1924H15.0339ZM11.4998 18.2705V9.94043C11.4998 9.80782 11.5524 9.68064 11.6462 9.58688C11.74 9.49311 11.8671 9.44043 11.9998 9.44043C12.1324 9.44043 12.2595 9.49311 12.3533 9.58688C12.4471 9.68064 12.4998 9.80782 12.4998 9.94043V18.2705C12.4998 18.4031 12.4471 18.5303 12.3533 18.6241C12.2595 18.7178 12.1324 18.7705 11.9998 18.7705C11.8671 18.7705 11.74 18.7178 11.6462 18.6241C11.5524 18.5303 11.4998 18.4031 11.4998 18.2705Z"></path></svg>`;
  scheduleElement.appendChild(button);

  return scheduleElement;
}

function deleteSchedule(schedule, scheduleElement, orderItem) {
  cart = cart.filter((id) => id !== schedule.id);
  window.sessionStorage.setItem("cart", JSON.stringify(cart));
  scheduleElement.remove();
  orderItem.remove();
  total -= Number(schedule.price);
  updateTotal();
  if (cart.length === 0) {
    showEmptyCart();
    document.querySelector(".cart").remove();
  } else {
    document.querySelector("#items-number").textContent = cart.length.toString();
  }
}

function updateTotal() {
  totalElement.textContent = toPrice(total.toFixed(2));
}

function showEmptyCart() {
  const emptyCart = document.createElement("p");
  emptyCart.textContent = "Votre panier est vide.";
  scheduleList.appendChild(emptyCart);
  const emptyOrder = document.createElement("p");
  emptyOrder.textContent = "Votre commande est vide.";
  orderList.appendChild(emptyOrder);
  payButton.disabled = true;
}
