const BASE_URL = "/api";
// const BASE_URL = "https://tp-ihm-iut.netlify.app";

const userId = window.sessionStorage.getItem("userId");
const cartString = window.sessionStorage.getItem("cart");
let cart = [];

if (userId) {
  fetchUsername(userId);
} else {
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#account-button").href =
      "./login.html?redirect=" +
      encodeURIComponent(
        document.location.pathname +
          document.location.search +
          document.location.hash,
      );
  });
}

if (cartString) {
  cart = JSON.parse(cartString);
  if (cart.length > 0) {
    document.addEventListener("DOMContentLoaded", () => {
      setCart();
    });
  }
}

async function fetchUsername(userId) {
  try {
    const res = await fetch(BASE_URL + "/users/info/" + userId);
    if (!res.ok) {
      throw res;
    }
    const user = await res.json();

    const accountButton = document.querySelector("#account-button");
    if (accountButton) {
      setUser(accountButton, user);
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        const accountButton = document.querySelector("#account-button");
        setUser(accountButton, user);
      });
    }
  } catch (e) {
    if (e instanceof Response) {
      const msg = await e.text();
      console.error("RequestFailed: " + msg);
      toast("Impossible de récupérer l'utilisateur : " + msg, "error");
    } else {
      console.error(e);
      toast("Impossible de récupérer l'utilisateur : " + e.toString(), "error");
    }
  }
}

function setUser(accountButton, user) {
  accountButton.href = "./account.html";
  const buttonText = accountButton.querySelector("span");
  buttonText.textContent = user.firstname + " " + user.surname;
  document.querySelector("#tickets-button").style.display = "";
  window.setAccountInfo?.(user);
}

async function setCart() {
  const cartElement = document.createElement("a");
  cartElement.href = "./cart.html";
  cartElement.classList.add("cart");
  cartElement.innerHTML = `<span>Panier </span><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5.12076 22H18.8791C19.0018 22 19.1234 21.9753 19.2363 21.9272C19.3493 21.8792 19.4515 21.8088 19.5366 21.7204C19.6218 21.6319 19.6882 21.5272 19.7319 21.4125C19.7757 21.2978 19.7958 21.1754 19.7912 21.0527L19.2731 7.61913C19.2651 7.38295 19.1655 7.15916 18.9953 6.99519C18.8251 6.83122 18.5978 6.73994 18.3615 6.74071H14.6847V4.68505C14.6847 4.33248 14.6153 3.98336 14.4803 3.65762C14.3454 3.33189 14.1477 3.03591 13.8984 2.78661C13.649 2.5373 13.3531 2.33954 13.0273 2.20461C12.7016 2.06969 12.3525 2.00024 11.9999 2.00024C11.6473 2.00024 11.2982 2.06969 10.9725 2.20461C10.6467 2.33954 10.3508 2.5373 10.1015 2.78661C9.85215 3.03591 9.65439 3.33189 9.51947 3.65762C9.38454 3.98336 9.3151 4.33248 9.3151 4.68505V6.74071H5.63834C5.4021 6.73992 5.17483 6.83112 5.00467 6.99499C4.8345 7.15887 4.73482 7.38254 4.72672 7.61864L4.20865 21.0532C4.20405 21.1759 4.22424 21.2982 4.26801 21.4128C4.31178 21.5275 4.37822 21.6322 4.46338 21.7206C4.54853 21.8089 4.65064 21.8793 4.76359 21.9273C4.87655 21.9753 4.99802 22 5.12076 22ZM10.3151 4.68505C10.3151 4.23821 10.4926 3.80968 10.8086 3.49371C11.1245 3.17775 11.5531 3.00024 11.9999 3.00024C12.4467 3.00024 12.8753 3.17775 13.1912 3.49371C13.5072 3.80968 13.6847 4.23821 13.6847 4.68505V6.74071H10.3151V4.68505ZM5.72281 7.74071H9.3151V9.51464C9.3151 9.64725 9.36778 9.77443 9.46154 9.8682C9.55531 9.96197 9.68249 10.0146 9.8151 10.0146C9.94771 10.0146 10.0749 9.96197 10.1687 9.8682C10.2624 9.77443 10.3151 9.64725 10.3151 9.51464V7.74071H13.6847V9.51464C13.6847 9.64725 13.7374 9.77443 13.8312 9.8682C13.9249 9.96197 14.0521 10.0146 14.1847 10.0146C14.3173 10.0146 14.4445 9.96197 14.5383 9.8682C14.632 9.77443 14.6847 9.64725 14.6847 9.51464V7.74071H18.2775L18.8151 21H5.21109L5.72281 7.74071Z"></path></svg>`;

  const span = document.createElement("span");
  span.id = "items-number";
  span.textContent = cart.length.toString();
  cartElement.appendChild(span);

  document.querySelector("header nav").appendChild(cartElement);
}

function durationToString(duration) {
  return (
    (duration / 60 < 10 ? "0" : "") +
    Math.floor(duration / 60) +
    ":" +
    (duration % 60 < 10 ? "0" : "") +
    (duration % 60)
  );
}

function toPrice(price) {
  return price.replace(".", ",") + " €";
}

let toastElement = null;
let timeout = null;

function toast(message, type) {
  if (toastElement) {
    toastElement.remove();
    toastElement = null;
    clearTimeout(timeout);
  }
  toastElement = document.createElement("div");
  toastElement.textContent = message;
  toastElement.classList.add("toast");
  toastElement.classList.add(type);
  document.body.appendChild(toastElement);
  timeout = setTimeout(() => {
    toastElement.remove();
    toastElement = null;
  }, 2000);
}

async function createErrorElement(e) {
  const error = document.createElement("li");
  error.classList.add("error");

  if (e instanceof Response) {
    const msg = await e.text();
    console.error("RequestFailed: " + msg);
    error.textContent = "Requête échouée: " + msg;
  } else if (e instanceof Error) {
    console.error(e);
    error.textContent = e.message;
  } else {
    console.error(e);
    error.textContent = e.toString();
  }

  return error;
}

async function toastError(e, message) {
  if (e instanceof Response) {
    const msg = await e.text();
    console.error("RequestFailed: " + msg);
    toast(message + " : " + msg, "error");
  } else {
    console.error(e);
    toast(message + " : " + e.toString(), "error");
  }
}
