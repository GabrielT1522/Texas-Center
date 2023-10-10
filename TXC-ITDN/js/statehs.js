let start_year = document.getElementById("start-year-input").value;
let end_year = document.getElementById("end-year-input").value;

let count=0
for(let i=start_year;i<=end_year;i++){
    console.log(i);
    count++;
    
}
console.log(count-1+" years between "+start_year+" and "+end_year);

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
