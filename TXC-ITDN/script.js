const API_KEY = "e4708f39876f8f6fb9140bbf0210aecfab34f0c3";

function fetchJSONData(url) {
            
    const jsonURL = url; 
    return fetch(jsonURL)
        .then(response => response.json())
        .catch(error => {
            console.error("Error fetching JSON data:", error);
        });
    
}

let timeout;

function startTimeout() {
    if(document.getElementById("year-checkbox").checked){
        timeout = setTimeout(timeoutMessage, 180000);
    }else{
        timeout = setTimeout(timeoutMessage, 60000);
    }
}

function timeoutMessage(){
    timeoutMessage = '<h2><center>You request has timed out. Please verify fields.</center></h2>';
    if(document.querySelector("#download").checked === true){
        document.getElementById("FLAG").innerHTML = timeoutMessage;
    } else if (document.querySelector("#make-table").checked === true){
        document.getElementById("TABLE").innerHTML = timeoutMessage;
    }
}

async function populateTable(url) {
    try {
        
        const JSONdata = await fetchJSONData(url);
        document.getElementById("title").textContent = JSONdata.dataset[0].title;
        document.getElementById("description").textContent = JSONdata.dataset[0].description;
    } catch (error) {
        console.error("Error populating table:", error);
    }
}

function makeTableHTML(myArray) {
    var result = '<table id="myTable" border=1>';
    for(var i=0; i<myArray.length; i++) {
        
            result += '<tr class="header">';
            for(var j=0; j<myArray[i].length; j++){
                result += "<td>"+myArray[i][j]+"</td>";
            }
            result += "</tr>";
        
    }
    result += "</table>";

    return result;
}

async function yearRequest() {
    trade_type = getTradeTypeInput();
    date = getDateInput();
    commodity = getCommodityInput();
	const API_Call1 = "https://api.census.gov/data/timeseries/intltrade/"+trade_type+"/porths?get=YEAR,I_COMMODITY,CTY_NAME,GEN_VAL_MO,PORT_NAME,CTY_CODE,I_COMMODITY_SDESC&key="+API_KEY+"&"+commodity+"&PORT=23*&YEAR="+date;
	const API_Call2 = "https://api.census.gov/data/timeseries/intltrade/"+trade_type+"/porths?get=YEAR,I_COMMODITY,CTY_NAME,GEN_VAL_MO,PORT_NAME,CTY_CODE,I_COMMODITY_SDESC&key="+API_KEY+"&"+commodity+"&PORT=24*&YEAR="+date;
	const API_Call3 = "https://api.census.gov/data/timeseries/intltrade/"+trade_type+"/porths?get=YEAR,I_COMMODITY,CTY_NAME,GEN_VAL_MO,PORT_NAME,CTY_CODE,I_COMMODITY_SDESC&key="+API_KEY+"&"+commodity+"&PORT=25*&YEAR="+date;
	const API_Call4 = "https://api.census.gov/data/timeseries/intltrade/"+trade_type+"/porths?get=YEAR,I_COMMODITY,CTY_NAME,GEN_VAL_MO,PORT_NAME,CTY_CODE,I_COMMODITY_SDESC&key="+API_KEY+"&"+commodity+"&PORT=26*&YEAR="+date;	
  
	try {
	  const responses = await Promise.all([
		fetch(API_Call1),
		fetch(API_Call2),
		fetch(API_Call3),
		fetch(API_Call4)
	  ]);
  
	  const data = await Promise.all(responses.map(response => response.json()));
  
	  const combinedArray = [];
  
	  // Assuming each data element is an array, you can concatenate them
	  // For simplicity, this example assumes each data element has the same structure
	  if (data.length >= 4) {
		combinedArray.push(...data[0], ...data[1]);
		combinedArray.push(...data[2], ...data[3]);
	  }
	  return combinedArray;
	} catch (error) {
	  // If there's an error, you can handle it or throw it further
	  console.error(error);
	  throw error;
	}
  }

