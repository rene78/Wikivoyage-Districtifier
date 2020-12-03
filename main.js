var itemCounter = 1;
var stdColors = ["#ac5c91", "#d5dc76", "#b5d29f", "#b383b3", "#71b37b", "#8a84a3", "#d09440", "#578e86", "#d56d76", "#4f93c0", "#69999f"];
var jsonLayer;
var wikidataIds;
//var OpenStreetMap_Mapnik;
var mymap;
var exclusionListArray = [];
var exclusionList = "";
var basemapControl;
var layerControl;

var adminLevels = [
  { name: "nothing", features: undefined },
  { name: "<span title='Show/hide regions with certain admin level'>Admin Level 1</span>", features: undefined }, //only reason for <span> is to implement tooltip
  { name: "<span title='Show/hide regions with certain admin level'>Admin Level 2</span>", features: undefined },
  { name: "<span title='Show/hide regions with certain admin level'>Admin Level 3</span>", features: undefined },
  { name: "<span title='Show/hide regions with certain admin level'>Admin Level 4</span>", features: undefined },
  { name: "<span title='Show/hide regions with certain admin level'>Admin Level 5</span>", features: undefined },
  { name: "<span title='Show/hide regions with certain admin level'>Admin Level 6</span>", features: undefined },
  { name: "<span title='Show/hide regions with certain admin level'>Admin Level 7</span>", features: undefined },
  { name: "<span title='Show/hide regions with certain admin level'>Admin Level 8</span>", features: undefined },
  { name: "<span title='Show/hide regions with certain admin level'>Admin Level 9</span>", features: undefined },
  { name: "<span title='Show/hide regions with certain admin level'>Admin Level 10</span>", features: undefined },
  { name: "<span title='Show/hide regions with certain admin level'>Admin Level 11</span>", features: undefined },
];

//Load external navbar.html
includeHTML();

//On first load create empty array for Wikidata ID's and set up map with Berlin example GeoJSON
createWikidataIds();

//Add the base map without any layers.
addLeafletMap();

//Load the Berlin example GeoJSON into the map
showGeoJson(exampleGeoJson);

//Create array with subarrays to save all Wikidata ID's
function createWikidataIds() {
  wikidataIds = new Array(11);
  for (i = 0; i < wikidataIds.length; i++) {
    wikidataIds[i] = new Array;
  }
}

//Add a Leaflet map with empty layers to the page
function addLeafletMap() {
  var CartoDB_Voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 18
  });

  var OpenStreetMap_Mapnik = L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    maxZoom: 18
  });

  mymap = L.map('map', {
    center: [0, 0],
    zoom: 1,
    layers: [CartoDB_Voyager, OpenStreetMap_Mapnik],
    gestureHandling: true
  });

  // Define base map layer control elements on top right of map
  basemapControl = {
    "English Names": CartoDB_Voyager,
    "Local Names": OpenStreetMap_Mapnik
  };

  // create operational layers that are empty for now
  adminLevels[1].features = L.layerGroup().addTo(mymap);
  adminLevels[2].features = L.layerGroup().addTo(mymap);
  adminLevels[3].features = L.layerGroup().addTo(mymap);
  adminLevels[4].features = L.layerGroup().addTo(mymap);
  adminLevels[5].features = L.layerGroup().addTo(mymap);
  adminLevels[6].features = L.layerGroup().addTo(mymap);
  adminLevels[7].features = L.layerGroup().addTo(mymap);
  adminLevels[8].features = L.layerGroup().addTo(mymap);
  adminLevels[9].features = L.layerGroup().addTo(mymap);
  adminLevels[10].features = L.layerGroup().addTo(mymap);
  adminLevels[11].features = L.layerGroup().addTo(mymap);
}

