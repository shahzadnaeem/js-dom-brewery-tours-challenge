
// ========================================================

// Config and State

const tourBreweryTypes = [ "micro", "brewpub", "regional" ]

const state = {
    state: "",
    breweriesHeadingEl: "",
    breweriesListEl: "",
    breweriesData: [],
    filters: {
        breweryType: ""
    },
    status: "Idle"
}

// ========================================================

// Initialise - State and Listeners

function initialiseSearchListener() {
    const searchButton = document.querySelector('#select-state-form')

    searchButton.addEventListener('submit', (ev) => {
        ev.preventDefault()

        state.state = ev.target[0].value
        // ev.target.reset()

        fetchAndRender()
    })
}

function initialiseFilterByTypeListener() {
    const filter = document.querySelector('#filter-by-type');

    filter.addEventListener('change', (ev) => {

        state.filters.breweryType = ev.target.value

        fetchAndRender()
    })
}

// Initialises the app - state and listeners
function initialise() {

    state.breweriesHeadingEl = document.querySelector('#breweries-heading')
    state.breweriesListEl    = document.querySelector('#breweries-list')

    initialiseSearchListener()
    initialiseFilterByTypeListener()

    fetchAndRender()
}

// ========================================================

// Render

function renderBreweries() {
    state.breweriesData.forEach(brewery => renderBrewery(brewery))
}

function renderPhoneNumber(phoneNumber) {
    if (phoneNumber === null) {
      return "N/A"
    }
    return phoneNumber
  }
  
function renderBrewery(brewery) {

    const li = document.createElement('li')
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
    </section>`

    state.breweriesListEl.appendChild(li)
}

function render() {
    renderBreweries()
}

// ========================================================

// Fetch

function getUrl() {
    let url = `https://api.openbrewerydb.org/breweries?by_state=${state.state}`

    if ( state.filters.breweryType !== "") {
        url = url + `&by_type=${state.filters.breweryType}`
    }

    return url
}

function setBreweryData(rawData) {
    let breweriesWithTours = []

    breweriesWithTours = rawData.filter( (b) => tourBreweryTypes.includes( b.brewery_type ) ) 

    state.breweriesData = breweriesWithTours
}

function getBreweriesHeading() {
    let breweriesHeading = "List of Breweries"

    if ( state.state !== "" ) {
        breweriesHeading = breweriesHeading + ` for '${state.state}'`
    }

    if ( state.filters.breweryType !== "" ) {
        breweriesHeading = breweriesHeading + ` [type='${state.filters.breweryType}']`
    }

    return breweriesHeading
}

function fetchAndRender() {

    state.breweriesListEl.innerHTML = "";

    state.breweriesHeadingEl.innerText = getBreweriesHeading()

    if ( state.state === "" ) {
        state.breweriesListEl.innerHTML = '<p class="no-state-selected">No state selected</p>'
        return
    }

    // We have an actual state that we need to fetch data for

    const url = getUrl()

    fetch(url)
    .then( resp => resp.json())
    .then( data => {
      setBreweryData(data)
    //   console.log(data)
      render()
    })
}

// ========================================================

// Initialise the app

initialise()
