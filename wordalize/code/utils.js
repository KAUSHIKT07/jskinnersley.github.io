var output = document.getElementById("output")
var doorsDiv = document.getElementById("doorsDiv")
var dialog = document.getElementById("dialog")
var toolbar = document.getElementById("toolbar")
var map = document.getElementById("map")
var me = document.getElementById("me")
var popup = document.getElementById("popup")
var popupInput = document.getElementById("popupInput")
var popupInputDiv = document.getElementById("popupInputDiv")
var popupMessage = document.getElementById("popupMessage")
var storyTable = document.getElementById("storyTable")
var WORD_DELAY_MS = 5

var toolbarType = ""

//splices array so that only the first "length" elements remain
truncateArray = function (array, length) {
  array.splice(length, array.length - length)
}

getArrayElement = function (array, index) {
  var quotedIndex = "'" + index + "'"
  if (array[index] != null) {
    return array[index]
  } else if (array[quotedIndex] != null) {
    return array[quotedIndex]
  } else {
    for (var obj in array) {
      if (array[obj].name == index) {
        return array[obj]
      }
    }
    for (var obj in array) {
      if (array[obj] == index) {
        return obj
      }
    }
  }
}

doActionOn = function (object, action) {
  try {
    popup.style.visibility = "hidden";
    if (action == "pack") {
      game.addToPack(object)
    } else if (action == "drop") {
      game.removeFromPack(object)
    } else {
      game.getObject(object).handleAction(action)
      game.currentRoom.writeObjects()
      game.currentRoom.writeDoors()
    }
    return false;
  } catch (e) {
    alert(e.stack)
  }
}

doActionOnChar = function (char, script, action) {
  try {
    popup.style.visibility = "hidden";
    game.getCharacter(char).handleAction(script, action)
    return false;
  } catch (e) {
    alert(e.stack)
  }
}

objectClicked = function (name) {
  showPopupForObject(name)
  return false;
}

enterRoom = function (name) {
  game.tryToEnterRoom(name)
  return false;
}

formatText = function (text) {
  var pos = text.indexOf("{audio:")
  while (pos >= 0) {
    var pos2 = text.indexOf("}", pos)
    var file = text.substring(pos + 7, pos2)
    audioFiles.push(file)
    text = text.substring(0, pos) + " <AUDIO" + audioFiles.length + "> " + text.substring(pos2 + 1)
    pos = text.indexOf("{audio:")
  }
  return text.replace(/\n/g, "<br><br>").replace(/{}/g, "</span>").replace(/{([^}]*)}/g, "<span class=\"$1\">");
}

clearOutput = function () {
  output.innerHTML = "";
  // dialog.innerHTML = "";
  hidePopup();
}

writeW = function (str) {
  output.innerHTML += "<div class='blackText'>" + str + "</div>";
}

writeR = function (str) {
  output.innerHTML += "<div class='redText'>" + str.replace("  ", "<BR>&nbsp;&nbsp;&nbsp;&nbsp;") + "<BR><BR>";
}

writeY = function (str) {
  output.innerHTML += "<div class='yellowText'>" + str + "</div>";
}

writeB = function (str) {
  output.innerHTML += "<div class='blueText'>" + str + "</div>";
}

interpolate = function (object, property, fromVal, toVal, num) {
  console.log(object, property, fromVal, toVal, num);
  if (num > 0) {
    object[property] = fromVal
    fromVal += (toVal - fromVal) / num
    setTimeout(interpolate, 1000, object, property, fromVal, toVal, num - 1)
  }
}

var dialogTokens = []
var writing = false

var audioFiles = []

indexOfElem = function (str) {
  var ind = str.indexOf("<a")
  if (ind < 0) {
    ind = str.indexOf("<div")
  }
  if (ind < 0) {
    ind = str.indexOf("<span")
  }
  return ind
}

convertBoolean = function(val) {
  if(val == "true") {
    return true
  } else if(val == "false") {
    return false
  }
  return val
}

writeTokens = function () {
  writing = true
  if (dialogTokens.length == 0) {
    setTimeout(writeTokens, 500)
    return;
  }
  var tok = dialogTokens[0];
  var res = ""
  var ind = indexOfElem(tok)
  if (ind >= 0) {
    var rest = tok.substring(ind + 1)
    while (dialogTokens.length > 0 && tok.indexOf("</" + rest + ">") < 0) {
      res += " " + tok
      dialogTokens.splice(0, 1)
      tok = dialogTokens[0]
    }
  }
  if (tok.indexOf("<AUDIO") == 0) {
    dialogTokens.splice(0, 1)
    var ind = 1 * res.substring(6, res.indexOf(">"))
    var file = audioFiles[ind]
    try {
      var aud = document.getElementById("advAudio")
      aud.src = file
      aud.onended = function () {
        setTimeout(writeTokens, WORD_DELAY_MS)
      };
      aud.play()
    } catch(e) {
      setTimeout(writeTokens, WORD_DELAY_MS)
    }
    return
  }
  res += " " + tok
  dialogTokens.splice(0, 1)
  dialog.innerHTML += " " + res
  dialog.scrollTop = dialog.scrollHeight
  setTimeout(writeTokens, WORD_DELAY_MS)
}

writeDialog = function (str, cls) {
  str = formatText(str)
  if (cls != null) {
    str = "<div class='" + cls + "'>" + str + "</div>"
  }
  // str += "<br>"
  var tokens = str.split(" ")
  dialogTokens = dialogTokens.concat(tokens)
  if (!writing) {
    writeTokens()
  }
}

writeToolbar = function (str) {
  toolbar.innerHTML = "<div class='redText'>" + str + "</div><BR>";
}

writeDoorsDiv = function (str) {
  doorsDiv.innerHTML += "<div class='blackText'>" + str + "</div>";
}

showPopup = function (forInput) {
  popup.style.visibility = "visible";
  // popup.style.top = "150px";
  // popup.style.left = "150px";
  popup.style.top = (event.pageY + 15) + "px";
  popup.style.left = (event.pageX) + "px";
  if (forInput) {
    popupInputDiv.style.visibility = "visible";
    popupInputDiv.style.height = "20px";
    popupInput.focus();
  }
}

showPopupForObject = function (name) {
  var object = game.getObject(name)
  if (popup.style.visibility != "visible") {
    showPopup();
  } else {
    hidePopup();
  }
  popupMessage.innerHTML = object.getPopupText()
}

hidePopup = function () {
  popupInputDiv.style.visibility = "hidden";
  popupInputDiv.style.height = "0px";
  popup.style.visibility = "hidden";
}

showDiv = function (div) {
  div.style.visibility = "visible"
  div.style["border-width"] = "0.5px"
  div.style["padding"] = "10px"
  div.style["height"] = null
}

hideDiv = function (div) {
  div.style.visibility = "hidden"
  div.style["border-width"] = "0px"
  div.style["padding"] = "0px"
  div.style["height"] = "0px"
}

toggleDiv = function (div, type) {
  if (type != toolbarType || div.style.visibility != 'visible') {
    showDiv(div)
  } else {
    hideDiv(div)
  }
  toolbarType = type
}

getIntValue = function (json, prop, defVal) {
  var val = json[prop];
  val = val != null ? val : defVal;
  return 1 * val;
}

getBoolValue = function (json, prop, defVal) {
  var val = json[prop];
  val = val != null ? val : defVal;
  return "true" == val + "";
}
