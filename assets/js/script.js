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

function coordsToCity(lat, long)
{
  let url = OCD_GEOC_URL + "q=" + lat + "+" + long + "&key=" + OCD_API_KEY;

  let city;
  $.get(url, function(data)
  {
    console.log(data);
    // TODO: return city from response ('city, st')
  });
  return city;
}

function cityToCoords(city)
{
  let url = OCD_GEOC_URL + "q=" + city + "&key=" + OCD_API_KEY;

  let coords = [1, 2];
  $.get(url, function(data)
  {
    console.log(data);
    // TODO: return coords[] ([0] = lat, [1] = long) from response
    coords[0] = (data.results[0].geometry.lat);
    coords[1] = (data.results[0].geometry.lng);
    console.log(coords);
  });
  console.log(coords);
  return coords;
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

  let hello = [0, 2, 3];
  hello[3] = 4;
  console.log(hello);

  // Get coords and update times
  let coords = cityToCoords(lastSearch);
  console.log(coords);
  updateTimes(coords[0], coords[1]);
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
