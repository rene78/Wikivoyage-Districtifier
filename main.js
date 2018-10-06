var itemCounter = 2;
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
  var item = '<div id="item_'+itemCounter+'" class="item"><div class=checkmark><input type="radio" name="selected" checked="checked"></div><div class=title>District '+itemCounter+'</div><div class=delete onclick="removeDistrict(this)"><img src="img/dustbin.png" alt="Delete"</div></div>';
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
      color = feature.properties.fill; 
      console.log(color);
      return {"fillColor": color, "opacity": 1, "fillOpacity": 0.7, "color": "#555555", "weight": 2};
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
      console.log(e);
      //console.log(feature.properties.title);
      //console.log("Anzahl der Koordinaten: " +feature.geometry.coordinates[0].length);
      //console.log("Hier sind die Koordinaten gespeichert: " +feature.geometry.coordinates[0][0][0]);
      //createMapmask(feature);
    });
  }
}