//download GeoJSON via overpass API and forward it to showGeoJson function
function fetchExternalGeojson() {
  //make sure that polygons, which have already been loaded into the map, are excluded from the query
  //only create exclusion list for subsequent queries (i.e. from 2nd query onwards)
  if (exclusionListArray.length > 0) {
    exclusionList = "- relation(id:" + exclusionListArray.join() + ");";
  }
  //console.log("Content of exclusion list: " +exclusionList);

  //Make sure that the type of downloaded admin boundaries depends on current zoom level.
  //If zoomed in closely (e.g. zoom level>9 show admin_levels 5-11). If zoom level 7, 8 and 9 --> admin_level 3-6, else "zoom in closer!"
  var lowerAdminLevel;
  var higherAdminLevel;
  var currentZoomLevel = mymap.getZoom();

  if (currentZoomLevel < 7) {
    alert("Zoom in closer to load boundaries!");
    return;
  } else if (currentZoomLevel > 9) {
    lowerAdminLevel = 5;
    higherAdminLevel = 11;
  } else { //i.e. zoom level 7, 8 and 9
    lowerAdminLevel = 3;
    higherAdminLevel = 6;
  }

  var bbox = getBboxCoordinates(); //get bounding box from current map view
  //var bbox = "47.449,8.287,47.490,8.355"; //Some hardcoded values for bounding box for testing

  //Overpass search query
  var searchQuery = '[out:json][timeout:60];(relation[admin_level](if:(t["admin_level"] >= ' + lowerAdminLevel + ' &&t["admin_level"] <= ' + higherAdminLevel + '))["wikidata"](' + bbox + ');' + exclusionList + ');out body;>;out skel qt;';
  console.log("Paste to overpass turbo for debugging purposes: " + searchQuery);
  var searchQueryEnc = encodeURIComponent(searchQuery);
  var apiUrl = "https://overpass-api.de/api/interpreter?data=" + searchQueryEnc;
  console.log(apiUrl);

  //Grey out map during fetch of boundaries
  greyOut();

  fetch(apiUrl)
    .then(handleErrors)
    .then(function (response) {
      return response.json();
    })
    .then(function (overpassJson) {
      //console.log(overpassJson);
      //Convert JSON from overpass turbo into a proper GeoJSON
      var convGeoJson = osmtogeojson(overpassJson);
      //console.log(convGeoJson);
      showGeoJson(convGeoJson);

      //stop greying out map after load of map
      greyOut();
    }).catch(function (error) {
      console.log("Something went wrong! " + error);
      //also stop greying out map if there was an error
      greyOut();
    });
}

//Check response from API. If error throw it to catch
function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

//Show GeoJSON polygons on the Leaflet map & add layer control on top right of the map
function showGeoJson(inputGeoJson) {
  jsonLayer = L.geoJSON(inputGeoJson, {
    onEachFeature: onEachFeature,
    style: style,
    filter: filterPoints
  })

  jsonLayer.addTo(mymap);

  //Center and zoom the map on the provided GeoJSON
  mymap.fitBounds(jsonLayer.getBounds());

  var adminLayerControl = {};
  var key;
  var val;

  //Only show layer controls for layers with features in them
  //console.log(adminLevels);
  for (var i = 1; i < adminLevels.length; i++) {
    if (Object.keys(adminLevels[i].features._layers).length != 0) {
      key = adminLevels[i].name;
      val = adminLevels[i].features;
      adminLayerControl[key] = val;
      //console.log(adminLayerControl);
    }
  }

  //On second and subsequent fetch of GeoJSON first remove old layer control element on top right of map
  //Else an additional one would be added.
  if (layerControl != undefined) {
    layerControl.remove(mymap);
  }

  /* 5 */
  // Add the control component, a layer list with checkboxes for operational layers and radio buttons for basemaps
  layerControl = L.control.layers(basemapControl, adminLayerControl, { collapsed: false }).addTo(mymap)
  //console.log(layerControl);

  //Update layers on new load. Without this on/off the newly loaded element won't be on the layer.
  //Very awkward solution! There must be some update functionality!
  for (let i = 1; i < adminLevels.length; i++) {
    if (mymap.hasLayer(adminLevels[i].features) == false) { //check if layer is not activated
      console.log("Layer was NOT activated!");
      mymap.addLayer(adminLevels[i].features); //tick layer
      mymap.removeLayer(adminLevels[i].features); //untick layer
    }
  }
}

