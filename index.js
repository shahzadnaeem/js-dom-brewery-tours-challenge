// ========================================================

// Config and State

const tourBreweryTypes = ["micro", "brewpub", "regional"];

const INITIALISING = "INITIALISING...";
const IDLE = "IDLE";
const FETCHING = "FETCHING...";
const RECEIVING = "RECEIVING ...";
const DONE = "DONE";
const NO_DATA = "NO_DATA";
const FETCH_ERROR = "FETCH_ERROR";

const state = {
  state: "",
  breweriesHeadingEl: "",
  breweriesListEl: "",
  citiesListEl: "",
  breweriesData: [],
  breweryCities: [],
  citiesSelected: 0,
  breweriesDisplayed: 0,
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
  state.citiesListEl = document.querySelector("#filter-by-city-form");
  state.statusDivEl = document.querySelector("#status");

  setStatus(INITIALISING);

  initialiseSearchListener();
  initialiseFilterByTypeListener();

  fetchAndRender();
}

// ========================================================

// Filtering (by city)

function filterByCity(city, include) {
  console.log(city, include);

  if (include) {
    state.filters.cities.push(city);
  } else {
    state.filters.cities = state.filters.cities.filter((c) => c !== city);
  }
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

function shouldRenderByCity(brewery) {
  if (state.filters.cities.length === 0) {
    return true;
  }

  return state.filters.cities.includes(brewery.city);
}

function renderBreweries() {
  state.breweriesListEl.innerHTML = "";
  state.breweriesDisplayed = 0;

  state.breweriesData.forEach((brewery) => {
    if (shouldRenderByCity(brewery)) {
      renderBrewery(brewery);
      state.breweriesDisplayed++;
    }
  });
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

function renderCities() {
  state.citiesListEl.innerHTML = "";

  state.breweryCities.forEach((city) => renderCity(city));
}

function renderCity(city) {
  const label = document.createElement("label");
  const checkbox = document.createElement("input");

  label.setAttribute("for", city);
  label.innerText = city;

  checkbox.checked = state.filters.cities.includes(city);
  checkbox.setAttribute("type", "checkbox");
  checkbox.setAttribute("name", city);
  checkbox.setAttribute("value", city);
  checkbox.addEventListener("change", (ev) => {
    filterByCity(city, checkbox.checked);
    render();
  });

  state.citiesListEl.append(checkbox, label);
}

function render() {
  renderStatus();
  renderBreweries();
  renderCities();

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
      if (state.filters.cities.length === 0) {
        state.citiesSelected = state.breweryCities.length;
      } else {
        state.citiesSelected = state.filters.cities.length;
      }

      statusString += `  [${state.breweriesDisplayed} breweries, ${state.citiesSelected} cities]`;
    }

    state.status = statusString;
  }

  renderStatus();
}

function extractBreweryCities() {
  cities = {};

  state.breweriesData.forEach((b) => {
    cities[b.city] = true;
  });

  state.breweryCities = Object.keys(cities).sort();

  console.log(state.breweryCities);
}

function setBreweryData(rawData) {
  let breweriesWithTours = [];

  breweriesWithTours = rawData.filter((b) =>
    tourBreweryTypes.includes(b.brewery_type)
  );

  state.breweriesData = breweriesWithTours;

  extractBreweryCities();
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

function waitFor(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("done");
    }, ms);
  });
}

function clearStateForNewFetch() {
  state.breweriesListEl.innerHTML = "";
  state.breweriesData = [];
  state.citiesListEl.innerHTML = "";

  state.citiesSelected = 0;
  state.breweriesDisplayed = 0;

  state.filters.cities = [];
  state.breweriesData = [];
}

// This function is async because it uses await to fake an API response delay

async function fetchAndRender() {
  clearStateForNewFetch();

  state.breweriesHeadingEl.innerText = getBreweriesHeading();

  if (state.state === "") {
    setStatus(IDLE);
    state.breweriesListEl.innerHTML =
      '<p class="no-state-selected">No state selected</p>';
    return;
  }

  // We have an actual 'US state' that we need to fetch data for

  const url = getUrl();

  setStatus(FETCHING);

  // Fake an extra delay to see the Status update!
  const fakeFetchDelay = 500 + Math.floor(Math.random() * 500);
  const fakeReceiveDelay = 300;

  await waitFor(fakeFetchDelay);

  // Delay fetch by fake delay - to simulate a slow to respond API
  fetch(url)
    .then(async (resp) => {
      setStatus(RECEIVING);
      await waitFor(fakeReceiveDelay);
      return resp.json();
    })
    .then((data) => {
      setBreweryData(data);
      // We now have the data to successfully call render()
      render();
    })
    .catch((err) => {
      // Sets the error status
      setStatus(err);
    });
}

// ========================================================

// Initialise the app

initialise();
