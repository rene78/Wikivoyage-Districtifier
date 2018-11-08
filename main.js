var itemCounter = 1;
var stdColors = ["#ac5c91", "#d5dc76", "#b5d29f", "#b383b3", "#71b37b", "#8a84a3", "#d09440", "#578e86", "#d56d76", "#4f93c0", "#69999f"];
var jsonLayer;
var wikidataIds;

//New variables from "dynamic geojson import"
var jsonLayer;
var osmTiles;
var mymap;
var osmIdsArray = [];
var exclusionList="";
var layerControl;

var adminLevels = [
  {name:"nothing", features:undefined},
  {name:"Admin Level 1", features:undefined},
  {name:"Admin Level 2", features:undefined},
  {name:"Admin Level 3", features:undefined},
  {name:"Admin Level 4", features:undefined},
  {name:"Admin Level 5", features:undefined},
  {name:"Admin Level 6", features:undefined},
  {name:"Admin Level 7", features:undefined},
  {name:"Admin Level 8", features:undefined},
  {name:"Admin Level 9", features:undefined},
  {name:"Admin Level 10", features:undefined},
  {name:"Admin Level 11", features:undefined}
];

//On first load create empty array for Wikidata ID's and set up map with Berlin example GeoJSON
createWikidataIds();
//addLeafletMap(exampleGeoJson); //(OLD)

//Add the base map without any layers. (NEW)
addLeafletMap();

//Load the Berlin GeoJSON into the map
showGeoJson(exampleGeoJson);

//Check input from input text area
function checkInput() {
  purge();
  var input = document.getElementById("inputGeoJson").value;
  addLeafletMap(JSON.parse(input));
}

//Purge website, when new GeoJSON is loaded:
//1. Remove old leafleat map
//2. Reset Wikidata ID's array
//3. Empty output text area
function purge() {
  //Replace current map container ("map") with an empty one. Else Leaflet error "container already initialized", when 2nd map is loaded.
  var newdiv = document.createElement("div");
  newdiv.setAttribute("id", "map");
  var oldDiv = document.getElementById("map");
  var parent = document.getElementById("content");
  parent.replaceChild(newdiv,oldDiv);
  //Purge the content of map div element.
  document.getElementById("map").innerHTML="";
  //Reset Wikidata ID's array
  createWikidataIds();
  //Empty output textareabox
  document.getElementById("textareabox").innerHTML="";
}

//Create array with subarrays to save all Wikidata ID's
function createWikidataIds() {
  wikidataIds = new Array(11);
  for (i=0; i<wikidataIds.length; i++) {
    wikidataIds[i]=new Array;
  }
}

//Add a Leaflet map to the page (OLD VERSION)
/*
function addLeafletMap(inputGeoJson) {
  var mymap = L.map('map').setView([0, 0], 11);

  L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
  maxZoom: 18
  }).addTo(mymap);

  jsonLayer = L.geoJSON(inputGeoJson, {
    onEachFeature: onEachFeature,
    style: style
  })

  //Apply standard colors to the polygons (all objects or "features" are forwarded to this function)
  function style() {
    //color = feature.properties.fill; 
    //console.log(color);
    return {"fillColor": undefined, "opacity": 1, "fillOpacity": 0.7, "color": "#555555", "weight": 2};
  }
  //Color polygon according to selected district
  function onEachFeature(feature, layer) {
    //bind click
    layer.on('click', function (e) {
      //e=event
      //console.log(e);
      //console.log(feature.properties.title);
      //console.log("Anzahl der Koordinaten: " +feature.geometry.coordinates[0].length);
      //console.log("Hier sind die Koordinaten gespeichert: " +feature.geometry.coordinates[0][0][0]);
      //createMapmask(feature);
      //console.log(layer);
      //console.log(layer.options.fillColor);
      //var check=layer.options.fillColor === definePolygonColor(feature);
      //console.log(check);

      //Check, if the polygon already has a color defined.
      //If no OR
      //If current color is a different one than the one, which is supposed to be applied:
      //--> Color the polygon according to the selected district.
      //Else if (i.e. color already defined): Remove the color again. Behaves like on/off toggle

      var polygonColor;
      if (typeof layer.options.fillColor == "undefined") {
        //Case: No color defined for this district yet
        polygonColor = stdColors[whatsSelected()];
        layer.setStyle({fillColor: polygonColor});
        addToWikidataArray(feature.properties.tags.wikidata);
      } else if (layer.options.fillColor != stdColors[whatsSelected()]) {
        //Case: Current fill color is different than selected color
        updateWikidataArray(layer.options.fillColor, feature.properties.tags.wikidata);
        polygonColor = stdColors[whatsSelected()];
        layer.setStyle({fillColor: polygonColor});
      }  else {
        //Case: Current fill color = Selected color
        layer.setStyle({fillColor: undefined});
        removeFromWikidataArray(feature.properties.tags.wikidata);
      }

      //console.log("Wikidata ID: " +feature.properties.tags.wikidata);
    });
  }

  //Add the JSON layer to the map
  jsonLayer.addTo(mymap);

  //Center and zoom the map on the provided GeoJSON
  mymap.fitBounds(jsonLayer.getBounds());
}
*/

