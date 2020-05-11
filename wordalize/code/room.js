
class Room {

  constructor(def) {
    this.name = def["name"];
    this.description = def["description"];
    this.comment = def["comment"];
    this.coords = def["coords"]
    if (this.coords != null) {
      this.coords = this.coords.split(":");
    }
    this.objects = []
    this.doors = []
    this.color = def["color"];
    this.minX = 10000;
    this.minY = 10000;
    this.maxX = 0;
    this.maxY = 0;
    this.centerX = 0;
    this.centerY = 0;
  }

  doorTo(room) {
    for (var i = 0; i < this.doors.length; i++) {
      if (this.doors[i].roomNames.indexOf(room.name) >= 0)
        return this.doors[i]
    }
  }

  tryKey(object) {
    var worked = false
    for (var i = 0; i < this.doors.length; i++) {
      if (this.doors[i].opensWith == object.name) {
        game.openDoor(this.doors[i])
        worked = true
      }
    }
    if (!worked) {
      writeDialog("Nope, no luck on the doors")
    }
    return worked
  }

  makeDiv(x, y, id, name, color, map) {
    var div = document.createElement("div" + id);
    div.className = "mapElement"
    div.style.width = BLOCK_SIZE + "px";
    div.style.height = BLOCK_SIZE + "px";
    div.style.background = color;
    div.innerHTML = name;
    if (name != "") {
      div.style["z-index"] = 50; //make sure name block appears over surrounding blocks
    }
    div.style.left = (x * BLOCK_SIZE) + "px"
    div.style.top = (y * BLOCK_SIZE) + "px"
    map.appendChild(div);
  }

  describe() {
    writeDialog("I find myself in " + this.description, "yellowText")
    if (this.comment != null) {
      writeDialog(this.comment)
    }

    this.writeObjects()
    this.writeDoors()
  }

  addObject(objectName) {
    game.getObject(objectName).location = this.name
    this.objects.push(objectName)
  }

  removeObject(objectName) {
    game.getObject(objectName).location = "backpack"
    var ind = this.objects.indexOf(objectName)
    this.objects.splice(ind, 1)
  }

  writeObjects() {
    output.innerHTML = ''
    if (this.objects.length > 0) {
      // writeW("Around me I can see...")
      for (var i = 0; i < this.objects.length; i++) {
        var obj = game.getObject(this.objects[i])
        if (obj.isVisible() && !game.inPack(this.objects[i])) {
          writeW(obj.getLink())
        }
      }
    }
  }

  writeDoors() {
    doorsDiv.innerHTML = ''
    // writeDoorsDiv("I see...")
    for (var i = 0; i < this.doors.length; i++) {
      writeDoorsDiv(this.doors[i].getDescription(this))
    }
  }

  draw(map) {
    this.blocks = [];
    if (this.coords == null) {
      return
    }
    for (var i = 0; i < this.coords.length; i++) {
      var coord = this.coords[i];
      if (coord.indexOf("-") > 0) {
        var corners = coord.split("-");
        var xy1 = corners[0].split(",");
        var xy2 = corners[1].split(",");
        var midx = Math.round((xy1[0] * 1 + xy2[0] * 1) / 2);
        var midy = Math.round((xy1[1] * 1 + xy2[1] * 1) / 2);
        for (var x = xy1[0]; x <= xy2[0]; x++) {
          for (var y = xy1[1]; y <= xy2[1]; y++) {
            this.minX = Math.min(this.minX, x)
            this.minY = Math.min(this.minY, y)
            this.maxX = Math.max(this.maxX, x)
            this.maxY = Math.max(this.maxY, y)
            var dname = "";
            if (x == midx && y == midy) {
              dname = this.name;
            }
            var div = this.makeDiv(x, y, this.name, dname, this.color, map)
            this.blocks.push(div);
          }
        }
        if (i == 0) {
          this.centerX = (this.minX + this.maxX) / 2
          this.centerY = (this.minY + this.maxY) / 2
        }
      } else {
        var xy = coord.split(",");
        var div = this.makeDiv(xy[0], xy[1], this.name, this.name, this.color, map)
        this.minX = xy[0]
        this.minY = xy[1]
        this.maxX = xy[0]
        this.maxY = xy[1]
        this.blocks.push(div);
      }
    }
  }
}