//var API_DATA;
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        if (document.getElementById("year-checkbox").checked){
            yearRequest()
            .then(combinedArray => {
              buildArrayData(combinedArray)
            })
            .catch(error => {
              // Handle any errors here
              console.error(error);
            });        
        }else{
            buildArrayData(JSON.parse(xhttp.responseText));
        }
    }
};

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

        var trade_type;
        
        // Replace this with your if statement to determine trade_type
        if (document.querySelector("#imports").checked) {
            trade_type = "import";
        } else {
            trade_type = "export";
        }

        // Split the 4-digit "port" field into "District" and "Port"
        var port = API_DATA[i][8].toString(); // Assuming "port" is in the second column
        var dist_code = port.slice(0, 2);
        var port_code = port.slice(2, 4);

        // Add the "District" and "Port" values to the sub-array at the appropriate positions
        API_DATA[i].splice(1, 0, dist_code, port_code);
        API_DATA[i].splice(6, 0, trade_type);
        
    }

    clearTimeout(timeout);
    if(document.querySelector("#make-table").checked === true){
        document.getElementById("TABLE").innerHTML = makeTableHTML(API_DATA);
    }

    if(document.querySelector("#download").checked === true){
        arrayToCSV(API_DATA);
    }
}

function getDateInput(){
    if (document.getElementById("year-checkbox").checked){
        return document.getElementById("year-input").value;
    }else{
        return document.getElementById("date").value;
    }
}

function getCommodityInput(){
    commodity = document.getElementById("commodityInput").value;
    if(commodity === ""){
        return "COMM_LVL=HS6";
    }else{
        if(document.querySelector("#imports").checked){
            return "I_COMMODITY="+commodity;
        } else if(document.querySelector("#exports").checked){
            return "E_COMMODITY="+commodity;
        }
    }
}

function getTradeTypeInput(){
    return document.querySelector('input[name="port-type"]:checked').value;
}

let district;
function xhttpRequest(){
    startTimeout();
    calendarField = document.getElementById("date").value;
    yearField = document.getElementById("year-input").value;
    let valid = false;
    let  API_Call = "";
    district = document.getElementById("DISTRICT").value;
    commodity = document.getElementById("commodityInput").value;

    if(commodity === ""){
        commodity = "COMM_LVL=HS6";
    }else{
        if(document.querySelector("#imports").checked){
            commodity = "I_COMMODITY="+commodity;
        } else if(document.querySelector("#exports").checked){
            commodity = "E_COMMODITY="+commodity;
        }
    }

    

    if (document.querySelector("#imports").checked && document.querySelector("#exports").checked) {	
        alert("Please select only one trade type.")
    } else if(document.querySelector("#imports").checked){
        if (document.getElementById("year-checkbox").checked){
            API_Call = "https://api.census.gov/data/timeseries/intltrade/imports/porths?get=YEAR,I_COMMODITY,CTY_NAME,GEN_VAL_MO,PORT_NAME,CTY_CODE,I_COMMODITY_SDESC&key=e4708f39876f8f6fb9140bbf0210aecfab34f0c3&"+commodity+"&PORT="+district+"*&YEAR="+yearField;
            document.getElementById("title-date").innerHTML = "District "+district+" Imports in "+yearField;
        }else{
            API_Call = "https://api.census.gov/data/timeseries/intltrade/imports/porths?get=MONTH,I_COMMODITY,CTY_NAME,GEN_VAL_MO,PORT_NAME,CTY_CODE,I_COMMODITY_SDESC&key=e4708f39876f8f6fb9140bbf0210aecfab34f0c3&"+commodity+"&PORT="+district+"*&time="+calendarField;
            document.getElementById("title-date").innerHTML = "District "+district+" Imports in "+calendarField;
        }
        valid = true;
        populateTable("https://api.census.gov/data/timeseries/intltrade/imports/porths");
        
    } else if(document.querySelector("#exports").checked){
        if (document.getElementById("year-checkbox").checked){
            API_Call = "https://api.census.gov/data/timeseries/intltrade/exports/porths?get=YEAR,E_COMMODITY,CTY_NAME,ALL_VAL_MO,PORT_NAME,CTY_CODE,E_COMMODITY_SDESC&key=e4708f39876f8f6fb9140bbf0210aecfab34f0c3&"+commodity+"&PORT="+district+"*&YEAR="+yearField;
            document.getElementById("title-date").innerHTML = "District "+district+" Exports in "+yearField;
        }else{
            API_Call = "https://api.census.gov/data/timeseries/intltrade/exports/porths?get=MONTH,E_COMMODITY,CTY_NAME,ALL_VAL_MO,PORT_NAME,CTY_CODE,E_COMMODITY_SDESC&key=e4708f39876f8f6fb9140bbf0210aecfab34f0c3&"+commodity+"&PORT="+district+"*&time="+calendarField;
            document.getElementById("title-date").innerHTML = "District "+district+" Exports in "+calendarField;
        }
        valid = true;
        populateTable("https://api.census.gov/data/timeseries/intltrade/exports/porths");
    } else{
        alert("Please select a trade type.")
    }
    
    if (valid){
        document.getElementById("TABLE").innerHTML = '';
        document.getElementById("FLAG").innerHTML = '';
        if(document.querySelector("#download").checked === true){
            document.getElementById("FLAG").innerHTML = '<div class="loader"></div>';
        } else if (document.querySelector("#make-table").checked === true){
            document.getElementById("TABLE").innerHTML = '<div class="loader"></div>';
        }

        xhttp.open("GET", API_Call, true);
        xhttp.send();
        document.getElementById("myInput").value = "";
    }   
}

