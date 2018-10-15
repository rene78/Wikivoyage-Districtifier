var itemCounter = 1;

//Create array with subarrays to save all Wikidata ID's
var wikidataIds = new Array(11);
for (i=0; i<wikidataIds.length; i++) {
  wikidataIds[i]=new Array;
}

var stdColors = ["#ac5c91", "#d5dc76", "#b5d29f", "#b383b3", "#71b37b", "#8a84a3", "#d09440", "#578e86", "#d56d76", "#4f93c0", "#69999f"];

//Add a Leaflet map to the page
var mymap = L.map('map').setView([0, 0], 11);

L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
maxZoom: 18
}).addTo(mymap);

var jsonLayer = L.geoJSON(distrGeoJson, {
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
      addToWikidataArray(feature.properties.wikidata);
    } else if (layer.options.fillColor != stdColors[whatsSelected()]) {
      //Case: Current fill color is different than selected color
      updateWikidataArray(layer.options.fillColor, feature.properties.wikidata);
      polygonColor = stdColors[whatsSelected()];
      layer.setStyle({fillColor: polygonColor});
    }  else {
      //Case: Current fill color = Selected color
      layer.setStyle({fillColor: undefined});
      removeFromWikidataArray(feature.properties.wikidata);
    }

    //console.log("Wikidata ID: " +feature.properties.wikidata);
  });
}

//Add the JSON layer to the map
jsonLayer.addTo(mymap);

//Center and zoom the map on the provided GeoJSON
mymap.fitBounds(jsonLayer.getBounds());

//Remove colors from polygons, whose districts have been deleted.
function removeColor(ids) {
  //console.log(ids.length);
  //For each layer (i.e. polygon) the code below is executed.
  jsonLayer.eachLayer(function (layer) {
    //console.log(layer.feature.properties.wikidata);
    for (var i=0; i<ids.length; i++) {
      if(layer.feature.properties.wikidata == ids[i]) {
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
          if(layer.feature.properties.wikidata == wikidataIds[i][j]) {
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
  var item = '<div id="item_'+itemCounter+'" class="item"><div class=checkmark><input type="radio" name="selected"><span class="tooltiptext">Activate district to add/remove polygons</span></div><div class=title><input type="text" class="dname" placeholder="Please enter district name" value="District  '+itemCounter+'"></div><div class=delete onclick="removeDistrict(this)"><img src="img/Octagon_delete.svg" alt="Delete"><span class="tooltiptext">Click to delete district</span></div></div>';
  var content = document.getElementById('content');
  content.insertAdjacentHTML('beforeend', item);

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
  console.log(wikidataId);
  //Find the Wikdata ID in the subarray
  var j = wikidataIds[selected].indexOf(wikidataId);
  //Remove the Wikidata ID from subarray
  wikidataIds[selected].splice(j,1);
  console.log(wikidataIds);
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
