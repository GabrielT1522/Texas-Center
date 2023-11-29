const API_KEY = "e4708f39876f8f6fb9140bbf0210aecfab34f0c3";

let timeout;
function startTimeout() {
  timeout = setTimeout(timeoutMessage, 180000);
}

function timeoutMessage() {
  timeoutMessage = '<center><h2>You request has timed out.</h2><p>Please verify the fields.</p></center>';
  document.getElementById("FLAG").innerHTML = timeoutMessage;
}

//https://api.census.gov/data/timeseries/intltrade/exports/statehs?get=STATE,CTY_NAME,ALL_VAL_MO,CTY_CODE&key=e4708f39876f8f6fb9140bbf0210aecfab34f0c3&COMM_LVL=HS6&YEAR=2020&MONTH=12
let startYear;
let endYear;
function validateForm() {
  let valid = true;
  //var isCheckedAllCommodity = document.getElementById("all-commodity").checked;
  var numericField = document.getElementById("commodityInput");
  var inputValue = numericField.value;
  //var isCommodityRequired = !isCheckedAllCommodity;
  startYear = document.getElementById("start-year-input").value;
  endYear = document.getElementById("end-year-input").value;


  // Set the "required" attribute based on the checkbox
  //numericField.required = isCommodityRequired;

  //if (isCommodityRequired) {
  // If the checkbox is not checked, validate the input
  if ((inputValue === "" || (/^\d+$/.test(inputValue) && inputValue.length <= 6 && inputValue.length % 2 === 0))) {
    valid = true; // Allow form submission
  } else {
    alert("Invalid commodity input. Please enter a numeric value with an even number of characters (up to 6 digits).");
    valid = false; // Prevent form submission
  }

  //}
  if (valid) {
    resetTimer();
    startTimeout();
    startTimer();
    document.getElementById("title-date").innerHTML = "From " + startYear + " to " + endYear;
    document.getElementById("FLAG").innerHTML = '';
    //document.getElementById("FLAG").innerHTML = '<progress id="progress-bar" value="0" max="1"></progress>';
    showSnackbar();
    API_Request(startYear, endYear);
  }

  return valid; // Allow form submission

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

async function API_Request(startYear, endYear) {

  try {
    var API_counter = 0;
    var states = $('#stateInput').val();
    commodity = getCommodityInput();

    totalCalls = 0;
    numOfStates = 1;
    if (states && states.length > 0) {
      numOfStates = states.length;
    }
    totalCalls = numOfStates * 2 * (12 * (endYear - startYear + 1)); // 12 months per year
    console.log(totalCalls);
    const tradeTypes = ['imports', 'exports'];
    const API_DATA = [];


    for (let year = startYear; year <= endYear; year++) {
      for (let month = 1; month <= 12; month++) {
        const formattedMonth = String(month).padStart(2, '0'); // Ensure two digits for month

        for (const tradeType of tradeTypes) {
          const dataField = tradeType === 'imports' ? 'GEN_VAL_MO' : 'ALL_VAL_MO';
          var commodityTypeField = tradeType === 'imports' ? 'I_COMMODITY' : 'E_COMMODITY';
          const commodity = getCommodityInput(commodityTypeField);
          if (commodity === "") {
            commodityTypeField = "";
          } else {
            commodityTypeField = "," + commodityTypeField;
          }
          // Loop through each selected state if the states array is not empty
          if (states && states.length > 0) {
            for (const state of states) {
              const API_Call = `https://api.census.gov/data/timeseries/intltrade/${tradeType}/statehs?get=STATE,CTY_NAME,${dataField},CTY_CODE${commodityTypeField}&key=${API_KEY}${commodity}&YEAR=${year}&MONTH=${formattedMonth}&STATE=${state}`;
              console.log(API_Call);

              try {
                const data = await fetchAndCombineData(API_Call);
                API_DATA.push(...buildArrayData(data, tradeType, API_counter));
              } catch (error) {
                // Handle and log errors for individual API calls, but continue with the next iteration.
                console.error(`Error for year ${year}, month ${month}, state ${state}, and tradeType ${tradeType}: ${error.message}`);
              }

              API_counter++;
              document.getElementById("progress-bar").value = API_counter / totalCalls;
            }
          } else {
            // If the states array is empty, make the API call without the STATE parameter

            const API_Call = `https://api.census.gov/data/timeseries/intltrade/${tradeType}/statehs?get=STATE,CTY_NAME,${dataField},CTY_CODE${commodityTypeField}&key=${API_KEY}${commodity}&YEAR=${year}&MONTH=${formattedMonth}`;
            console.log(API_Call);

            try {
              const data = await fetchAndCombineData(API_Call);
              API_DATA.push(...buildArrayData(data, tradeType, API_counter));
            } catch (error) {
              // Handle and log errors for individual API calls, but continue with the next iteration.
              console.error(`Error for year ${year}, month ${month}, and tradeType ${tradeType}: ${error.message}`);
            }

            API_counter++;
            document.getElementById("progress-bar").value = API_counter / totalCalls;
          }
        }
      }
    }
    
    //if (document.querySelector("#make-table").checked === true) {
    //document.getElementById("TABLE").innerHTML = makeTableHTML(API_DATA);
    //}

    if (document.querySelector("#download").checked === true) {
      arrayToCSV(API_DATA);
    }
    clearTimeout(timeout);
    stopTimer();
    hideSnackbar();
  } catch (error) {
    displayError(error);
    throw error;
  }
}
function getCommodityInput(commodityType) {
  commodity = document.getElementById("commodityInput").value;
  if (commodity === "") {
    return "";
  } else {
    return "&" + commodityType + "=" + commodity;
  }
}

function buildArrayData(API_DATA, tradeType, headerCounter) {

  const excludedValues = getExcludedCountryCodes();

  API_DATA[0].splice(4, 0, "trade_type");

  for (let i = API_DATA.length - 1; i >= 1; i--) {
    API_DATA[i].splice(4, 0, tradeType);




    // Check if the value at index 4 is in the excludedValues array
    const valueAtIndex3 = API_DATA[i][3];
    if (excludedValues.some(excludedValue => valueAtIndex3.includes(excludedValue))) {
      API_DATA.splice(i, 1); // Remove the current row
    }
  }
  // Remove the header if headerCounter is not 0
  if (headerCounter !== 0) {
    API_DATA.shift();
  }
  return API_DATA;
}

$(document).ready(function () {
  $('#stateInput').selectpicker();

  $('#stateInput').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
    var clearAllOption = $('#clear-all');

    if (clearAllOption.is(':selected')) {
      // If "Clear All" is selected, deselect all other options
      $('#stateInput').selectpicker('deselectAll');
    }
  });
});

