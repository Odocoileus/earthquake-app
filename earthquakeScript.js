"use strict";

    //get current time in ms, then get the past minute in ms
    var currentMSeconds = Date.now();
    var pastMSeconds = (currentMSeconds - 9000000); // subtracting 15 minutes

    //subtract the offset from UTC in ms from the two times to get UTC times
    var timeObject = new Date(); //Date object
    var utcOffset = (timeObject.getTimezoneOffset() * 60000); //getting offset in minutes
    var utcCurrentMSeconds = new Date(currentMSeconds - utcOffset);
    var utcPastMSeconds = new Date(pastMSeconds - utcOffset);

    //convert both UTC times to an ISO string
    var currentIsoString = utcCurrentMSeconds.toISOString();
    var pastIsoString = utcPastMSeconds.toISOString();
            
/* ----------------------------------------------------------------------------*/
            
    //Getting the earthquake data via AJAX request

    var requestUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=" 
        + pastIsoString + "&endtime=" + currentIsoString; //Generating the URL used to request the information
    var xhr = new XMLHttpRequest();
    xhr.open("GET", requestUrl); // "GET" for "getting" information, and the request URL
    var earthquakesJson, earthquakesObject; /* These are declared outside xhr.onload() so that
        all functions can use them. */

    xhr.onload = function() { /* the onload property of the xhr object is what is invoked as soon as the 
            response is sent from the server. It will wait until then to execute. */
        
        (function() { /* This IIFE is to ensure the variables are assigned values before anything else
        happens in the code. */
            earthquakesJson = xhr.response; 
            earthquakesObject = JSON.parse(earthquakesJson);
        })() 
        document.getElementById("loadingDiv").style.display = "none"; //When finished loading, hide loading wheel

        generatePage();
    }

    xhr.send(null); //Send the request!
            
/* ----------------------------------------------------------------------------*/
            
function generatePage() {
    if (earthquakesObject.features.length == 0) { 
        /* If there aren't any earthquakes, the length property of the 
            features array will be 0.  */
        var noneElement = document.createElement("P");
        var noQuakes = document.createTextNode("There have been no earthquakes in the last 15 minutes. Feel free to refresh the page later.");

        noneElement.appendChild(noQuakes);
        document.body.appendChild(noneElement);
        return; // Using return with no value exits interpretData() and allows for a new AJAX request.  
    }
    createTileLayout();
}
    
//Generate all tiles and relevant content.
function createTileLayout() {
    for(var i = 0; i < earthquakesObject.features.length;) {
     //Create 3 tiles in the parent element
        var dataDiv = document.getElementById("data");
        var parentDiv = document.createElement("DIV");
        var titleHeader, magnitudeElement, locationElement, tsunamiElement,
            urlElement, anchorElement, title, magnitude, location, tsunami, 
            link, childDiv, remainingTiles;

        parentDiv.className = "tile is-parent";
        remainingTiles = earthquakesObject.features.length - i;
        if( remainingTiles < 3 ) {
                parentDiv.id = "centerTiles";
        } 

        for(var count = 0; count < 3 && count < remainingTiles; count++, i++) { 
            //creating child div for flexbox
            childDiv = document.createElement("DIV");
            childDiv.className = "tile is-4 is-child box";
            childDiv.id = "children";

            //Creating elements
            titleHeader = document.createElement("H2");
            titleHeader.className = "title";
            magnitudeElement = document.createElement("P");
            locationElement = document.createElement("P");
    
            urlElement = document.createElement("P");
            anchorElement = document.createElement("A");
            anchorElement.href = earthquakesObject.features[i].properties.url; 

            //create text nodes for each property
            title = document.createTextNode("Earthquake " + (i + 1));
            magnitude = document.createTextNode("Magnitude: " + earthquakesObject.features[i].properties.mag);
            location = document.createTextNode("Location: " + earthquakesObject.features[i].properties.place);
            link = document.createTextNode("Link to the USGS page on the earthquake.");

            //appending text nodes
            titleHeader.appendChild(title);        
            magnitudeElement.appendChild(magnitude);
            locationElement.appendChild(location);
            anchorElement.appendChild(link);
            urlElement.appendChild(anchorElement);

            //appending elements to child div
            childDiv.appendChild(titleHeader);
            childDiv.appendChild(magnitudeElement);
            childDiv.appendChild(locationElement);
            if(earthquakesObject.features[i].properties.tsunami == 1) { //This dialogue only appears when there is a tsunami.
                tsunamiElement = document.createElement("P");
                tsunami = document.createTextNode("There was a tsunami warning with this earthquake.");
                tsunamiElement.appendChild(tsunami);
                childDiv.appendChild(tsunamiElement);
            }
            childDiv.appendChild(urlElement); 
            parentDiv.appendChild(childDiv);
        }
        dataDiv.appendChild(parentDiv);
    }
}

