const params = new URLSearchParams(document.location.search);
const price = params.get("price");

if (cart.length === 0) {
  document.location.href = "./";
}

if (!price) {
  document.location.href = "../../cart.html";
}

const firstname = document.querySelector("#firstname");
const surname = document.querySelector("#surname");
const mail = document.querySelector("#mail");
const number = document.querySelector("#number");
const street = document.querySelector("#street");
const postalCode = document.querySelector("#postal-code");
const city = document.querySelector("#city");
const submitButton = document.querySelector("#submit-button");

document.querySelector("#price").textContent = toPrice(price);

function setAccountInfo(user) {
  firstname.value = user.firstname;
  surname.value = user.surname;
  mail.value = user.mail;
  number.value = user.address.number;
  street.value = user.address.street;
  postalCode.value = user.address.postcode;
  city.value = user.address.city;
}

document.querySelector("form").onsubmit = async (e) => {
  e.preventDefault();
  submitButton.disabled = true;
  submitButton.classList.add("loading");
  try {
    const res = await fetch(BASE_URL + "/book", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        info: {
          firstname: firstname.value,
          surname: surname.value,
          mail: mail.value,
          user: userId || undefined,
          address: {
            number: number.value,
            street: street.value,
            postcode: postalCode.value,
            city: city.value,
          }
        },
        schedules: cart
      }),
    });
    if (!res.ok) {
      throw res;
    }

    const tickets = await res.json();
    console.log(tickets);

    cart = [];
    window.sessionStorage.setItem("cart", JSON.stringify(cart));

    const successSection = document.querySelector("#success");
    successSection.style.display = "";
    successSection.querySelector("p").textContent = `Vous avez payer ${tickets.length} tickets à ${toPrice(price)}`;
  } catch (e) {
    submitButton.disabled = false;
    submitButton.classList.remove("loading");
    await toastError(e, "Erreur lors du payment");
  }
};