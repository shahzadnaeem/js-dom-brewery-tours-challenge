// ========================================================

// Config and State

const tourBreweryTypes = ["micro", "brewpub", "regional"];

const INITIALISING = "INITIALISING...";
const IDLE = "IDLE";
const FETCHING = "FETCHING...";
const DONE = "DONE";
const NO_DATA = "NO_DATA";
const FETCH_ERROR = "FETCH_ERROR";

const state = {
  state: "",
  breweriesHeadingEl: "",
  breweriesListEl: "",
  breweriesData: [],
  breweryCities: {},
  filters: {
    breweryType: "",
    cities: [],
  },
  status: "",
  statusSpanEl: "",
};

// ========================================================

// Initialise - State and Listeners

function initialiseSearchListener() {
  const searchButton = document.querySelector("#select-state-form");

  searchButton.addEventListener("submit", (ev) => {
    ev.preventDefault();

    state.state = ev.target[0].value;
    // ev.target.reset()

    fetchAndRender();
  });
}

function initialiseFilterByTypeListener() {
  const filter = document.querySelector("#filter-by-type");

  filter.addEventListener("change", (ev) => {
    state.filters.breweryType = ev.target.value;

    fetchAndRender();
  });
}

// Initialises the app - state and listeners
function initialise() {
  state.breweriesHeadingEl = document.querySelector("#breweries-heading");
  state.breweriesListEl = document.querySelector("#breweries-list");
  state.statusDivEl = document.querySelector("#status");

  setStatus(INITIALISING);

  initialiseSearchListener();
  initialiseFilterByTypeListener();

  fetchAndRender();
}

// ========================================================

// Render

function renderStatus() {
  state.statusDivEl.innerText = state.status;

  if (state.status.toLocaleLowerCase().includes("error")) {
    state.statusDivEl.className = "status-error";
  } else {
    if (state.status === NO_DATA) {
      state.statusDivEl.className = "status-no-data";
    } else if (state.status.includes(DONE)) {
      state.statusDivEl.className = "status-done";
    } else {
      state.statusDivEl.className = "";
    }
  }
}

function renderBreweries() {
  state.breweriesData.forEach((brewery) => renderBrewery(brewery));
}

function renderPhoneNumber(phoneNumber) {
  if (phoneNumber === null) {
    return "N/A";
  }
  return phoneNumber;
}

function renderBrewery(brewery) {
  const li = document.createElement("li");
  li.innerHTML = `<h2>${brewery.name}</h2>
    <div class="type">${brewery.brewery_type}</div>
    <section class="address">
      <h3>Address:</h3>
      <p>${brewery.street}</p>
      <p><strong>${brewery.city}, ${brewery.postal_code}</strong></p>
    </section>
    <section class="phone">
      <h3>Phone:</h3>
      <p>${renderPhoneNumber(brewery.phone)}</p>
    </section>
    <section class="link">
      <a href="${brewery.website_url}" target="_blank">Visit Website</a>
    </section>`;

  state.breweriesListEl.appendChild(li);
}

function render() {
  renderStatus();
  renderBreweries();

  if (state.breweriesData.length === 0) {
    setStatus(NO_DATA);
  } else {
    setStatus(DONE);
  }
}

// ========================================================

function setStatus(status) {
  if (typeof status !== "string") {
    state.status = FETCH_ERROR + `  ${status.message}`;
  } else {
    const numBreweries = state.breweriesData.length;

    let statusString = status;

    if (numBreweries) {
      statusString += `  [${numBreweries} breweries, ${state.breweryCities.length} cities]`;
    }

    state.status = statusString;
  }

  renderStatus();
}

function setBreweryCities() {
  state.breweryCities = {};

  state.breweriesData.forEach((b) => {
    state.breweryCities[b.city] = true;
  });

  state.breweryCities = Object.keys(state.breweryCities).sort();

  console.log(state.breweryCities);
}

function setBreweryData(rawData) {
  let breweriesWithTours = [];

  breweriesWithTours = rawData.filter((b) =>
    tourBreweryTypes.includes(b.brewery_type)
  );

  state.breweriesData = breweriesWithTours;

  setBreweryCities();
}

// ========================================================

// Fetch

function getUrl() {
  let url = `https://api.openbrewerydb.org/breweries?by_state=${state.state}`;

  if (state.filters.breweryType !== "") {
    url = url + `&by_type=${state.filters.breweryType}`;
  }

  return url;
}

function getBreweriesHeading() {
  let breweriesHeading = "List of Breweries";

  if (state.state !== "") {
    breweriesHeading = breweriesHeading + ` for '${state.state}'`;
  }

  if (state.filters.breweryType !== "") {
    breweriesHeading =
      breweriesHeading + ` [type='${state.filters.breweryType}']`;
  }

  return breweriesHeading;
}

function fetchAndRender() {
  state.breweriesListEl.innerHTML = "";
  state.breweriesData = [];

  state.breweriesHeadingEl.innerText = getBreweriesHeading();

  if (state.state === "") {
    setStatus(IDLE);
    state.breweriesListEl.innerHTML =
      '<p class="no-state-selected">No state selected</p>';
    return;
  }

  // We have an actual state that we need to fetch data for

  const url = getUrl();

  setStatus(FETCHING);

  // Fake an extra delay to see the Status update!

  setTimeout(
    () =>
      fetch(url)
        .then((resp) => resp.json())
        .then((data) => {
          setBreweryData(data);
          render();
        })
        .catch((err) => {
          setStatus(err);
        }),
    500 + Math.floor(Math.random() * 500)
  );
}

// ========================================================

// Initialise the app

initialise();
