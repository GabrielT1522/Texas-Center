function fetchJSONData(url) {
            
    const jsonURL = url; 
    return fetch(jsonURL)
        .then(response => response.json())
        .catch(error => {
            console.error("Error fetching JSON data:", error);
        });
    
}

async function populateTable(url) {
    try {
        
        const JSONdata = await fetchJSONData(url);
        document.getElementById("title").textContent = JSONdata.dataset[0].title;
        document.getElementById("description").textContent = JSONdata.dataset[0].description;
        /*
        const properties = [
            { label: "Access Level", key: "accessLevel" },
            { label: "Modified", key: "modified" },
            { label: "Bureau Code", key: "bureauCode" },
            { label: "Identifier", key: "identifier" },
            { label: "Spatial", key: "spatial" },
            { label: "License", key: "license" },
            { label: "Program Code", key: "programCode" },
            { label: "Variables link", key: "c_variablesLink" }, // <a href='c_variablesLink'></a>
        ];
        
        
        const tableBody = document.querySelector("table");

        properties.forEach(property => {
            const row = document.createElement("tr");
            const labelCell = document.createElement("td");
            const valueCell = document.createElement("td");

            labelCell.textContent = property.label;
            valueCell.textContent = JSONdata.dataset[0][property.key];

            row.appendChild(labelCell);
            row.appendChild(valueCell);
            tableBody.appendChild(row);
        });*/
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

var API_DATA;
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        API_DATA = JSON.parse(xhttp.responseText);

    // Add the "District", "Port", and "trade_type" headers as column names at the appropriate positions
    API_DATA[0].splice(1, 0, "District", "Port", "trade_type");


    // Iterate through the array and populate "import" or "export" based on your if statement
    for (var i = 1; i < API_DATA.length; i++) {
        var trade_type;
        
        // Replace this with your if statement to determine trade_type
        if (document.querySelector("#imports").checked) {
            trade_type = "import";
        } else {
            trade_type = "export";
        }

        // Split the 4-digit "port" field into "District" and "Port"
        var port = API_DATA[i][8].toString(); // Assuming "port" is in the second column
        var district = port.slice(0, 2);
        var portNumber = port.slice(2, 4);

        // Add the "District" and "Port" values to the sub-array at the appropriate positions
        API_DATA[i].splice(1, 0, district, portNumber, trade_type);

        
    }

    if(document.querySelector("#make-table").checked === true){
        document.getElementById("TABLE").innerHTML = makeTableHTML(API_DATA);
    }

    if(document.querySelector("#download").checked === true){
        arrayToCSV(API_DATA);
    }
    
    }
};

function xhttpRequest(){
    dateForm = document.getElementById("date").value;
    let valid = false;
    let  API_Call = "";
    district = document.getElementById("DISTRICT").value;

    if (document.querySelector("#imports").checked && document.querySelector("#exports").checked) {
        alert("Please select only one trade type.")
    } else if(document.querySelector("#imports").checked){
        API_Call = "https://api.census.gov/data/timeseries/intltrade/imports/porths?get=MONTH,CTY_CODE,I_COMMODITY,GEN_VAL_MO,PORT_NAME,CTY_NAME,I_COMMODITY_SDESC&key=e4708f39876f8f6fb9140bbf0210aecfab34f0c3&COMM_LVL=HS6&PORT="+district+"*&time="+dateForm;
        valid = true;
        populateTable("https://api.census.gov/data/timeseries/intltrade/imports/porths");
        document.getElementById("title-date").innerHTML = "District "+district+" Imports in "+dateForm;
    } else if(document.querySelector("#exports").checked){
        API_Call = "https://api.census.gov/data/timeseries/intltrade/exports/porths?get=MONTH,CTY_CODE,E_COMMODITY,ALL_VAL_MO,PORT_NAME,CTY_NAME,E_COMMODITY_SDESC&key=e4708f39876f8f6fb9140bbf0210aecfab34f0c3&COMM_LVL=HS6&PORT="+district+"*&time="+dateForm;
        valid = true;
        populateTable("https://api.census.gov/data/timeseries/intltrade/exports/porths");
        document.getElementById("title-date").innerHTML = "District "+district+" Exports in "+dateForm;
    } else{
        alert("Please select a trade type.")
    }
    
    if (valid){
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

function monthName(month){
    switch(month){
        case "01": return "January";
        break;
        case "02": return "February";
        break;
        case "03": return "March";
        break;
        case "04": return "April";
        break;
        case "05": return "May";
        break;
        case "06": return "June";
        break;
        case "07": return "July";
        break;
        case "08": return "August";
        break;
        case "09": return "September";
        break;
        case "10": return "October";
        break;
        case "11": return "November";
        break;
        case "12": return "December";
        break;
        default:
        break;
    }
}

function filterSearch() {
var input, filter, table, tr, td, i, txtValue;
input = document.getElementById("myInput");
filter = input.value.toUpperCase();
table = document.getElementById("myTable");
tr = table.getElementsByTagName("tr");
for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[11];
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

var type = "";
if(document.querySelector("#imports").checked){
    type = "imports";
} else if(document.querySelector("#exports").checked){
    type = "exports";            
}

file_name = type+"-porths-"+document.getElementById("date").value+".csv"

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
document.getElementById("FLAG").innerHTML = '<h2>'+file_name+' has been saved to your downloads folder.</h2>';
}