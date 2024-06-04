const params = new URLSearchParams(document.location.search);
const form = document.querySelector("form");
const submitButton = document.querySelector('button[type="submit"]');

if (userId) {
  redirect();
}

form.onsubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  submitButton.disabled = true;
  submitButton.classList.add("loading");
  try {
    const res = await fetch(BASE_URL + "/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        mail: formData.get("mail"),
        password: formData.get("password"),
      }),
    });
    if (!res.ok) {
      throw res;
    }

    const userId = await res.text();
    window.sessionStorage.setItem("userId", userId);
    redirect();
  } catch (e) {
    submitButton.disabled = false;
    submitButton.classList.remove("loading");
    await toastError(e, "Erreur lors de la connexion");
  }
};

function redirect() {
    document.location = document.location.origin + params.get("redirect");
}