//Apply standard colors to the polygons
//(each object or "feature" is computed by this function)
function style() {
  //color = feature.properties.fill; 
  //console.log(color);
  return { "fillColor": undefined, "opacity": 1, "fillOpacity": 0.7, "color": "#555555", "weight": 2 };
}

//1. Assign each feature to a layer depending on its admin_level (NEW)
//2. Add each OSM relation id to an array to make sure, that this polygon isn't downloaded on subsequent fetches
//(each object or "feature" is computed by this function)
function onEachFeature(feature, layer) {

  //Output name and Wikidata ID at the bottom left part of the map on mouse over
  layer.on('mouseover', function (e) {
    //use english name, if available. Else use the normal "name" tag. Dot/bracket notation used due to colon (https://stackoverflow.com/q/4925760/5263954)

    if (typeof feature.properties.tags['name:en'] == 'undefined') {
      var name = feature.properties.tags.name;
    } else {
      var name = feature.properties.tags['name:en'];
    }
    var wd = feature.properties.tags.wikidata;
    //console.log(e);
    document.getElementById("region-info").innerText = name + ", Wikidata-ID: " + wd;
    //console.log(name + ", Wikidata-ID: " + wd);
  });

  //bind click
  layer.on('click', function (e) {
    //e=event
    //console.log(e);
    //console.log(feature.properties.title);

    /*Check, if the polygon already has a color defined.
    If no OR
    If current color is a different one than the one, which is supposed to be applied:
    --> Color the polygon according to the selected district.
    Else if (i.e. color already defined): Remove the color again. Behaves like on/off toggle
    */

    var polygonColor;
    if (typeof layer.options.fillColor == "undefined") {
      //Case: No color defined for this district yet
      polygonColor = stdColors[whatsSelected()];
      layer.setStyle({ fillColor: polygonColor });
      addToWikidataArray(feature.properties.tags.wikidata);
    } else if (layer.options.fillColor != stdColors[whatsSelected()]) {
      //Case: Current fill color is different than selected color
      updateWikidataArray(layer.options.fillColor, feature.properties.tags.wikidata);
      polygonColor = stdColors[whatsSelected()];
      layer.setStyle({ fillColor: polygonColor });
    } else {
      //Case: Current fill color = Selected color
      layer.setStyle({ fillColor: undefined });
      removeFromWikidataArray(feature.properties.tags.wikidata);
    }

    //console.log("Wikidata ID: " +feature.properties.tags.wikidata);
  });

  //add GeoJSON features to layer
  //var admin_level = feature.properties.admin_level;
  var admin_level = feature.properties.tags.admin_level; //subelement "tags" only for geojson from overpass api.

  switch (admin_level) {
    case "1": adminLevels[admin_level].features.addLayer(layer); break; //add polygon to adminLevels[0]
    case "2": adminLevels[admin_level].features.addLayer(layer); break;
    case "3": adminLevels[admin_level].features.addLayer(layer); break;
    case "4": adminLevels[admin_level].features.addLayer(layer); break;
    case "5": adminLevels[admin_level].features.addLayer(layer); break;
    case "6": adminLevels[admin_level].features.addLayer(layer); break;
    case "7": adminLevels[admin_level].features.addLayer(layer); break;
    case "8": adminLevels[admin_level].features.addLayer(layer); break;
    case "9": adminLevels[admin_level].features.addLayer(layer); break;
    case "10": adminLevels[admin_level].features.addLayer(layer); break;
    case "11": adminLevels[admin_level].features.addLayer(layer); break;
  }

  //Write all relation id's into an array

  //for local GeoJSON
  //var osmId = feature.properties["@id"];
  //osmId = osmId.replace( /^\D+/g, '');
  //console.log(osmId);
  //exclusionListArray.push(osmId);

  //for GeoJSON's from overpass and osmtogeojson
  var osmId = feature.properties.id;

  if (exclusionListArray.includes(osmId) == false) {
    exclusionListArray.push(osmId);
  }
  //console.log(exclusionListArray);
}