//Add a Leaflet map with empty layers to the page (NEW)
function addLeafletMap() {
  mymap = L.map('map').setView([0, 0], 1);

  osmTiles = L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
  maxZoom: 18
  }).addTo(mymap);

  // create operational layers that are empty for now
  adminLevels[1].features = L.layerGroup().addTo( mymap );//layerAdminL1 = L.layerGroup().addTo( mymap );
  adminLevels[2].features = L.layerGroup().addTo( mymap );//layerAdminL2 = L.layerGroup().addTo( mymap );
  adminLevels[3].features = L.layerGroup().addTo( mymap );//layerAdminL3 = L.layerGroup().addTo( mymap );
  adminLevels[4].features = L.layerGroup().addTo( mymap );//layerAdminL4 = L.layerGroup().addTo( mymap );
  adminLevels[5].features = L.layerGroup().addTo( mymap );//layerAdminL5 = L.layerGroup().addTo( mymap );
  adminLevels[6].features = L.layerGroup().addTo( mymap );//layerAdminL6 = L.layerGroup().addTo( mymap );
  adminLevels[7].features = L.layerGroup().addTo( mymap );//layerAdminL7 = L.layerGroup().addTo( mymap );
  adminLevels[8].features = L.layerGroup().addTo( mymap );//layerAdminL8 = L.layerGroup().addTo( mymap );
  adminLevels[9].features = L.layerGroup().addTo( mymap );//layerAdminL9 = L.layerGroup().addTo( mymap );
  adminLevels[10].features = L.layerGroup().addTo( mymap );//layerAdminL10 = L.layerGroup().addTo( mymap );
  adminLevels[11].features = L.layerGroup().addTo( mymap );//layerAdminL11 = L.layerGroup().addTo( mymap );
}

//download GeoJSON via overpass API and forward it to showGeoJson function (NEW)
function fetchExternalGeojson() {
  //make sure that polygons, which have already been loaded into the map, are excluded from the query
  //only create exclusion list for subsequent queries (i.e. from 2nd query onwards)
  if (osmIdsArray.length > 0) {
    exclusionList = "- relation(id:" + osmIdsArray.join() + ");";
  }
  //console.log("Content of exclusion list: " +exclusionList);

  //Make sure that the type of downloaded admin boundaries depends on current zoom level.
  //If zoomed in closely (e.g. zoom level>9 show admin_levels 7-11). If zoom level>=6 --> admin_level 3-6, else "zoom in closer!"
  var lowerAdminLevel = 3;
  var higherAdminLevel = 6;
  var currentZoomLevel = mymap.getZoom();

  if (currentZoomLevel < 7) {
    alert("Zoom in closer to load boundaries!");
    return;
  } else if (currentZoomLevel > 9){
    lowerAdminLevel = 7;
    higherAdminLevel = 11;
  }

  var bbox = getBboxCoordinates(); //get bounding box from current map view
  //var bbox = "47.449,8.287,47.490,8.355"; //Some hardcoded values for bounding box for testing

  //Overpass search query
  var searchQuery = '[out:json][timeout:60];(relation[admin_level](if:(t["admin_level"] >= '+lowerAdminLevel+' &&t["admin_level"] <= '+higherAdminLevel+'))["wikidata"]('+bbox+');'+exclusionList+');out body;>;out skel qt;';
  console.log("Paste to overpass turbo for debugging purposes: "+searchQuery);
  var searchQueryEnc = encodeURIComponent(searchQuery);
  var apiUrl = "https://overpass-api.de/api/interpreter?data=" + searchQueryEnc;
  console.log(apiUrl);

  //Grey out map during fetch of boundaries
  greyOut();

  fetch(apiUrl)
  .then(handleErrors)
  .then(function(response) {
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
  }).catch(function(error) {
    console.log("Something went wrong! " +error);
    //also stop greying out map if there was an error
    greyOut();
  });
}

