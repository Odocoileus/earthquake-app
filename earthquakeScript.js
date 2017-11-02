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

 //THIS should be done with a callback instead
        (function() { /* This IIFE is to ensure the variables are assigned values before anything else
        happens in the code. */
            earthquakesJson = xhr.response; 
            earthquakesObject = JSON.parse(earthquakesJson);
        })() 

        interpretData();

    }

    xhr.send(null); //Send the request!
            
/* ----------------------------------------------------------------------------*/
            
    //Interpreting response
    function interpretData() {
        //alert(earthquakesJson);

        if (earthquakesObject.features.length == 0) { 
            /* If there aren't any earthquakes, the length property of the 
                features array will be 0.  */
            var noneElement = document.createElement("P");
            var noQuakes = document.createTextNode("There have been no earthquakes in the last 15 minutes. Feel free to refresh the page later.");

            noneElement.appendChild(noQuakes);
            document.body.appendChild(noneElement);
            return; // Using return with no value exits interpretData() and allows for a new AJAX request.   
        }

        for(var i = 0; i < earthquakesObject.features.length; i++) { /* Enumerating over each object in the features       array... */
            function wasTsunami() {
                if (earthquakesObject.features[i].properties.tsunami == 1) return " was ";
                else return " was not ";
            }

            //creating child div for flexbox
            var childDiv = document.createElement("DIV");
            childDiv.className = "tile is-child box"
            
    // ALL this really needs to do is loop through a single p for each listing
            //Creating elements
            var titleHeader = document.createElement("H2");
            var magnitudeElement = document.createElement("P");
            var locationElement = document.createElement("P");
            var tsunamiElement = document.createElement("P");
            var urlElement = document.createElement("P");
            var anchorElement = document.createElement("A");
            anchorElement.href = earthquakesObject.features[i].properties.url; 

            //create text nodes for each property
            var title = document.createTextNode("Earthquake " + (i + 1));
            var magnitude = document.createTextNode("Magnitude: " + earthquakesObject.features[i].properties.mag);
            var location = document.createTextNode("Location: " + earthquakesObject.features[i].properties.place);
            var tsunami = document.createTextNode("There" + wasTsunami() + "a tsunami warning with this earthquake.");
            var link = document.createTextNode("Link to the USGS page on the earthquake.");

            //appending text nodes
            titleHeader.appendChild(title);        
            magnitudeElement.appendChild(magnitude);
            locationElement.appendChild(location);
            tsunamiElement.appendChild(tsunami);
            anchorElement.appendChild(link);
            urlElement.appendChild(anchorElement);
            
            //appending elements to div
            var dataDiv = document.getElementById("data");
            dataDiv.appendChild(childDiv);
            childDiv.appendChild(titleHeader);
            childDiv.appendChild(magnitudeElement);
            childDiv.appendChild(locationElement);
            childDiv.appendChild(tsunamiElement);
            childDiv.appendChild(urlElement); 
            
        }
    }