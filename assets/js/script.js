/** Sunset Sunrise API url example https://sunrise-sunset.org/api
* leaving out date defaults to current, no API key needed
* https://api.sunrise-sunset.org/json?lat=36.7201600&lng=-4.4203400&date=2020-12-02
*/
const SS_API_URL = "https://api.sunrise-sunset.org/json?";

/** OpenCageData API url example https://opencagedata.com/api
* Reverse geocoding
* https://api.opencagedata.com/geocode/v1/json?q=LAT+LNG&key=YOUR-API-KEY
* Forward geocoding
* https://api.opencagedata.com/geocode/v1/json?q=PLACENAME&key=YOUR-API-KEY
*/
const OCD_GEOC_URL = "https://api.opencagedata.com/geocode/v1/json?";
const OCD_API_KEY = "1758919effee418b9b3316a3343b24df";

/*
 * When burger appears in navbar on smaller screen sizes this will make the burger functional
 */
const burgerButton = document.querySelector("#burger-bar");
const navbarMenu = document.querySelector(".navbar-menu");

burgerButton.addEventListener('click', () => {
  navbarMenu.classList.toggle('is-active');
});

/* End burger  */




// Load switch states on page load
function loadSwitchStates()
{
  // Get states from localStorage
  let storage = window.localStorage;

  let timeType = storage.getItem("type-time");
  let timezone = storage.getItem("timezone");
  let location = storage.getItem("location");

  if (timeType == "true")
  {
    $("#switch-civ-time").find("div").find("input").prop("checked", true);
    $("#span-type-time").addClass("has-text-warning").html("Civilian");
  }
  else
  {
    $("#switch-civ-time").find("div").find("input").prop("checked", false);
    $("#span-type-time").removeClass("has-text-warning").html("Military");
  }

  if (timezone == "true")
  {
    $("#switch-search-timezone").find("div").find("input").prop("checked", true);
    $("#span-timezone").addClass("has-text-info").html("Searched");
  }
  else
  {
    $("#switch-search-timezone").find("div").find("input").prop("checked", false);
    $("#span-timezone").removeClass("has-text-info").html("Local");
  }

  if (location == "true")
  {
    $("#switch-html5-location").find("div").find("input").prop("checked", true);
    $("#span-location").addClass("has-text-danger").html("On");
  }
  else
  {
    $("#switch-html5-location").find("div").find("input").prop("checked", false);
    $("#span-location").removeClass("has-text-danger").html("Off");
  }
}
loadSwitchStates();

/** Attempt to get users location with HTML5 */
if (navigator.geolocation)
{
  navigator.geolocation.getCurrentPosition(loadRecent); // Call loadRecent, passing location
}

/**
 * Fetch DD Coordinates using City and updateTimes using coords
 * @param  {String} city - really just any place to get coords of
 * @return {undefined}   - no return, callback after fetch calls updateTimes
 */
function cityToCoords(city)
{
  let url = OCD_GEOC_URL + "q=" + city + "&key=" + OCD_API_KEY;
  console.log("cityToCoords URL:", url);

  $.get(url, function(data)
  {
    // Get lat/lng out of response
    let lat = (data.results[0].geometry.lat);
    let lng = (data.results[0].geometry.lng);

    // Update times with coordinates.
    updateTimes(lat, lng);
  });
}

/**
* Loads most recent search or attempts to pull user location, changes
* #input_search's placeholder to be relevant, calls update to data fetch
* function while passing coords.
* @param  {[type]} currentPos - [optional] the users current location, to be
*                              if no previous search is saved.
*/
function loadRecent(currentPos)
{
  // TODO: should populate recent searches navbar dropdown

  // Get most recent search from localStorage
  let storage = window.localStorage; // Reference localStorage
  let lastSearch = storage.getItem("recentSearches"); // WARNING: value is not actually the lastSearch yet

  // Verify a recent search exists // TODO: simplify this function by removing currentPos parameter
  if (lastSearch === null) // If no recent search is saved
  {
    if (currentPos === undefined) // If no access to users current location
      return; // Return early, no need to go through rest of function

    // Get users coordinates from location and pass to update times
    let lat = currentPos.coords.latitude, long = currentPos.coords.longitude;
    updateTimes(lat, long);

    return; // Return early, no need to go through rest of function
  }

  // Parse array of recentSearches from stringified data
  lastSearch = (JSON.parse(lastSearch))[0]; // Value is now the lastSearch

  // Set #input_search value to lastSearch
  $("#input_search").val(lastSearch);

  // Get coords and update times from city
  let coords = cityToCoords(lastSearch);
}
loadRecent(); // Load most recent search immediately upon site load

