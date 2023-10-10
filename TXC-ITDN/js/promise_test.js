/*const API_KEY = "e4708f39876f8f6fb9140bbf0210aecfab34f0c3";
const trade_type = "imports";
const date = "2021";
const commodity = "COMM_LVL=HS6";
//const commodity = "I_COMMODITY=10";

async function fetchAndCombineData(API_Call) {
  try {
    const response = await fetch(API_Call);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function yearRequest() {
  try {
    const API_Call1 = `https://api.census.gov/data/timeseries/intltrade/${trade_type}/porths?get=YEAR,I_COMMODITY,CTY_NAME,GEN_VAL_MO,PORT_NAME,CTY_CODE,I_COMMODITY_SDESC&key=${API_KEY}&${commodity}&PORT=23*&YEAR=${date}`;
    const API_Call2 = `https://api.census.gov/data/timeseries/intltrade/${trade_type}/porths?get=YEAR,I_COMMODITY,CTY_NAME,GEN_VAL_MO,PORT_NAME,CTY_CODE,I_COMMODITY_SDESC&key=${API_KEY}&${commodity}&PORT=24*&YEAR=${date}`;
    //const API_Call3 = `https://api.census.gov/data/timeseries/intltrade/${trade_type}/porths?get=YEAR,I_COMMODITY,CTY_NAME,GEN_VAL_MO,PORT_NAME,CTY_CODE,I_COMMODITY_SDESC&key=${API_KEY}&${commodity}&PORT=25*&YEAR=${date}`;
    //const API_Call4 = `https://api.census.gov/data/timeseries/intltrade/${trade_type}/porths?get=YEAR,I_COMMODITY,CTY_NAME,GEN_VAL_MO,PORT_NAME,CTY_CODE,I_COMMODITY_SDESC&key=${API_KEY}&${commodity}&PORT=26*&YEAR=${date}`;

	console.log(API_Call1);
    const data1 = await fetchAndCombineData(API_Call1);
    const data2 = await fetchAndCombineData(API_Call2);
   // const data3 = await fetchAndCombineData(API_Call3);
    //const data4 = await fetchAndCombineData(API_Call4);

    const combinedArray = [...data1, ...data2];

    return combinedArray;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

  yearRequest()
  .then(combinedArray => {
	buildArrayData(combinedArray)
  })

  function buildArrayData(API_DATA){
    let headerCounter = 1; // Initialize a counter for the headers

    // Add the "District", "Port", and "trade_type" headers as column names at the appropriate positions
    API_DATA[0].splice(1, 0, "dist_code", "port_code");
    API_DATA[0].splice(6, 0, "trade_type");


    // Iterate through the array and populate "import" or "export" based on your if statement
    for (let i = 1; i < API_DATA.length; i++) {
        const firstIndexValue = API_DATA[i][0]; // Assuming the first index contains the year

        // Check if the first index value is "YEAR"
        if (firstIndexValue === "YEAR") {
            headerCounter++;
            
            // If it's the second or subsequent occurrence, delete this row
            if (headerCounter > 1) {
                API_DATA.splice(i, 1); // Remove the current row
                //i--; // Adjust the loop counter since the array length has changed
            }
        }


        // Split the 4-digit "port" field into "District" and "Port"
        var port = API_DATA[i][8].toString(); // Assuming "port" is in the second column
        var dist_code = port.slice(0, 2);
        var port_code = port.slice(2, 4);

        // Add the "District" and "Port" values to the sub-array at the appropriate positions
        API_DATA[i].splice(1, 0, dist_code, port_code);
        API_DATA[i].splice(6, 0, "imports");
        
    }
        console.log(API_DATA);
    
}
*/

/* call api in sequence
var post;

// Call the API
fetch('https://jsonplaceholder.typicode.com/posts/5').then(function (response) {
	if (response.ok) {
		return response.json();
	} else {
		return Promise.reject(response);
	}
}).then(function (data) {

	// Store the post data to a variable
	post = data;

	// Fetch another API
	return fetch('https://jsonplaceholder.typicode.com/users/' + data.userId);

}).then(function (response) {
	if (response.ok) {
		return response.json();
	} else {
		return Promise.reject(response);
	}
}).then(function (userData) {
	console.log(post, userData);
}).catch(function (error) {
	console.warn(error);
});
*/
const API_KEY = "e4708f39876f8f6fb9140bbf0210aecfab34f0c3";

async function fetchAndCombineData(API_Call) {
  try {
    const response = await fetch(API_Call);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function yearRequest(startYear, endYear) {
  try {
    const tradeTypes = ['imports', 'exports']; // Define trade types

    const allData = []; // Store all data here

    for (let year = startYear; year <= endYear; year++) {
      for (const tradeType of tradeTypes) {
        const dataField = tradeType === 'imports' ? 'GEN_VAL_MO' : 'ALL_VAL_MO';
        const API_Call = `https://api.census.gov/data/timeseries/intltrade/${tradeType}/statehs?get=YEAR,STATE,CTY_NAME,${dataField},CTY_CODE&key=${API_KEY}&YEAR=${year}`;

        // Make the API call sequentially
        const data = await fetchAndCombineData(API_Call);
        allData.push(data);
      }
    }

    return allData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

yearRequest(2020, 2022) // Replace with your desired start and end years
  .then(allData => {
    buildArrayData(allData);
  });

function buildArrayData(allData) {
  // Your data processing code here
  // ...
  console.log(allData);
}