//Filter out all the label points from GeoJSON so the map doesn't look so messy
//(each object or "feature" is computed by this function)
function filterPoints(layer) {
  //console.log(layer);

  if (layer.geometry.type != "Point") {
    //console.log(layer);
    return true; //Show all features which are NOT of type "Point"
  }
}

//get the s,w,n,e cordinates of the current map section and write it to bbox variable
function getBboxCoordinates() {
  console.log("Current zoom level: " + mymap.getZoom());
  var bounds = mymap.getBounds();
  var bbox = bounds.getSouthWest().lat + ',' +
    bounds.getSouthWest().wrap().lng + ',' +
    bounds.getNorthEast().lat + ',' +
    bounds.getNorthEast().wrap().lng;
  console.log("bbox: " + bbox);
  return bbox;
}

//Check current zoom level of map and show info message, if zoom level < 7
mymap.on('zoom', function (e) { // e is an event object (MouseEvent in this case)
  var currentZoomLevel = mymap.getZoom();
  const button = document.getElementById('load-button');
  // var map = document.getElementById("map");
  var infoText = document.getElementById("zoom-in");
  if (currentZoomLevel < 7) {
    // console.log("Zoom level below 7");
    // map.classList.add("faded");
    infoText.classList.remove("hide");
    button.disabled = "disabled";
  } else {
    // console.log("Zoom level >= 7");
    // map.classList.remove("faded");
    infoText.classList.add("hide");
    button.disabled = "";
  }
});

//Grey out map during download of boundaries
function greyOut() {
  //grey/show map
  //var map = document.querySelector("container");
  var map = document.getElementById("map");
  map.classList.toggle("grey-blur");
  var button = document.getElementById("load-button");
  button.classList.toggle("grey-blur");
  //make sure that button cannot be clicked anymore
  if (button.disabled == false) {
    button.disabled = true;
  } else {
    button.disabled = false;
  }
  //show/hide loading animation
  var animation = document.getElementById("loading-animation");
  animation.classList.toggle("hide");

  //show/hide text
  // var infoText = document.getElementById("zoom-in");
  // infoText.classList.toggle("hide");
}

//Remove colors from polygons, whose districts have been deleted.
function removeColor(ids) {
  //console.log(ids.length);
  //For each layer (i.e. polygon) the code below is executed.
  jsonLayer.eachLayer(function (layer) {
    //console.log(layer.feature.properties.tags.wikidata);
    for (var i = 0; i < ids.length; i++) {
      if (layer.feature.properties.tags.wikidata == ids[i]) {
        //console.log(ids[i]);
        layer.setStyle({ fillColor: undefined })
      }
    }
  });
}

//Color all districts polygons below the deleted one with a color 1 number above the current one (e.g. instead of std color 4 change to 3)
function oneColorUp(startAt) {
  jsonLayer.eachLayer(function (layer) {
    for (i = startAt; i < wikidataIds.length; i++) {
      if (wikidataIds[i].length != 0) {
        for (j = 0; j < wikidataIds[i].length; j++) {
          if (layer.feature.properties.tags.wikidata == wikidataIds[i][j]) {
            layer.setStyle({ fillColor: stdColors[i] })
          }
        }
      }
    }
  });
}

