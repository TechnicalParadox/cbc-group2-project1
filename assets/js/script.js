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
 * @param  {[type]} city [description]
 * @return {[type]}      [description]
 */
function cityToCoords(city)
{
  let url = OCD_GEOC_URL + "q=" + city + "&key=" + OCD_API_KEY;

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

function updateTimes(lat, long, date)
{
  // form URL to call API
  let url = "";
  if (date === undefined) // If date isn't provided, do not use date in url
    url = SS_API_URL + "lat=" + lat + "&lng=" + long;
  else // If date is provided, use date in url
    url = SS_API_URL + "lat=" + lat + "&lng=" + long + "&date=" + date;

  console.log(url);
  $.get(url, function(data)
  {
    console.log(data);
    // TODO: process repsonse and update times displayed on page
  });
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

  console.log(input); // Log value of search input to console.

  // Get coords from input and update sunrise/sunset times
  let coords = cityToCoords(input);
  updateTimes(coords[0], coords[1]);
});
