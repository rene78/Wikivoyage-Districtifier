var itemCounter = 2;

function addDistrict() {
  //Stop execution, if 11 districts have already been added
  if (itemCounter >= 11) {
    alert("No more than 11 districts, please!");
    return;
  }
  itemCounter++;
  console.log(itemCounter);
  //console.log("Distrikt Nr. " + itemCounter + " hinzugefügt!");
  var item = '<div id="item_'+itemCounter+'" class="item"><div class=checkmark><input type="radio" name="selected" checked="checked"></div><div class=title>District '+itemCounter+'</div><div class=delete onclick="removeDistrict(this)">DEL</div></div>';
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
  console.log(itemToDelete);
  itemToDelete.remove();
  itemCounter--;
  console.log(itemCounter);
  //rename id's
  var allItems = document.getElementsByClassName("item");
  for (var i=0; i<allItems.length; i++) {
    allItems[i].setAttribute("id","item_" + (i+1));
  }
}