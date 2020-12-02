// TODO: Pull most recent search automatically from localStorage on load

/** Handles click of search button. Saves most recent search to localStorage and fetches relevant data from API */
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
