dateTimeInput.value = toLocalISOString(new Date());

function selectArrivalLocation(theLocation) {
  hiddenTo.value = locations[theLocation];
  toInput.value = theLocation;
  if (hiddenFrom.value === "") {
    fromInput.focus();
  }
}
