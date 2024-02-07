// This index.js file adds the functionality specific to the index.html file

// API Key can be requested through here: https://api.census.gov/data/key_signup.html
const API_KEY = "e4708f39876f8f6fb9140bbf0210aecfab34f0c3";

let timeout;

// Start a timeout if the request takes too long depending on the type
function startTimeout() {
    if (document.getElementById("year-checkbox").checked) {
        timeout = setTimeout(timeoutMessage, 600000);
        document.getElementById("snackbar").innerHTML = "Please be aware that this request may take up to 10 minutes to process."
    } else if (document.getElementById("all-commodity").checked) {
        timeout = setTimeout(timeoutMessage, 180000);
        document.getElementById("snackbar").innerHTML = "Please be aware that this request may take up to 3 minutes to process."
    } else {
        timeout = setTimeout(timeoutMessage, 60000);
        document.getElementById("snackbar").innerHTML = "Please be aware that this request may take up to 1 minute to process."
    }
}

// set the timeout message in the appropriate location
function timeoutMessage() {
    timeoutMessage = '<center><h2>Your request has timed out.</h2><p>Please verify the fields.</p></center>';
    if (document.querySelector("#download").checked === true) {
        document.getElementById("FLAG").innerHTML = timeoutMessage;
    } else if (document.querySelector("#make-table").checked === true) {
        document.getElementById("TABLE").innerHTML = timeoutMessage;
    }
}

function getDateInput() {
    if (document.getElementById("year-checkbox").checked) {
        return document.getElementById("year-input").value;
    } else {
        return document.getElementById("date").value;
    }
}

function getCommodityInput() {
    commodity = document.getElementById("commodityInput").value;
    if (commodity === "") {
        return "COMM_LVL=HS6";
    } else {
        if (document.querySelector("#imports").checked) {
            return "I_COMMODITY=" + commodity;
        } else if (document.querySelector("#exports").checked) {
            return "E_COMMODITY=" + commodity;
        }
    }
}

function getCommodityTypeInput() {
    if (document.querySelector("#imports").checked) {
        return "I";
    } else if (document.querySelector("#exports").checked) {
        return "E";
    }
}

function getValueTypeInput() {
    if (document.querySelector("#imports").checked) {
        return "GEN_VAL_MO";
    } else if (document.querySelector("#exports").checked) {
        return "ALL_VAL_MO";
    }
}

function getTradeTypeInput() {
    return document.querySelector('input[name="port-type"]:checked').value;
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
        throw error;
    }
}

// Build the API Request depending on the parameters
async function API_Request() {
    try {
        // Initialize variables based on parameters
        const trade_type = getTradeTypeInput();
        const date = getDateInput();
        const commodity = getCommodityInput();
        const commodityType = getCommodityTypeInput();
        const valueType = getValueTypeInput();
        const progressBar = document.getElementById("progress-bar");
        const districtValue = document.getElementById("DISTRICT").value;
        let API_counter = 0;
        let totalCalls = 0
        progressBar.value = 0;

        // If the year request checkbox is checked, initialize months to 12
        if (document.getElementById("year-checkbox").checked) {
            year = date;
            startMonth = 1;
            endMonth = 12;
            totalCalls = 12;
        } else { // else split the date to month and year
            [year, month] = date.split('-');
            startMonth = month;
            endMonth = month;
            totalCalls = 1;
        }

        // If all district values are selected, districts 23, 24, 25, and 26 will be in the API call
        if (districtValue == "All") {
            document.getElementById("title-date").innerHTML = `Districts 23, 24, 25, and 26 ${trade_type} in ${date}`;
            startDistrict = 23;
            endDistrict = 26;
            totalCalls *= 4;
        } else { // Only the selected district will be in the API call
            document.getElementById("title-date").innerHTML = `District ${districtValue} ${trade_type} in ${date}`;
            startDistrict = districtValue;
            endDistrict = districtValue;
        }
        const API_DATA = [];
        for (let district = startDistrict; district <= endDistrict; district++) { // Iterate through the district(s)
            for (let month = startMonth; month <= endMonth; month++) { // Iterate through the month(s)
                const formattedMonth = String(month).padStart(2, '0'); // Ensure two digits for month
                // Initialize the appropriate API call
                const API_Call = `https://api.census.gov/data/timeseries/intltrade/${trade_type}/porths?get=${commodityType}_COMMODITY,CTY_NAME,${valueType},PORT_NAME,CTY_CODE,${commodityType}_COMMODITY_SDESC&key=${API_KEY}&${commodity}&PORT=${district}*&YEAR=${year}&MONTH=${formattedMonth}`;
                console.log(API_Call);
                try {
                    // Combine the API data arrays to one array
                    const data = await fetchAndCombineData(API_Call);
                    API_DATA.push(...data);
                } catch (error) {
                    // Handle and log errors for individual API calls, but continue with the next iteration.
                    console.error(`Error for API CALL: ${API_Call}`);
                    displayError("Please make sure that commodity code is valid. There may not be any data in this request");
                    throw new Error(`Please make sure that commodity code is valid. There may not be any data in this request`);
                }

                API_counter++;
                progressBar.value = API_counter / totalCalls;
            }
        }

        // Build the data array from the API
        buildArrayData(API_DATA, API_counter);
        if (document.querySelector("#make-table").checked === true) {
            document.getElementById("TABLE").innerHTML = makeTableHTML(API_DATA);
        }

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

// Convert a 2x2 array to an html table
function makeTableHTML(myArray) {
    var result = '<table id="myTable" border=1>';
    for (var i = 0; i < myArray.length; i++) {

        result += '<tr class="header">';
        for (var j = 0; j < myArray[i].length; j++) {
            result += "<td>" + myArray[i][j] + "</td>";
        }
        result += "</tr>";

    }
    result += "</table>";
    return result;
}

// Build the data array from the API
function buildArrayData(API_DATA, headerCounter) {
    const excludedValues = getExcludedCountryCodes();

    // Add the "District", "Port", and "trade_type" headers as column names at the appropriate positions
    API_DATA[0].splice(1, 0, "dist_code", "port_code");
    API_DATA[0].splice(6, 0, "trade_type");

    // Iterate through the array in reverse to safely delete rows
    for (let i = API_DATA.length - 1; i >= 1; i--) {
        const valueAtIndex4 = API_DATA[i][4];

        // Check if the value at index 4 is in the excludedValues array
        if (excludedValues.some(excludedValue => valueAtIndex4.includes(excludedValue))) {
            API_DATA.splice(i, 1); // Remove the current row
            continue;
        }

        const firstIndexValue = API_DATA[i][8]; // Assuming the first index contains the year

        // Check if the first index value is "YEAR"
        if (firstIndexValue === "YEAR") {
            headerCounter++;

            // If it's the second or subsequent occurrence, delete this row
            if (headerCounter > 1) {
                API_DATA.splice(i, 1);
                continue;
            }
        }

        var trade_type = getTradeTypeInput();

        // Split the 4-digit "port" field into "District" and "Port"
        var port = API_DATA[i][7].toString(); // Assuming "port" is in the second column
        var dist_code = port.slice(0, 2);
        var port_code = port.slice(2, 4);

        // Add the "District" and "Port" values to the sub-array at the appropriate positions
        API_DATA[i].splice(1, 0, dist_code, port_code);
        API_DATA[i].splice(6, 0, trade_type);
    }
}

function searchBy(value) {
    localStorage.setItem("searchBy", value)
    document.getElementById("myInput").value = "";
}

// Filter the search depending on the selected variable
function filterSearch() {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[localStorage.getItem("searchBy")];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[0].style.display = "";
                tr[i].style.display = "";
            } else {
                tr[0].style.display = "";
                tr[i].style.display = "none";
            }
        }
    }
}