//Add a new district to the table
function addDistrict() {
  //Stop execution, if 11 districts have already been added
  if (itemCounter >= 10) {
    alert("No more than 11 districts, please!");
    return;
  }
  itemCounter++;
  //console.log(itemCounter);
  var item = '<div id="item_' + itemCounter + '" class="item"><div class=checkmark><input type="radio" name="selected" checked="checked" title="Activate district to add/remove polygons"></div><div class=title><input type="text" class="dname" placeholder="Please enter district name" value="District ' + itemCounter + '" title="Enter name of district" onfocus="selectCheckmarkAndName(this)" oninput="createOutput()"></div><div class=delete onclick="removeDistrict(this)"><img src="img/Octagon_delete.svg" alt="Delete" title="Click to delete district"></div></div>';
  var content = document.getElementById('add-district');
  content.insertAdjacentHTML('beforebegin', item);

  /*More complicated, but possibly more robust way to create the nodes:
  var item = document.createElement("DIV");
    item.setAttribute("id","item_" +itemCounter);
  var checkmark = document.createElement("DIV");
    checkmark.setAttribute("class","checkmark");
      var radio = document.createElement("INPUT");
      radio.setAttribute("type","radio");
      radio.setAttribute("name","selected");
    checkmark.appendChild(radio);
  var title = document.createElement("DIV");
    title.setAttribute("class","title");
    title.innerHTML="District " +itemCounter;
  var del = document.createElement("DIV");
    del.setAttribute("class","delete");
    del.innerHTML="DEL";
  
  item.appendChild(checkmark);
  item.appendChild(title);
  item.appendChild(del);

  document.getElementById("content").appendChild(item);
  */
}

//Remove district from table & delete all Wikidata elements from the corresponding subarray & remove color from selected polygons
function removeDistrict(dustbin) {
  //If there is only one region item left
  if (itemCounter < 1) {
    removeColor(wikidataIds[0]);
    wikidataIds.splice(0, 1); //remove 1st subarray (i.e. region/district)
    wikidataIds.push([]); //add an empty 11th subarray to wikidataIDs
    createOutput(); //update output field
    return;
  }

  var itemToDelete = dustbin.parentNode;
  //Find out at which position "itemToDelete" is in order to know the array number of which to remove the subarray entries.
  var items = document.getElementsByClassName("item");
  var checkmarks = document.getElementsByClassName("checkmark");
  for (i = 0; i < items.length; i++) {
    //console.log(items[i]);
    if (items[i] == itemToDelete) {
      //console.log(i);
      removeColor(wikidataIds[i]); //remove the color of all polygons from the soon to be deleted district
      //console.log(wikidataIds[i]);

      //Check if soon to be deleted district has the checkmark
      //console.log(checkmarks[i].childNodes[0]);
      if (checkmarks[i].childNodes[0].checked) {
        //Deleted item had checkmark!
        //console.log("Checkmark was on!");
        if (i != 0) { //if deleted item was not the first one:
          checkmarks[0].childNodes[0].checked = true; //check the first item
        } else {
          checkmarks[1].childNodes[0].checked = true; //else check the second item. Will move to 1st position after remove() method below
        }
      }

      wikidataIds.splice(i, 1); //remove subarray (i.e. region/district)
      wikidataIds.push([]); //add an empty 11th subarray to wikidataIDs
      oneColorUp(i); //Color all districts below the deleted one with the next higher color (e.g. from StdColor 4 to 3).
      console.log(wikidataIds);
      break;
    }
  }

  itemToDelete.remove(); //Remove elements from DOM
  itemCounter--;
  //console.log(itemCounter);

  //change counter on id's, so they are consecutively numbered
  var allItems = document.getElementsByClassName("item");
  for (var i = 0; i < allItems.length; i++) {
    allItems[i].setAttribute("id", "item_" + (i));
  }

  createOutput();
}

//Return number of currently selected district radio button
function whatsSelected() {
  //Find out which radio button is selected
  var radios = document.getElementsByName("selected");
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      //console.log(i + " is selected!")
      return i;
    }
  }
}

//If Wikidata ID for certain polygon is ADDED (i.e. no color defined before): Add Wikidata ID to corresponding subarray
function addToWikidataArray(wikidataId) {
  var selected = whatsSelected();
  //console.log(selected);
  //console.log(wikidataIds.length);
  //console.log("Das ist die Wikidata ID: "+wikidataId);
  wikidataIds[selected].push(wikidataId);
  //console.log(wikidataIds);
  createOutput();
}