//Check response from API. If error throw it to catch (NEW)
function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

//Show GeoJSON polygons on the Leaflet map & add layer control on top right of the map (NEW)
function showGeoJson(inputGeoJson) {
  jsonLayer = L.geoJSON(inputGeoJson, {
    onEachFeature: onEachFeature,
    style: style,
    filter: filterPoints
  })

  jsonLayer.addTo(mymap);

  //Center and zoom the map on the provided GeoJSON
  mymap.fitBounds(jsonLayer.getBounds());

  // Define layer control elements on top right of map
  var basemapControl = {
    "OSM Tiles": osmTiles, // an option to select a basemap (makes more sense if you have multiple basemaps)
  }

  var adminLayerControl={};
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
  layerControl = L.control.layers( basemapControl, adminLayerControl,{collapsed:false} ).addTo( mymap )
  //console.log(layerControl);

  //Update layers on new load. Without this on/off the newly loaded element won't be on the layer.
  //Very awkward solution! There must be some update functionality!
  for (let i = 1; i < adminLevels.length; i++) {
    if (mymap.hasLayer(adminLevels[i].features)==false) { //check if layer is not activated
      console.log("Layer was NOT activated!");
      mymap.addLayer(adminLevels[i].features); //tick layer
      mymap.removeLayer(adminLevels[i].features); //untick layer
    }
  }
}

//Apply standard colors to the polygons (NEW)
//(each object or "feature" is computed by this function)
function style() {
  //color = feature.properties.fill; 
  //console.log(color);
  return {"fillColor": undefined, "opacity": 1, "fillOpacity": 0.7, "color": "#555555", "weight": 2};
}

//1. Assign each feature to a layer depending on its admin_level (NEW)
//2. Add each OSM relation id to an array to make sure, that this polygon isn't downloaded on subsequent fetches
//(each object or "feature" is computed by this function)
function onEachFeature(feature, layer) {
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
        layer.setStyle({fillColor: polygonColor});
        addToWikidataArray(feature.properties.tags.wikidata);
      } else if (layer.options.fillColor != stdColors[whatsSelected()]) {
        //Case: Current fill color is different than selected color
        updateWikidataArray(layer.options.fillColor, feature.properties.tags.wikidata);
        polygonColor = stdColors[whatsSelected()];
        layer.setStyle({fillColor: polygonColor});
      }  else {
        //Case: Current fill color = Selected color
        layer.setStyle({fillColor: undefined});
        removeFromWikidataArray(feature.properties.tags.wikidata);
      }

      //console.log("Wikidata ID: " +feature.properties.tags.wikidata);
    });

  //add GeoJSON features to layer
  //var admin_level = feature.properties.admin_level;
  var admin_level = feature.properties.tags.admin_level; //subelement "tags" only for geojson from overpass api.

  switch (admin_level) {
    case "1": adminLevels[admin_level].features.addLayer( layer ); break; //add polygon to adminLevels[0]
    case "2": adminLevels[admin_level].features.addLayer( layer ); break;
    case "3": adminLevels[admin_level].features.addLayer( layer ); break;
    case "4": adminLevels[admin_level].features.addLayer( layer ); break;
    case "5": adminLevels[admin_level].features.addLayer( layer ); break;
    case "6": adminLevels[admin_level].features.addLayer( layer ); break;
    case "7": adminLevels[admin_level].features.addLayer( layer ); break;
    case "8": adminLevels[admin_level].features.addLayer( layer ); break;
    case "9": adminLevels[admin_level].features.addLayer( layer ); break;
    case "10": adminLevels[admin_level].features.addLayer( layer ); break;
    case "11": adminLevels[admin_level].features.addLayer( layer ); break;
  }

  //Write all relation id's into an array

  //for local GeoJSON
  //var osmId = feature.properties["@id"];
  //osmId = osmId.replace( /^\D+/g, '');
  //console.log(osmId);
  //osmIdsArray.push(osmId);

  //for GeoJSON's from overpass and osmtogeojson
  var osmId = feature.properties.id;

  if (osmIdsArray.includes(osmId)==false) {
    osmIdsArray.push(osmId);
  }
  //console.log(osmIdsArray);
}

//Filter out all the label points from GeoJSON so the map doesn't look so messy (NEW)
//(each object or "feature" is computed by this function)
function filterPoints(layer) {
  //console.log(layer);

  if (layer.geometry.type != "Point") {
    //console.log(layer);
    return true; //Show all features which are NOT of type "Point"
  }
}

