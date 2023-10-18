const API_KEY = "e4708f39876f8f6fb9140bbf0210aecfab34f0c3";

let timeout;
function startTimeout() {
  alert("Please be aware that yearly requests may take up to 3 minutes to process.")
  timeout = setTimeout(timeoutMessage, 180000);
}

function timeoutMessage(){
  timeoutMessage = '<center><h2>You request has timed out.</h2><p>Please verify the fields.</p></center>';
  if(document.querySelector("#download").checked === true){
      document.getElementById("FLAG").innerHTML = timeoutMessage;
  } else if (document.querySelector("#make-table").checked === true){
      document.getElementById("TABLE").innerHTML = timeoutMessage;
  }
}

function displayError(error){
  stopTimer();
  document.getElementById("FLAG").innerHTML = '<p class="flag">ERROR: '+error+'.</p>';
  console.error(error);
}


let startYear;
let endYear;
function submitStateHS(){
  startYear = document.getElementById("start-year-input").value;
  endYear = document.getElementById("end-year-input").value;
  document.getElementById("title-date").innerHTML = "From "+startYear+" to "+endYear;
  startTimeout();
  resetTimer();
  document.getElementById("TABLE").innerHTML = '';
  document.getElementById("FLAG").innerHTML = '';
  if(document.querySelector("#download").checked === true){
      document.getElementById("FLAG").innerHTML = '<div class="loader"></div>';
  } else if (document.querySelector("#make-table").checked === true){
      document.getElementById("TABLE").innerHTML = '<div class="loader"></div>';
  }
  startTimer();
  yearRequest(startYear, endYear);
}

async function fetchAndCombineData(API_Call) {
  try {
    const response = await fetch(API_Call);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    displayError(error);
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
        console.log(API_Call);
        // Make the API call sequentially
        const data = await fetchAndCombineData(API_Call);
        allData.push(data);
      }
    }
    
    // Process the combined data
    //const combinedData = processCombinedData(allData);
    buildArrayData(allData);
    //return allData;
  } catch (error) {
    displayError(error);
    throw error;
  }
}

/*yearRequest().then(allData => {
              buildArrayData(allData)
            })
            .catch(error => {
              // Handle any errors here
              console.error(error);
            });    */   

  function buildArrayData(array){
    console.log("buildArrayData started")
    /*let headerCounter = 1; // Initialize a counter for the headers
    for (let i = 1; i < allData.length; i++) {
        const firstIndexValue = allData[i][0]; // Assuming the first index contains the year

        // Check if the first index value is "YEAR"
        if (firstIndexValue === "YEAR") {
            headerCounter++;
            
            // If it's the second or subsequent occurrence, delete this row
            if (headerCounter > 1) {
              allData.splice(i, 1); // Remove the current row
                //i--; // Adjust the loop counter since the array length has changed
            }
        }
    }*/
    clearTimeout(timeout);
    if(document.querySelector("#make-table").checked === true){
        document.getElementById("TABLE").innerHTML = makeTableHTML(array);
    }

    if(document.querySelector("#download").checked === true){
        arrayToCSV(array);
    }
    
}

// Convert to csv file seperated by '^'

function arrayToCSV(array) {
  // Ensure data is an array of objects
  if (!Array.isArray(array) || array.length === 0) {
    console.error("Invalid data format for CSV conversion.");
    return;
  }

  var buf = array.map(function(row) {
    row = row.map(function(str) {
      if (str == null) {
        str = "";
      } else {
        str = str.toString().replace(/,/g, "^"); // Replace commas with '^'
      }
      if (str.search(/[,"\t\n\r]/) > -1) {
        str = '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    });
    return row.join("^") + "\x0D\x0A";
  });

  downloadCSVFile(buf.join(""));
}



    function downloadCSVFile(csv_data) {

    // Create CSV file object and feed
    // our csv_data into it
    CSVFile = new Blob([csv_data], {
        type: "text/csv"
    });

    // Create to temporary link to initiate
    // download process
    var temp_link = document.createElement('a');

    file_name = "statehs_"+startYear+"-"+endYear+".csv"

    // Download csv file 
    temp_link.download = file_name;
    var url = window.URL.createObjectURL(CSVFile);
    temp_link.href = url;

    // This link should not be displayed
    temp_link.style.display = "none";
    document.body.appendChild(temp_link);

    // Automatically click the link to
    // trigger download
    stopTimer();
    temp_link.click();
    document.body.removeChild(temp_link);
    document.getElementById("FLAG").innerHTML = '<p class="flag">'+file_name+' has been saved to your downloads folder.</p>';
    }

// Timer

let timer = false;
let hour = 0;
let minute = 0;
let second = 0;
let count = 0;
 
function startTimer(){
    timer = true;
    stopWatch();
}

function stopTimer(){
    timer = false;
}

function resetTimer(){
    timer = false;
    hour = 0;
    minute = 0;
    second = 0;
    count = 0;
    document.getElementById('min').innerHTML = "00";
    document.getElementById('sec').innerHTML = "00";
    document.getElementById('count').innerHTML = "00";
}
 
function stopWatch() {
  if (timer) {
      count++;

      if (count == 100) {
          second++;
          count = 0;
      }

      if (second == 60) {
          minute++;
          second = 0;
      }

      if (minute == 60) {
          hour++;
          minute = 0;
          second = 0;
      }

      let hrString = hour;
      let minString = minute;
      let secString = second;
      let countString = count;

      if (hour < 10) {
          hrString = "0" + hrString;
      }

      if (minute < 10) {
          minString = "0" + minString;
      }

      if (second < 10) {
          secString = "0" + secString;
      }

      if (count < 10) {
          countString = "0" + countString;
      }

      //document.getElementById('hr').innerHTML = hrString;
      document.getElementById('min').innerHTML = minString;
      document.getElementById('sec').innerHTML = secString;
      document.getElementById('count').innerHTML = countString;
      setTimeout(stopWatch, 10);
  }
}