/** Populates the recent searches menu. If there are no recent searches then the menu is hidden. */
function populateRecents()
{
  let recentListDiv = $("#dropdown-recents");
  recentListDiv.empty(); // Empty the existing menu

  let recentListDD = $("#searched-cities");

  // Load recents from localStorage
  let storage = window.localStorage;
  let recents = storage.getItem("recentSearches");
  // recentSearches does not exist, so we hide recents menu
  if (recents === null)
  {
    recentListDD.hide();
  }
  // Otherwise, parse recents and populate dropdown
  else
  {
    recentListDD.show(); // Make sure is shown the dropdown menu (in case previously hidden)

    recents = JSON.parse(recents); // parse existing recents into array
    for (let s of recents) // Go through each recent search and ad to dropdown
    {
      let search = '<a id="recent-search" class="navbar-item has-text-white" id="navbar-itm-3">' +
        s + "</div>";
      recentListDiv.append(search);
    }
  }
}
populateRecents(); // Populate recents menu immediately upon load

/**
 * Updates the solar times using the new geolocation
 * @param  {String} lat  - the lattitude DD coordinate
 * @param  {String} long - the longitude DD coordinate
 * @param  {// TODO:} date - in future will be used to check solar times of different dates
 * @return {undefined}
 */
function updateTimes(lat, long, date)
{
  // form URL to call API
  let url = "";
  if (date === undefined) // If date isn't provided, do not use date in url
    url = SS_API_URL + "lat=" + lat + "&lng=" + long;
  else // If date is provided, use date in url
    url = SS_API_URL + "lat=" + lat + "&lng=" + long + "&date=" + date;

  console.log("updateTimes URL:", url);
  $.get(url, function(data)
  {
    // Get UTC times from response
    let sunriseUTC = data.results.sunrise;
    let noonUTC = data.results.solar_noon;
    let sunsetUTC = data.results.sunset;
    console.log("UTC Times (12hr):", sunriseUTC, noonUTC, sunsetUTC);

    // Convert Times UTC -> Local
    let now = luxon.DateTime.fromJSDate(new Date()); // Create Luxon.DateTime object from current JS date
    let sunrise = utcToLocal(now, sunriseUTC);
    let noon = utcToLocal(now, noonUTC);
    let sunset = utcToLocal(now, sunsetUTC);
    console.log("Local Times (24hr):", sunrise, noon, sunset);

    // Check if user wants times displayed in civilian time and convert if so
    let storage = window.localStorage;
    if (storage.getItem("type-time") == "true")
    {
      sunrise = milToCiv(sunrise);
      noon = milToCiv(noon);
      sunset = milToCiv(sunset);
    }

    // Display times
    $("#time_sunrise").html(sunrise);
    $("#time_noon").html(noon);
    $("#time_sunset").html(sunset);
  });
}

/**
 * Converts time from UTC (12hr) to Local (24hr)
 * @param  {Luxon.DateTime} now     - set to today, necessary to ensure proper
 *                                    conversion during all times of year (DST).
 *                                    It's passed so that we don't have to create
 *                                    a DateTime object for every conversion.
 * @param  {String} timeUTC         - (H:M***AM/PM) the time to convert to local
 * @return {String}                 - the converted local time (0-23:0-59)
 */
function utcToLocal (now, timeUTC)
{
  // THIS SHALL BE FOREVER IMMORTALIZED AS THE STUPIDEST THING I HAVE EVER DONE
  // To make things better, it was originally a full if statement... - Tech
  /* let am = timeUTC.includes('AM') ? true : false; // short way to determine if AM or not */
  let am = timeUTC.includes('AM');

  let word = "", hour = 0, min = 0; // quick-init variables we need
  let phase = 0; // counter num to determine which section of the time is being processed

  // Loop through every character of the UTC time and determine the hour and minute's values
  for (char of timeUTC)
  {
    if (char == ":") // if : we know we have read the previous segment
    {
      phase++; // move to next phase/segment

      switch (phase) // check which phase we are in
      {
        case 1: // Phase 1 obtains the hour value and resets word to ""
          hour = parseInt(word);
          word = "";
          break;
        case 2: // Phase 2 obtains the minute value
          min = parseInt(word);
          break;

        default:
          break;
      }
    }
    else // if not : we add the character to our current word
      word += char;

  }
  // We now have hour and minute integer values that represent the fetched
  // UTC solar time.

// We convert the hours from a 12 hour system to 24 hour military time
// We must do this because we need to enter an hour in 24 hour format for Luxon
  // If it is 12am, we set the hour to 0
  if (am)
  {
    if (hour == 12)
      hour = 0;
  }
  // If it is not AM, and not 12 PM, we add 12 hours, ex. 7PM -> 19 (military hour)
  else
  {
    if (hour != 12)
      hour += 12;
  }

  // Creates a Luxon.DateTime object from the UTC time we parsed and then
  // returns it as local time.
  let utcTime = luxon.DateTime.utc(now.year, now.month, now.day, hour, min);
  let localTime = utcTime.toLocal();
  // We prefix the hour and minute with a '0', potentially turning 12 into 012,
  // but we only keep the last 2 digits, ensuring that hour '9' displays at '09', etc.
  return ("0"+localTime.hour).slice(-2) + ":" + ("0"+localTime.minute).slice(-2);
}

/**
 * Converts military time into civilian time
 * @param  {String} time - The time in military time
 * @return {String}      - The time in civilian time
 */
