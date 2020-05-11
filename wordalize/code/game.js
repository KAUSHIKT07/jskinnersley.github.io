

var BLOCK_SIZE = 30;
var PLAYER_SIZE = BLOCK_SIZE * 0.8

var CLEAR_HISTORY = false;

var propListeners = []

class Game {

  addPropertyListener(func) {
      propListeners.push(func)
  }
  
  getProperty(objectName, propertyName) {
      var obj = objectName
      if(objectName.trim) {
        obj = game.getObject(objectName)
      }
      if (obj != null) {
          return obj.properties[propertyName]
      }
  }
  
  setProperty(objectName, propertyName, value) {
      var obj = game.getObject(objectName)
      if (obj != null) {
          obj.properties[propertyName] = value
          for(var i=0;i<propListeners.length;i++) {
              var func = propListeners[i].propertyChanged
              if(func != null) {
                  func(objectName, propertyName, value)
              }
          }
      }
  }
  constructor(output, map) {
    this.output = output;
    this.map = map;
    hideDiv(toolbar)
    popupInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        game.enterPressed(popupInput);
      }
    });
  }

  start() {
    clearOutput();
    this.enterRoom(gameJson["startRoom"]);
  }

  showCharacters() {
    hideDiv(map)
    toggleDiv(toolbar, "characters")
    writeToolbar("Characters will be here")
  }

  showHelp() {
    hideDiv(map)
    toggleDiv(toolbar, "help")
    writeToolbar("Here's some help for ya!")
  }

  showBackpack() {
    hideDiv(map)
    toggleDiv(toolbar, "backpack")
    writeToolbar(this.getBackpackText())
  }

  propertyChanged(objName, propName, value) {
    for (var i = 0; i < this.currentRoom.objects.length; i++) {
      this.getObject(this.currentRoom.objects[i]).propertyChanged(objName, propName, value)
    }
  }

  getBackpackText() {
    var txt = "";
    for (var i = 0; i < this.backpack.length; i++) {
      txt += this.getObject(this.backpack[i]).getLink() + " &nbsp;";
    }
    if (txt == "") {
      txt = "Nothing in backpack"
    }
    return txt
  }


  showMap() {
    if (map.style.display != 'inline') {
      map.style.display = 'inline'
    } else {
      map.style.display = 'none'
    }
    // if(map.style.visibility != "visible") {
    //   hideDiv(toolbar)
    //   showDiv(map)
    //   map.style.height = map.style.maxHeight;
    // } else {
    //   hideDiv(map)
    // }
  }

  init() {
    try {
      dialog.innerHTML = ''

      var gameInfo = gameJson["game"]

      WORD_DELAY_MS = getIntValue(gameInfo, "wordDelayMS", 5)
      CLEAR_HISTORY = getBoolValue(gameInfo, "clearHistory", false)

      var start = "character/" + gameInfo["start"];
      document.getElementById("title").innerHTML = formatText(gameInfo["title"]);
      document.getElementById("icon").innerHTML = formatText(gameInfo["icon"]);

      var text = '';
      var menu = gameJson["menu"];
      for (var item in menu) {
        text += " &nbsp; [ <a class='advLink' href='' onclick='game." + menu[item] + "(); return false;'>" + item + "</a> ] &nbsp;"
      }
      document.getElementById("menu").innerHTML = formatText(text)

      this.backpack = []

      this.rooms = [];
      var jrooms = gameJson["rooms"];
      var minX = 10000;
      var minY = 10000;
      var maxX = 0;
      var maxY = 0;
      for (var i = 0; i < jrooms.length; i++) {
        var room = new Room(jrooms[i]);
        this.rooms[i] = room;
        room.draw(this.map)
        minX = Math.min(minX, room.minX)
        minY = Math.min(minY, room.minY)
        maxX = Math.max(maxX, room.maxX)
        maxY = Math.max(maxY, room.maxY)
      }
      map.style.width = (BLOCK_SIZE * (maxX + 2)) + "px";
      map.style.maxHeight = (BLOCK_SIZE * (maxY + 2)) + "px";
      map.style.height = map.style.maxHeight;
      // map.style.height = "0px";

      me.style.width = PLAYER_SIZE + "px";
      me.style.height = PLAYER_SIZE + "px";
      me.style["line-height"] = PLAYER_SIZE + "px";
      me.style["border-radius"] = (PLAYER_SIZE / 2) + "px";

      this.doors = [];
      var jdoors = gameJson["doors"];
      for (var i = 0; i < jdoors.length; i++) {
        var door = new Door(jdoors[i]);
        this.getRoom(door.roomNames[0]).doors.push(door)
        this.getRoom(door.roomNames[1]).doors.push(door)
        this.doors[i] = door;
      }

      this.objects = []
      var jobjects = gameJson["objects"];
      for (var i = 0; i < jobjects.length; i++) {
        var object = new Object(jobjects[i]);
        this.objects[i] = object;
      }

      this.characters = []
      var jcharacters = gameJson["characters"];
      for (var i = 0; i < jcharacters.length; i++) {
        var char = new Character(jcharacters[i]);
        this.characters[i] = char;
      }

      this.handleResult([start]);
    } catch (e) {
      alert(e.stack)
    }
  }

  evaluate(exp) {
    if (exp.startsWith("code/")) {
      exp = exp.substring(5)
      try {
        exp = eval(exp)
      } catch (e) {
        alert("Error evaluating '" + exp + "'\n" + e.stack)
      }
    }
    return exp
  }

  handleAction(action, object) {
    if (object != null && !this.inPack(object.name)) {
      writeDialog("I see a " + object.description, "redText")
    }
    if (action.name == 'useOnDoors') {
      writeDialog("I try to use the " + object.description + " on the doors", "yellowText")
      var worked = this.currentRoom.tryKey(object)
      this.currentRoom.writeDoors()
      // if(!worked) {
      return
      // }
    }
    if (object != null) {
      writeDialog("I " + action.desc, "yellowText")
    }
    var txt = dialog.innerHTML
    var pos = txt.indexOf("<!--actions-->")
    if (pos > 0) {
      if (CLEAR_HISTORY) {
        txt = ''
      } else {
        txt = txt.substring(0, pos)
      }
      // writeDialog(txt+"<br>", "yellowText")
      txt += "<br><span class=\"yellowText\">" + action.desc + "</span><br><br>";
      dialog.innerHTML = txt;
    }
    this.handleResult(action.results)
  }

  handleResult(results) {

    if (results == null) {
      return
    }
    for (var i = 0; i < results.length; i++) {
      var parts = results[i].split("/")
      if (parts[0] == "character") {
        var char = game.getCharacter(parts[1])
        if(char != null) {
          writeDialog(char.getScriptText(parts[2]))
        }
      }
      if (parts[0] == "room") {
        this.enterRoom(parts[1])
      }
      if (parts[0] == "text") {
        writeDialog(parts[1])
      }
    }
  }

  exit() {
    clearOutput();
    writeR("OK, bye bye. Have a nice life.");
  }

  addToPack(name) {
    if (this.backpack.indexOf(name) >= 0) {
      return;
    }
    var obj = this.getObject(name)
    writeDialog("I put the " + obj.description + " in my backpack", "yellowText")
    this.currentRoom.removeObject(name)
    this.backpack.push(name);
    this.showBackpack()
    this.currentRoom.writeObjects();
  }

  removeFromPack(name) {
    var ind = this.backpack.indexOf(name)
    if (ind < 0) {
      return;
    }
    var obj = this.getObject(name)
    writeDialog("I drop the " + obj.description + " on the floor", "yellowText")
    this.currentRoom.addObject(name)
    this.backpack.splice(ind, 1)
    this.showBackpack()
    this.currentRoom.writeObjects();
  }

  inPack(name) {
    return this.backpack.indexOf(name) >= 0;
  }

  enterRoom(roomName) {
    showDiv(dialog)
    showDiv(doorsDiv)

    this.currentRoom = this.getRoom(roomName);
    var playerX = this.currentRoom.centerX
    var playerY = this.currentRoom.centerY
    me.style.top = (playerY * BLOCK_SIZE + (BLOCK_SIZE - PLAYER_SIZE) / 2) + "px"
    me.style.left = (playerX * BLOCK_SIZE + (BLOCK_SIZE - PLAYER_SIZE) / 2) + "px"
    this.currentRoom.describe();
  }

  getCharacter(name) {
    for (var i = 0; i < this.characters.length; i++) {
      if (this.characters[i].name === name) {
        return this.characters[i];
      }
    }
  }

  getRoom(roomName) {
    for (var i = 0; i < this.rooms.length; i++) {
      if (this.rooms[i].name === roomName) {
        return this.rooms[i];
      }
    }
  }

  getObject(objectName) {
    for (var i = 0; i < this.objects.length; i++) {
      if (this.objects[i].name === objectName) {
        return this.objects[i];
      }
    }
  }

  enterPressed(input) {
    clearOutput();
    var txt = input.value.toLowerCase().replace("  ", " ")
    input.value = ""

    if (this.handledByDoor(txt)) {
      return;
    }
    // this.enterRoom(this.currentRoom.name)
  }

  tryToEnterRoom(name) {
    var room = game.getRoom(name)
    var door = this.currentRoom.doorTo(room)
    if (!door.isOpen) {
      if (door.opensWithText()) {
        if (popup.style.visibility != "visible") {
          showPopup(true)
        } else {
          hidePopup();
        }
        popupMessage.innerHTML = "What should I say?"
        return;
      } else {
        // clearOutput();
        writeDialog("The door to " + room.name + " is locked!", "redText")
        return
      }
    } else {
      // clearOutput();
      this.enterRoom(room.name)
      return
    }
    // this.enterRoom(this.currentRoom.name)
    return;
  }

  openDoor(door) {
    door.isOpen = true
    var index = 0;
    if (door.roomNames[0] == this.currentRoom.name) {
      index = 1;
    }
    var roomName = door.roomNames[index]
    writeDialog("Creeeeeeakkkk.... the door to the " + roomName + " opens...")
    this.currentRoom.writeDoors()
    // this.enterRoom(roomName)
  }

  handledByDoor(txt) {
    var tokens = txt.split(" ");
    var doors = this.currentRoom.doors
    for (var i = 0; i < doors.length; i++) {
      if (doors[i].opensWithTokens(tokens)) {
        var desc = doors[i].getDescriptionForStory(this.currentRoom.name)[0]
        if (doors[i].comment != null) {
          desc += ". " + doors[i].comment
        }
        writeDialog("I see a " + desc, "redText")
        writeDialog("I say the words \"" + txt + "\" to it and...", "redText")
        this.openDoor(doors[i])
        return true
      }
    }
    writeDialog("I say the words \"" + txt + "\"... but nothing happens :-( ", "redText")
    return false
  }

}

loadExternal = function () {
  alert(JSON.stringify(event.target.json));
}

var game = new Game(output, map);
game.init();