// Toggle if all commodities are requested, a table will not be formed due to large data
document.getElementById('all-commodity').onchange = function () {
    if (this.checked == true) {
        document.getElementById("make-table").disabled = true;
        document.getElementById("make-table").checked = false;
        document.getElementById("commodityInput").disabled = true;
        document.getElementById("commodityInput").focus();
        document.getElementById("commodityInput").value = "";
    }
    else {
        document.getElementById("make-table").disabled = false;
        document.getElementById("commodityInput").disabled = false;
    }
};

// Check if a yearly request ot monthly request is needed
function yearCheckbox() {
    var isCheckedYearInput = document.getElementById("year-checkbox").checked;
    var calenderField = document.getElementById("date");
    var yearField = document.getElementById("year-input");
    var isCalendarRequired = !isCheckedYearInput;
    var isYearInputRequired = isCheckedYearInput;


    // Set the "required" attribute based on the checkbox
    calenderField.required = isCalendarRequired;
    calenderField.disabled = !isCalendarRequired;

    if (!isCalendarRequired) {
        calenderField.value = "";
    }

    yearField.required = isYearInputRequired;
    yearField.disabled = !isYearInputRequired;

    if (!isYearInputRequired) {
        yearField.value = "";
    }
}

// Validate the form based on requested parameters
function validateForm() {
    let valid = true;
    var isCheckedAllCommodity = document.getElementById("all-commodity").checked;
    var numericField = document.getElementById("commodityInput");
    var inputValue = numericField.value;
    var isCommodityRequired = !isCheckedAllCommodity;

    // Set the "required" attribute based on the checkbox
    numericField.required = isCommodityRequired;

    if (isCommodityRequired) {
        // If the checkbox is not checked, validate the input
        if (/^\d+$/.test(inputValue) && inputValue.length <= 6 && inputValue.length % 2 === 0) {
            valid = true; // Allow form submission
        } else {
            alert("Invalid commodity input. Please enter a numeric value with an even number of characters (up to 6 digits).");
            valid = false; // Prevent form submission
        }
    }
    if (valid) {
        resetTimer();
        startTimeout();
        startTimer();
        document.getElementById("TABLE").innerHTML = "";
        document.getElementById("myInput").value = "";
        document.getElementById("FLAG").innerHTML = ""
        showSnackbar();
        API_Request();
    }

    return valid; // Allow form submission
}

// Convert an array to CSV
function arrayToCSV(array) {
    var buf = array.map(function (row) {
        row = row.map(function (str) {
            if (str == null) {
                str = "";
            } else {
                str += "";
            }
            if (str.search(/[,"\t\n\r]/) > -1) {
                str = '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        });
        return row.join(document.querySelector('input[name="delimiter"]:checked').value) + "\x0D\x0A";
    });
    downloadCSVFile(buf.join(""));
}

// Download the CSV file
function downloadCSVFile(csv_data) {

    // Create CSV file object and feed
    // our csv_data into it
    CSVFile = new Blob([csv_data], {
        type: "text/csv"
    });

    // Create to temporary link to initiate
    // download process
    var temp_link = document.createElement('a');

    let trade_type = getTradeTypeInput();
    let date = getDateInput();
    let district = document.getElementById("DISTRICT").value;
    if (document.getElementById("year-checkbox").checked) {
        file_name = trade_type + "_" + date + ".csv"
    } else {
        file_name = trade_type + "_" + date + "_district_" + district + ".csv";
    }

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