//get the s,w,n,e cordinates of the current map section and write it to bbox variable (NEW)
function getBboxCoordinates() {
console.log("Current zoom level: " +mymap.getZoom());
var bounds = mymap.getBounds();
var bbox = bounds.getSouthWest().lat + ',' +
            bounds.getSouthWest().lng + ',' +
            bounds.getNorthEast().lat + ',' +
            bounds.getNorthEast().lng;
return bbox;
console.log("bbox: " +bbox);
}

//Check current zoom level of map and grey it out with message, if zoom level < 7 (NEW)
mymap.on('zoom', function(e) { // e is an event object (MouseEvent in this case)
  var currentZoomLevel = mymap.getZoom();
  // var map = document.getElementById("map");
  var infoText = document.getElementById("zoom-in");
  if (currentZoomLevel < 7) {
    // console.log("Zoom level below 7");
    // map.classList.add("faded");
    infoText.classList.remove("hide");
  } else {
    // console.log("Zoom level >= 7");
    // map.classList.remove("faded");
    infoText.classList.add("hide");
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
  if (button.disabled==false) {
    button.disabled=true;
  } else {
    button.disabled=false;
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
    for (var i=0; i<ids.length; i++) {
      if(layer.feature.properties.tags.wikidata == ids[i]) {
        //console.log(ids[i]);
        layer.setStyle({fillColor: undefined})
      }
    }
  });
}

//Color all districts polygons below the deleted one with a color 1 number above the current one (e.g. instead of std color 4 change to 3)
function oneColorUp(startAt) {
  jsonLayer.eachLayer(function (layer) {
    for (i=startAt; i<wikidataIds.length; i++) {
      if (wikidataIds[i].length != 0) {
        for (j=0; j<wikidataIds[i].length; j++) {
          if(layer.feature.properties.tags.wikidata == wikidataIds[i][j]) {
            layer.setStyle({fillColor: stdColors[i]})
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
  var item = '<div id="item_'+itemCounter+'" class="item"><div class=checkmark><input type="radio" name="selected" checked="checked" title="Activate district to add/remove polygons"></div><div class=title><input type="text" class="dname" placeholder="Please enter district name" value="District '+itemCounter+'" title="Enter name of district"></div><div class=delete onclick="removeDistrict(this)"><img src="img/Octagon_delete.svg" alt="Delete" title="Click to delete district"></div></div>';
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
  var itemToDelete = dustbin.parentNode;
  //Find out at which position "itemToDelete" is in order to know the array number of which to remove the subarray entries.
  var items = document.getElementsByClassName("item");
  for (i=0;i<items.length;i++) {
    //console.log(items[i]);
    if (items[i] == itemToDelete) {
      //console.log(i);
      removeColor(wikidataIds[i]); //remove the color of all polygons from the soon to be deleted district
      //console.log(wikidataIds[i]);
      wikidataIds.splice(i,1);
      wikidataIds.push([]);
      //wikidataIds[i].splice(0,wikidataIds[i].length); //from position 0 remove all items of this subarray
      oneColorUp(i); //Color all districts below the deleted one with a color one above the current one.
      console.log(wikidataIds);
      break;
    }
  }

  itemToDelete.remove();
  itemCounter--;
  //console.log(itemCounter);

  //change counter on id's, so they are consecutively numbered
  var allItems = document.getElementsByClassName("item");
  for (var i=0; i<allItems.length; i++) {
    allItems[i].setAttribute("id","item_" + (i));
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
  wikidataIds[i].splice(j,1); //at position j remove 1 item
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
  wikidataIds[selected].splice(j,1);
  //console.log(wikidataIds);
  createOutput();
}

//Create Mapframe and Mapshapes for Wikivoyage
function createOutput() {
  //Create mapshapes
  var mapshape="{{Mapframe|width=500|height=500|group=map1}}\r\n";
  var titles = document.getElementsByClassName("dname");
  //console.log(titles);
  //console.log(wikidataIds.length)
  var wikidataId;
  var fill;
  var title;

  for (var i = 0; i < wikidataIds.length; i++) {
    if (wikidataIds[i].length !=0) {
      wikidataId=wikidataIds[i];
      fill = "{{StdColor|T"+(i+1)+"}}"; //Use StdColor syntax of Wikivoyage
      //fill = stdColors[i];
      title = titles[i].value;

      mapshape += "{{Mapshape|type=geoshape|wikidata=" + wikidataId + "|group=map1|fill=" + fill + "|title=" + title + "}}\r\n";
    }
  }
  document.getElementById("textareabox").innerHTML = mapshape;
}