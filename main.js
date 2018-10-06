var itemCounter = 2;

var wikidataIds = {
  "T1" : [],
  "T2" : [],
  "T3" : [],
  "T4":[],
  "T5":[],
  "T6":[],
  "T7":[],
  "T8":[],
  "T9":[],
  "T10":[],
  "T11":[]
}

/*
var wikidataIds = [
  T1 = ["äffle","pferdle"],
  T2 = [],
  T3 = [],
  T4=[],
  T5=[],
  T6=[],
  T7=[],
  T8=[],
  T9=[],
  T10=[],
  T11=[],
  T12=[]
];
*/
//T2, T3, T4, T5, T6, T7, T8, T9, T10, T11;

var distrGeoJson =
{
  "type": "FeatureCollection",
  "generator": "overpass-ide",
  "copyright": "The data included in this document is from www.openstreetmap.org. The data is made available under ODbL.",
  "timestamp": "2018-10-06T13:50:02Z",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "@id": "relation/8398087",
        "admin_level": "10",
        "boundary": "administrative",
        "name": "Columbus Circle",
        "place": "neighbourhood",
        "type": "boundary",
        "wikidata": "Q109968"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -73.9834034,
              40.7710864
            ],
            [
              -73.9843181,
              40.7698412
            ],
            [
              -73.9847606,
              40.7692277
            ],
            [
              -73.9857128,
              40.7679195
            ],
            [
              -73.9828759,
              40.7667118
            ],
            [
              -73.9800319,
              40.7655204
            ],
            [
              -73.9790744,
              40.7668754
            ],
            [
              -73.9811759,
              40.7677692
            ],
            [
              -73.9813569,
              40.767953
            ],
            [
              -73.9815554,
              40.7685208
            ],
            [
              -73.9805737,
              40.7699103
            ],
            [
              -73.9834034,
              40.7710864
            ]
          ]
        ]
      },
      "id": "relation/8398087"
    },
    {
      "type": "Feature",
      "properties": {
        "@id": "relation/8398090",
        "admin_level": "10",
        "boundary": "administrative",
        "name": "Midtown",
        "place": "neighbourhood",
        "type": "boundary",
        "wikidata": "Q11249"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -73.9865711,
              40.7616564
            ],
            [
              -73.9808822,
              40.7592733
            ],
            [
              -73.9841142,
              40.7548421
            ],
            [
              -73.9808875,
              40.7534788
            ],
            [
              -73.9730126,
              40.7642791
            ],
            [
              -73.9790744,
              40.7668754
            ],
            [
              -73.9800319,
              40.7655204
            ],
            [
              -73.9828759,
              40.7667118
            ],
            [
              -73.9865711,
              40.7616564
            ]
          ]
        ]
      },
      "id": "relation/8398090"
    },
    {
      "type": "Feature",
      "properties": {
        "@id": "node/158858760",
        "@relations": [
          {
            "role": "label",
            "rel": 8398090,
            "reltags": {
              "admin_level": "10",
              "boundary": "administrative",
              "name": "Midtown",
              "place": "neighbourhood",
              "type": "boundary",
              "wikidata": "Q11249"
            }
          }
        ]
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          -73.9795443,
          40.7622684
        ]
      },
      "id": "node/158858760"
    },
    {
      "type": "Feature",
      "properties": {
        "@id": "node/5706568329",
        "@relations": [
          {
            "role": "label",
            "rel": 8398087,
            "reltags": {
              "admin_level": "10",
              "boundary": "administrative",
              "name": "Columbus Circle",
              "place": "neighbourhood",
              "type": "boundary",
              "wikidata": "Q109968"
            }
          }
        ]
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          -73.9831782,
          40.7683868
        ]
      },
      "id": "node/5706568329"
    }
  ]
}

var stdColors = {T1:"#ac5c91", T2:"#d5dc76", T3:"#b5d29f", T4:"#b383b3", T5:"#71b37b", T6:"#8a84a3", T7:"#d09440", T8:"#578e86", T9:"#d56d76", T10:"#4f93c0", T11:"#69999f"};

addMapwithGeoJson(distrGeoJson);

