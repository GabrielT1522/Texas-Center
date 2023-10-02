API_Call1 = "https://api.census.gov/data/timeseries/intltrade/exports/porths";
API_Call2 = "https://api.census.gov/data/timeseries/intltrade/imports/porths";
API_Call3 = "https://api.census.gov/data/timeseries/intltrade/exports/statehs";
API_Call4 = "https://api.census.gov/data/timeseries/intltrade/imports/statehs";

Promise.all([
    fetch(API_Call1),
    fetch(API_Call2),
    fetch(API_Call3),
    fetch(API_Call4)
]).then(function (responses) {
	// Get a JSON object from each of the responses
	return Promise.all(responses.map(function (response) {
		return response.json();
	}));
}).then(function (data) {
	// Log the data to the console
	// You would do something with both sets of data here
	console.log(data);
}).catch(function (error) {
	// if there's an error, log it
	console.log(error);
});