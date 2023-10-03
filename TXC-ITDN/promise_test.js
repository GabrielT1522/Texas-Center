
function yearRequest(){
	API_Call1 = "https://api.census.gov/data/timeseries/intltrade/imports/porths?get=YEAR,I_COMMODITY,CTY_NAME,GEN_VAL_MO,PORT_NAME,CTY_CODE,I_COMMODITY_SDESC&key=e4708f39876f8f6fb9140bbf0210aecfab34f0c3&COMM_LVL=HS6&PORT=23*&YEAR=2021";
	API_Call2 = "https://api.census.gov/data/timeseries/intltrade/imports/porths?get=YEAR,I_COMMODITY,CTY_NAME,GEN_VAL_MO,PORT_NAME,CTY_CODE,I_COMMODITY_SDESC&key=e4708f39876f8f6fb9140bbf0210aecfab34f0c3&COMM_LVL=HS6&PORT=24*&YEAR=2021";
	API_Call3 = "https://api.census.gov/data/timeseries/intltrade/imports/porths?get=YEAR,I_COMMODITY,CTY_NAME,GEN_VAL_MO,PORT_NAME,CTY_CODE,I_COMMODITY_SDESC&key=e4708f39876f8f6fb9140bbf0210aecfab34f0c3&COMM_LVL=HS6&PORT=25*&YEAR=2021";
	API_Call4 = "https://api.census.gov/data/timeseries/intltrade/imports/porths?get=YEAR,I_COMMODITY,CTY_NAME,GEN_VAL_MO,PORT_NAME,CTY_CODE,I_COMMODITY_SDESC&key=e4708f39876f8f6fb9140bbf0210aecfab34f0c3&COMM_LVL=HS6&PORT=26*&YEAR=2021";

	var combinedArray = [];
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
		// Combine the JSON data into a 2x2 array
		

		// Assuming each data element is an array, you can concatenate them
		// For simplicity, this example assumes each data element has the same structure
		if (data.length >= 4) {
			combinedArray.push(data[0], data[1]);
			combinedArray.push(data[2], data[3]);
		}

	}).catch(function (error) {
		// If there's an error, log it
		console.log(error);
	});
	return combinedArray;
}