//If Wikidata ID for certain polygon is REPLACED: Delete Wikidata ID from old subarray and add it to new one
function updateWikidataArray(previousColor, wikidataId) {
  var selected = whatsSelected();
  //Find out which district number is previousColor
  var i = stdColors.indexOf(previousColor);
  //console.log("The previous color is at array position: " +i);
  //Find the Wikdata ID in the subarray
  var j = wikidataIds[i].indexOf(wikidataId);
  //console.log("The Wikidata ID to be removed is at subarray position: " +j);
  //Remove the Wikidata ID from subarray
  wikidataIds[i].splice(j, 1); //at position j remove 1 item
  //Add the Wikidata ID to the newly selected district
  wikidataIds[selected].push(wikidataId);
  console.log(wikidataIds);
  createOutput();
}

//If Wikidata ID for certain polygon is REMOVED (i.e. clicked again): Delete Wikidata ID from corresponding subarray
function removeFromWikidataArray(wikidataId) {
  var selected = whatsSelected();
  //console.log(wikidataId);
  //Find the Wikdata ID in the subarray
  var j = wikidataIds[selected].indexOf(wikidataId);
  //Remove the Wikidata ID from subarray
  wikidataIds[selected].splice(j, 1);
  //console.log(wikidataIds);
  createOutput();
}

//Create/update output text for Wikivoyage (i.e. Mapframe and Mapshapes)
function createOutput() {
  //Create mapshapes
  var mapshape = "{{Mapframe|width=500|height=500|group=map1}}\r\n";
  var titles = document.getElementsByClassName("dname");
  //console.log(titles);
  //console.log(wikidataIds.length)
  var wikidataId;
  var fill;
  var title;

  for (var i = 0; i < wikidataIds.length; i++) {
    if (wikidataIds[i].length != 0) {
      wikidataId = wikidataIds[i];
      fill = "{{StdColor|T" + (i + 1) + "}}"; //Use StdColor syntax of Wikivoyage
      //fill = stdColors[i];
      title = titles[i].value;

      mapshape += "{{Mapshape|type=geoshape|wikidata=" + wikidataId + "|group=map1|fill=" + fill + "|title=" + title + "}}\r\n";
    }
  }
  //Only output the Wikivoyage code, if there are Wikidata elements in array "wikidataIds"
  var empty = true;
  for (var i = 0; i < wikidataIds.length; i++) {
    if (wikidataIds[i].length != 0) {
      empty = false;
      break;
    }
  }

  if (empty) {
    document.getElementById("textareabox").innerHTML = "";
  } else {
    document.getElementById("textareabox").innerHTML = mapshape;
  }
}

//Scroll down to help when clicking on "Help"
function scrollDown() {
  var helpBegin = document.getElementById("help-begin");
  setTimeout(function () { helpBegin.scrollIntoView(); }, 10); //Without delay scrollIntoView does not work.
}

//When clicking in name input field select the whole text and check the district/region
function selectCheckmarkAndName(element) {
  var checkbox = element.parentElement.parentElement.firstElementChild.firstElementChild;
  // console.log(checkbox);
  checkbox.checked = true;
  //Select all text in text field
  element.setSelectionRange(0, element.value.length)
}

//Code to load the external navbar.html
function includeHTML() {
  var z, i, elmnt, file, xhttp;
  /* Loop through a collection of all HTML elements: */
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    /*search for elements with a certain atrribute:*/
    file = elmnt.getAttribute("w3-include-html");
    if (file) {
      /* Make an HTTP request using the attribute value as the file name: */
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
          if (this.status == 200) { elmnt.innerHTML = this.responseText; }
          if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
          /* Remove the attribute, and call this function once more: */
          elmnt.removeAttribute("w3-include-html");
          includeHTML();
        }
      }
      xhttp.open("GET", file, true);
      xhttp.send();
      /* Exit the function: */
      return;
    }
  }
}