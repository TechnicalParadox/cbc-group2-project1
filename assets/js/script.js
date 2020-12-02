/** Sunset Sunrise API url example https://sunrise-sunset.org/api
  * leaving out date defaults to current
  * https://api.sunrise-sunset.org/json?lat=36.7201600&lng=-4.4203400&date=2020-12-02
  */
 let SS_API_URL = "https://api.sunrise-sunset.org/json?";

/** Loads the most recent search from localStorage and changes #input_search 's
placeholder value to the most recent search */
function loadRecent()
{
  // Get most recent search from localStorage
  let storage = window.localStorage; // Reference localStorage
  let lastSearch = storage.getItem("lastSearch");

  // Verify a recent search exists
  if (lastSearch === null) // If no recent search is saved lastRecent === null is true
    return; // Return early, no need to go through rest of function

  // Set #input_search placeholder to lastSearch.
  $("#input_search").attr("placeholder", lastSearch);

  // TODO: Automatically fetch data using lastSearch and populate screen with info
}
loadRecent(); // Load most recent search immediately upon load

/** Handles click of search button. Saves most recent search to localStorage and
 fetches relevant data from API */
$("#button_search").click(function()
{
  // Get input value from #input_search
  let input = $("#input_search").val();

  // Save most recent search to localStorage
  let storage = window.localStorage;
  storage.setItem("lastSearch", input) // Input is saved under the key 'lastSearch'

  console.log(input); // Log value of search input to console.

  // TODO: fetch sunrise/sunset data from OpenWeatherAPI
});