function searchBy(value){
    localStorage.setItem("searchBy", value)
    document.getElementById("myInput").value = "";
}

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

document.getElementById('all-commodity').onchange = function() {
    if(this.checked==true){
        document.getElementById("make-table").disabled=true;
        document.getElementById("make-table").checked=false;
        document.getElementById("commodityInput").disabled=true;
        document.getElementById("commodityInput").focus();
        document.getElementById("commodityInput").value = "";
    }
    else{
        document.getElementById("make-table").disabled=false;
        document.getElementById("commodityInput").disabled=false;
    }
   };

   function yearCheckbox(){
    var isCheckedYearInput = document.getElementById("year-checkbox").checked;
    var calenderField = document.getElementById("date");
    var yearField = document.getElementById("year-input");
    var isCalendarRequired = !isCheckedYearInput;
    var isYearInputRequired = isCheckedYearInput;


    // Set the "required" attribute based on the checkbox
    calenderField.required = isCalendarRequired;
    calenderField.disabled = !isCalendarRequired;

    if (!isCalendarRequired){
        calenderField.value = "";
    }

    yearField.required = isYearInputRequired;
    yearField.disabled = !isYearInputRequired;

    if (!isYearInputRequired){
        yearField.value = "";
    }
   }

   function validateForm() {
    var isCheckedAllCommodity = document.getElementById("all-commodity").checked;
    // Check if the "validateCommodity" field is required
    var numericField = document.getElementById("commodityInput");
    var inputValue = numericField.value;
    var isCommodityRequired = !isCheckedAllCommodity;
    
    // Set the "required" attribute based on the checkbox
    numericField.required = isCommodityRequired;

    if (isCommodityRequired) {
        // If the checkbox is not checked, validate the input
        if (/^\d+$/.test(inputValue) && inputValue.length <= 6 && inputValue.length % 2 === 0) {
            xhttpRequest();
            return true; // Allow form submission
        } else {
            alert("Invalid commodity input. Please enter a numeric value with an even number of characters (up to 6 digits).");
            return false; // Prevent form submission
        }
    }
    xhttpRequest();
    return true;
}



// Convert to csv file seperated by '^'

function arrayToCSV(array) {
var buf = array.map(function(row) {
    row = row.map(function(str) {
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

let trade_type = getTradeTypeInput();
let date = getDateInput();

file_name = trade_type+"-district"+district+"-"+date+".csv"

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
document.getElementById("FLAG").innerHTML = '<p class="flag">'+file_name+' has been saved to your downloads folder.</p>';
}