function makeTableHTML(myArray) {
  var loop = 101;
  if (myArray.length < loop) {
    loop = myArray.length;
  }
  var result = '<table id="myTable" border=1>';
  for (var i = 0; i < loop; i++) {

    result += '<tr class="header">';
    for (var j = 0; j < myArray[i].length; j++) {
      result += "<td>" + myArray[i][j] + "</td>";
    }
    result += "</tr>";

  }
  result += "</table>";

  stopTimer();
  return result;
}

/*
var currentPage = 0;
var totalPages = 1; // Initialize totalPages as 1

function makeTableHTML(myArray, rowsPerPage = 100) {
  stopTimer();
  totalPages = Math.ceil(myArray.length / rowsPerPage);

  function generateTable(page) {
    var tableContainer = document.getElementById("TABLE");
    tableContainer.innerHTML = ''; // Clear the table content

    var startIndex = page * rowsPerPage;
    var endIndex = Math.min(startIndex + rowsPerPage, myArray.length);

    var table = document.createElement('table');
    table.setAttribute("id", "myTable");
    table.setAttribute("border", "1");

    // Create the header row (only once, for the first page)
    if (page === 0) {
      var headerRow = document.createElement('tr');
      for (var j = 0; j < myArray[0].length; j++) {
        var headerCell = document.createElement('th');
        headerCell.textContent = myArray[0][j];
        headerRow.appendChild(headerCell);
      }
      table.appendChild(headerRow);
    }

    // Create the data rows, skip the first row for subsequent pages
    for (var i = (page === 0 ? 1 : startIndex); i < endIndex; i++) {
      var row = document.createElement('tr');
      for (var j = 0; j < myArray[i].length; j++) {
        var cell = document.createElement('td');
        cell.textContent = myArray[i][j];
        row.appendChild(cell);
      }
      table.appendChild(row);
    }

    tableContainer.appendChild(table);
  }

  function displayTable(page) {
    generateTable(page);
    updatePagination(page);
  }

  function updatePagination(page) {
    document.getElementById("currentPage").textContent =
      'Page ' + (page + 1) + ' of ' + totalPages;

    var previousButton = document.getElementById("previousButton");
    var nextButton = document.getElementById("nextButton");

    if (page === 0) {
      previousButton.disabled = true;
    } else {
      previousButton.disabled = false;
    }

    if (page === totalPages - 1) {
      nextButton.disabled = true;
    } else {
      nextButton.disabled = false;
    }
  }

  // Generate the initial table for page 0 (first page) immediately after initializing totalPages

  function initialTable() {
    displayTable(currentPage)
    nextButton.disabled = false;
  }
  initialTable();

  document.getElementById("previousButton").addEventListener("click", function () {
    if (currentPage > 0) {
      currentPage--;
      displayTable(currentPage);
    }
  });

  document.getElementById("nextButton").addEventListener("click", function () {
    if (currentPage < totalPages - 1) {
      currentPage++;
      displayTable(currentPage);
    }
  });
}*/


// Convert to csv file seperated by '^'
function arrayToCSV(array) {
  // Ensure data is an array of objects
  if (!Array.isArray(array) || array.length === 0) {
    console.error("Invalid data format for CSV conversion.");
    return;
  }

  var buf = array.map(function (row) {
    row = row.map(function (str) {
      if (str == null) {
        str = "";
      } else {
        // Check if the string contains a comma
        if (str.indexOf(',') !== -1 || str.search(/[,"\t\n\r]/) > -1) {
          str = '"' + str.replace(/"/g, '""') + '"';
        }
      }
      return str;
    });
    return row.join(document.querySelector('input[name="delimiter"]:checked').value) + "\x0D\x0A"; // Use a comma as the delimiter
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
  file_name = "statehs_" + startYear + "-" + endYear + ".csv"

  // Download csv file 
  temp_link.download = file_name;
  var url = window.URL.createObjectURL(CSVFile);
  temp_link.href = url;

  // This link should not be displayed
  temp_link.style.display = "none";
  document.body.appendChild(temp_link);

  // Automatically click the link to
  // trigger download
  temp_link.click();
  document.body.removeChild(temp_link);
  document.getElementById("FLAG").innerHTML = '<p class="flag">' + file_name + ' has been saved to your downloads folder.</p>';
}

// Timer

let timer = false;
let hour = 0;
let minute = 0;
let second = 0;
let count = 0;

function startTimer() {
  timer = true;
  stopWatch();
}

function stopTimer() {
  timer = false;
}

function resetTimer() {
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