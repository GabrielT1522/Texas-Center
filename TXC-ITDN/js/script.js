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