function milToCiv(time)
{
  // Get hour/minute from military time
  let hour, minute;
  let segment = "";
  for (let c of time) // For each character in time
  {
    if (c == ":")
    {
      hour = segment;
      segment = "";
    }
    else
      segment += c;
  }
  minute = segment;

  // Convert hour from military to civilian
  let hourNum = parseInt(hour);
  let amPM;
  if (hourNum >= 12)
  {
    amPM = " PM";
    if (hourNum != 12)
      hourNum -= 12;
  }
  else
  {
    amPM = " AM";
    if (hourNum == 0)
      hourNum += 12;
  }
  hour = hourNum;

  return (hourNum + ":" + minute + amPM);
}

/**
 * Converts civilian time into military time
 * @param  {String} time - The time in civilian time
 * @return {String}      - The time in military time
 */
function civToMil(time)
{
  let am = time.includes("AM");
  let hour, minute;
  let segment = "";
  for (let c of time) // For each character in time
  {
    if (c == ":")
    {
      hour = segment;
      segment = "";
    }
    else if (c == " ")
      minute = segment;
    else
      segment += c;
  }

  if (am)
  {
    if (hour == 12)
    {
      hour = 0;
    }
  }
  else
  {
    if (hour != 12)
    {
      hour = parseInt(hour) + 12;
    }
  }

  return ("0"+hour).slice(-2) + ":" + ("0"+minute).slice(-2);
}

/** Handles click of search button. Saves most recent search to localStorage and
fetches relevant data from API */
$("#button_search").click(function()
{
  // Get input value from #input_search
  let input = $("#input_search").val();

  // Return out if input is empty
  if (input == "")
    return;

  // Load most recent searches array from localStorage (if any) and then save newest/possibly replace oldest
  let storage = window.localStorage;
  let recents = storage.getItem("recentSearches");
  if (recents === null) // recentSearches does not exist, so we just save the recent and in future it will exist
  {
    recents = [input]; // Set recents to be an array with the input value
    storage.setItem("recentSearches", JSON.stringify(recents)); // save stringified array to recentSearches
  }
  else // recent searches does exist, so we will maintain up to 10 recent searches
  {
    recents = JSON.parse(recents); // parse existing recents into array

    // Clear previous entries that are the same search to prevent duplicates
    let alreadyIn = $.inArray(input, recents);
    if (alreadyIn != -1)
    {
      // We splice out the old entry, because the new one will be added to front
      recents.splice(alreadyIn, 1);
    }

    recents.unshift(input); // add newest search to the front of storage

    // maintain up to 10 recents by popping once we get to the 11th
    if (recents.length > 10)
      recents.pop();
    storage.setItem("recentSearches", JSON.stringify(recents)); // save updated recents to localStorage
  }

  // Populate recents menu
  populateRecents();

  console.log("#input_search.val():", input); // Log value of search input to console.

  // Get coords from input and update sunrise/sunset times
  cityToCoords(input);
});

/** Handles click on item in recent seraches menu, runs new search */
$("#dropdown-recents").on('click', '#recent-search', function()
{
  let search = $(this).html();
  // Update search bar
  $("#input_search").val(search);
  // Get coords from input and update sunrise/sunset times
  cityToCoords(search);
});

$(".field").on('click', '.switch', function()
{

  // Get spanID from switch label to indentify switch and get checked value
  let switchID = $(this).parent().parent().attr('id');
  let switchVal = $(this).prop("checked")

  // Save switch state to localStorage after indentifying switch by spanID
  // and make changes to page as needed
  let storage = window.localStorage;
  switch (switchID)
  {
    case "switch-civ-time": // Military/Civilian toggle switch
      storage.setItem("type-time", switchVal);
      updateExistingTimes(switchVal);
      break;
    case "switch-search-timezone": // Local/Search timezone switch
      storage.setItem("timezone", switchVal); // TODO:
      break;
    case "switch-html5-location": // Use users location switch
      storage.setItem("location", switchVal); // TODO:
      break;
    default:
      console.log("error");
  }

  loadSwitchStates(); // Make sure switches are updated
});

/**
 * Pull existing times from page and convert them then update (called after military switch is toggled)
 * @param  {boolean} toCiv - if the conversion is to civilian time, else its to Military
 * @return {undefined}
 */
function updateExistingTimes(toCiv)
{
  // Pull existing times
  let sunrise = $("#time_sunrise").html().trim();
  let noon = $("#time_noon").html().trim();
  let sunset = $("#time_sunset").html().trim();

  if (sunrise == "") // there are no times to convert on the page
    return;

  if (toCiv) // convert to civilian time
  {
    sunrise = milToCiv(sunrise);
    noon = milToCiv(noon);
    sunset = milToCiv(sunset);
  }
  else // convert to military time
  {
    sunrise = civToMil(sunrise);
    noon = civToMil(noon);
    sunset = civToMil(sunset);
  }

  // Display updated times
  $("#time_sunrise").html(sunrise);
  $("#time_noon").html(noon);
  $("#time_sunset").html(sunset);
}
