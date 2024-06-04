const fromInput = document.querySelector("#from");
const toInput = document.querySelector("#to");

const hiddenFrom = document.querySelector("#hidden-from");
const hiddenTo = document.querySelector("#hidden-to");

const dateTimeInput = document.querySelector("#datetime");

const dataList = document.querySelector("#location-list");
const locationContainer = document.querySelector(".locations-container");

let locations = {};

let actualLocation = null;

fetch(BASE_URL + "/cities")
  .then((res) => res.json())
  .then((cities) => addLocations(cities, "c"))
  .catch((e) => toastError(e, "Impossible de récupérer les villes"));

fetch(BASE_URL + "/stations")
  .then((res) => res.json())
  .then((stations) => addLocations(stations, "s"))
  .catch((e) => toastError(e, "Impossible de récupérer les stations"));

toInput.onfocus = () => {
  actualLocation = "to";
  updateList();
  locationContainer.classList.add("active");
};

fromInput.onfocus = () => {
  actualLocation = "from";
  updateList();
  locationContainer.classList.add("active");
};

toInput.onblur = fromInput.onblur = () => {
  locationContainer.classList.remove("active");
  if (fromInput.value in locations) {
    hiddenFrom.value = locations[fromInput.value];
    if (actualLocation === null && hiddenTo.value === "") {
      toInput.focus();
      return;
    }
  } else if (fromInput.value === "") {
    hiddenFrom.value = "";
  } else {
    if (hiddenFrom.value === "") {
      fromInput.value = "";
    } else {
      fromInput.value = Object.keys(locations).find(
        (key) => locations[key] === hiddenFrom.value
      );
    }
  }

  if (toInput.value in locations) {
    hiddenTo.value = locations[toInput.value];
    if (actualLocation === null && hiddenFrom.value === "") {
      fromInput.focus();
      return;
    }
  } else if (toInput.value === "") {
    hiddenTo.value = "";
  } else {
    if (hiddenTo.value === "") {
      toInput.value = "";
    } else {
      toInput.value = Object.keys(locations).find(
        (key) => locations[key] === hiddenTo.value
      );
    }
  }
  actualLocation = null;
};

toInput.onkeyup = fromInput.onkeyup = updateList;

function addLocations(locationsToAdd, type) {
  for (const theLocation of locationsToAdd) {
    const item = document.createElement("li");
    const value = type + theLocation.id;
    item.onpointerdown = selectLocation.bind(null, value, theLocation.name);

    const typeElement = document.createElement("span");
    typeElement.textContent = type === "c" ? "Ville" : "Gare";
    const nameElement = document.createElement("p");
    nameElement.textContent = theLocation.name;
    item.appendChild(typeElement);
    item.appendChild(nameElement);

    dataList.insertAdjacentElement(
      type === "c" ? "afterbegin" : "beforeend",
      item
    );

    locations[theLocation.name] = value;
  }

  if (hiddenFrom.value.startsWith(type)) {
    fromInput.value = Object.keys(locations).find(
      (key) => locations[key] === from
    );
  }
  if (hiddenTo.value.startsWith(type)) {
    toInput.value = Object.keys(locations).find((key) => locations[key] === to);
  }
}

function updateList() {
  const input = actualLocation === "from" ? fromInput.value : toInput.value;
  for (const element of dataList.children) {
    const elementName = element.querySelector("p").textContent;
    if (
      input === "" ||
      elementName.toLowerCase().includes(input.toLowerCase())
    ) {
      element.style.display = "";
    } else {
      element.style.display = "none";
    }
  }
}

function selectLocation(value, text) {
  switch (actualLocation) {
    case "from":
      hiddenFrom.value = value;
      fromInput.value = text;
      break;
    case "to":
      hiddenTo.value = value;
      toInput.value = text;
      break;
  }
  // A little trick to show the next only on click
  actualLocation = null;
}

function toLocalISOString(date) {
  const localDate = new Date(date - date.getTimezoneOffset() * 60000);

  localDate.setSeconds(null);
  localDate.setMilliseconds(null);
  return localDate.toISOString().slice(0, -1);
}
