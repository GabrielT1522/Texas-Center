function showSnackbar(){
    var x = document.getElementById("snackbar");
    x.className = "show";
}

function hideSnackbar(){
    var x = document.getElementById("snackbar");
    x.className = ("hide")
}

function displayError(error){
    stopTimer();
    document.getElementById("FLAG").innerHTML = '<p class="flag">ERROR: '+error+'.</p>';
    console.error(error);
  }

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
        const dataset = JSONdata.dataset[0];

        // Populate the table with meaningful data
        document.getElementById("title").textContent = dataset.title;
        document.getElementById("description").textContent = dataset.description;
        document.getElementById("accessLevel").textContent = dataset.accessLevel;
        document.getElementById("licenseLink").href = dataset.license;
        document.getElementById("contact").textContent = `${dataset.contactPoint.fn} (${dataset.contactPoint.hasEmail})`;
        document.getElementById("modifiedDate").textContent = dataset.modified;
        document.getElementById("referencesLink").href = dataset.references[0];
    } catch (error) {
        console.error("Error populating table:", error);
    }
}

function getExcludedCountryCodes(){
    return ["0003", "0014", "0017", "0020", "0021", "0022", "0023", "0024", "0025", "0026", "0027", "0028", "1XXX", "2XXX", "3XXX", "4XXX", "5XXX", "6XXX", "7XXX", "-"];
}