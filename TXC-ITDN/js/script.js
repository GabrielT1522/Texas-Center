function showSnackbar(){
    var x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

function displayError(error){
    stopTimer();
    document.getElementById("FLAG").innerHTML = '<p class="flag">ERROR: '+error+'.</p>';
    console.error(error);
  }

function getExcludedCountryCodes(){
    return ["0003", "0014", "0017", "0020", "0021", "0022", "0023", "0024", "0025", "0026", "0027", "0028", "1XXX", "2XXX", "3XXX", "7XXX"];
}