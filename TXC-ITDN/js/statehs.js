let start_year = document.getElementById("start-year-input").value;
let end_year = document.getElementById("end-year-input").value;

let count=0
for(let i=start_year;i<=end_year;i++){
    console.log(i);
    count++;
    
}
console.log(count-1+" years between "+start_year+" and "+end_year);
// https://api.census.gov/data/timeseries/intltrade/imports/statehs?get=YEAR,STATE,CTY_NAME,GEN_VAL_MO,CTY_CODE&key=e4708f39876f8f6fb9140bbf0210aecfab34f0c3&YEAR=2022