function addDistrict() {
  //Stop execution, if 11 districts have already been added
  if (itemCounter >= 11) {
    alert("No more than 11 districts, please!");
    return;
  }
  itemCounter++;
  //console.log(itemCounter);
  //console.log("Distrikt Nr. " + itemCounter + " hinzugefügt!");
  var item = '<div id="item_'+itemCounter+'" class="item"><div class=checkmark><input type="radio" name="selected"></div><div class=title>District '+itemCounter+'</div><div class=delete onclick="removeDistrict(this)"><img src="img/dustbin.png" alt="Delete"</div></div>';
  var d1 = document.getElementById('content');
  d1.insertAdjacentHTML('beforeend', item);

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

function removeDistrict(number) {
  var itemToDelete = number.parentNode;
  //console.log(itemToDelete);
  itemToDelete.remove();
  itemCounter--;
  //console.log(itemCounter);
  //rename id's
  var allItems = document.getElementsByClassName("item");
  for (var i=0; i<allItems.length; i++) {
    allItems[i].setAttribute("id","item_" + (i+1));
  }
}

function addMapwithGeoJson (distrGeoJson) {
  //Add a Leaflet map to the page
  var mymap = L.map('map').setView([0, 0], 11);

  L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
  maxZoom: 18
  }).addTo(mymap);

  var jsonLayer = L.geoJSON(distrGeoJson, {
    onEachFeature: onEachFeature,
    //Color the Leaflet map similar to the GeoJSON
    style: function(feature) {
      //color = feature.properties.fill; 
      //console.log(color);
      return {"fillColor": undefined, "opacity": 1, "fillOpacity": 0.7, "color": "#555555", "weight": 2};
    }
    
  })
  //Add the JSON layer to the map
  jsonLayer.addTo(mymap);
  //Center and zoom the map on the provided GeoJSON
  mymap.fitBounds(jsonLayer.getBounds());

  //Start the conversion to a mapmask, if a feature (e.g. a district) is clicked.
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

      if (typeof layer.options.fillColor == "undefined" ||layer.options.fillColor != definePolygonColor(feature)) {
        //console.log("undefined!");
        var polygonColor = definePolygonColor(feature);
        layer.setStyle({fillColor: polygonColor});
        //console.log("Defined color: " +polygonColor);
      } else {
        layer.setStyle({fillColor: undefined});
      }

      assignWikidata(feature.properties.wikidata)
/*
      //console.log("Wikidata ID: " +feature.properties.wikidata);
*/
      
    });
  }
}

function whatsSelected() {
  //Find out which radio button is selected
  var radios = document.getElementsByName("selected");
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      //console.log(i + 1 + " is selected!")
      return i+1;
    }
  }
}

function definePolygonColor(feature) {
  //Find out which radio button is selected
  var selected = whatsSelected();
  //console.log(selected + " is selected!");
  //console.log(feature.properties.wikidata);
  var color;
  switch (selected) {
    case 1:
      color = stdColors.T1;
      return color;
      break;
    case 2:
      color = stdColors.T2;
      return color;
      break;
    case 3:
      color = stdColors.T3;
      return color;
      break;
    case 4:
      color = stdColors.T4;
      return color;
      break;
    case 5:
      color = stdColors.T5;
      return color;
      break;
    case 6:
      color = stdColors.T6;
      return color;
      break;
    case 7:
      color = stdColors.T7;
      return color;
      break;
    case 8:
      color = stdColors.T8;
      return color;
      break;
    case 9:
      color = stdColors.T9;
      return color;
      break;
    case 10:
      color = stdColors.T10;
      return color;
      break;
    case 11:
      color = stdColors.T11;
      return color;
      break;
  }
}

function assignWikidata(wikidataId) {
  var selected = whatsSelected();
  var variable = "T"+selected;

  for(var key in wikidataIds) {
    //console.log(key);
    if(key === variable) {
      //console.log("Gefunden!");
      wikidataIds[key].push(wikidataId);
    }
  }

  console.log(wikidataIds.T1[0]);
  console.log(wikidataIds);
  //console.log(wikidataIds.indexOf("T1"));

  //console.log("Das ist die Wikidata ID: "+wikidataId);
}