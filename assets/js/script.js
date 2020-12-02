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
  // Get most recent search from localStorage
  let storage = window.localStorage; // Reference localStorage
  let lastSearch = storage.getItem("lastSearch");

  // Verify a recent search exists
  if (lastSearch === null) // If no recent search is saved
  {
    if (currentPos === undefined) // If no access to users current location
    return; // Return early, no need to go through rest of function

    // Get users coordinates from location and pass to update times
    let lat = currentPos.coords.latitude, long = currentPos.coords.longitude;
    updateTimes(lat, long);

    return; // Return early, no need to go through rest of function
  }

  // Set #input_search value to lastSearch
  $("#input_search").val(lastSearch);

  // Get coords and update times from city
  let coords = cityToCoords(lastSearch);
}
loadRecent(); // Load most recent search immediately upon site load

/**
 * Updates the solar times using the new geolocation
 * @param  {String} lat  - the lattitude DD coord
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
    console.log("UTC Times:", sunriseUTC, noonUTC, sunsetUTC);

    // Convert Times UTC -> Local
    let now = luxon.DateTime.fromJSDate(new Date()); // Create Luxon.DateTime object from current JS date
    let sunrise = utcToLocal(now, sunriseUTC);
    let noon = utcToLocal(now, noonUTC);
    let sunset = utcToLocal(now, sunsetUTC);
    console.log("Local Times:", sunrise, noon, sunset);
  });
}

/**
 * [utcToLocal description]
 * @param  {Luxon.DateTime} now     - set to today, necessary to ensure proper
 *                                    conversion during all times of year (DST)
 * @param  {String} timeUTC         - (H:M***AM/PM) the time to convert to local
 * @return {String}                 - the converted local time (0-23:0-59)
 */
function utcToLocal (now, timeUTC)
{
  let am = timeUTC.includes('AM') ? true : false; // short way to determine if AM or not

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
  // If it is not AM, and not 12 PM, we add 12 hours, 7PM -> 19 (military hour)
  else
  {
    if (hour != 12)
      hour += 12;
  }

  // Creates a Luxon.DateTime object from the UTC time we parsed and then
  // returns it as local time.
  let utcTime = luxon.DateTime.utc(now.year, now.month, now.day, hour, min);
  let localTime = utcTime.toLocal();
  return ("0"+localTime.hour).slice(-2) + ":" + ("0"+localTime.minute).slice(-2);
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

  // Save most recent search to localStorage
  let storage = window.localStorage;
  storage.setItem("lastSearch", input) // Input is saved under the key 'lastSearch'

  console.log("#input_search.val():", input); // Log value of search input to console.

  // Get coords from input and update sunrise/sunset times
  cityToCoords(input);
});
