
class Object {

  constructor(def) {
    this.name = def["name"];
    this.description = def["description"];
    this.weight = def["weight"];
    this.location = def["location"];
    this.actions = def["actions"];
    this.when = def["when"];
    this.propertyListener = def["propertyListener"];

    var props = def["properties"];
    this.properties = []
    this.properties.visible = true
    if (props != null) {
      for (var i = 0; i < props.length; i++) {
        this.properties[props[i].name] = convertBoolean(props[i].value)
      }
    }
    game.getRoom(this.location).objects.push(this.name)
    game.addPropertyListener(this)
  }

  handleTokens(tokens) {
    if (tokens.indexOf(this.activateWith)) {
      this.active = true;
      return true;
    }
    if (tokens.indexOf(this.visibleWith)) {
      if (game.backpack.indexOf(this.visibleWith)) {
        this.visible = true;
        return true;
      }
    }
  }

  propertyChanged(objName, propName, value) {
    if (this.propertyListener == null) {
      return
    }
    var wasVisible = this.properties.visible
    var code = this.propertyListener
    if (code.startsWith("code/")) {
      code = "code/var isProp = function(obj, prop) { return obj =='" + objName 
      + "' && prop =='" + propName + "'; }; " +
        "var value=" + value + "; " + code.substring(5)
    }
    game.evaluate.call(this, code)
    var nowVisible = this.properties.visible
    if (!wasVisible && nowVisible) {
      writeDialog("A " + this.description + " is now visible", "redText")
    }
  }

  isVisible() {
    return this.properties.visible == null || this.properties.visible;
  }

  handleAction(actionName) {
    for (var i = 0; i < this.actions.length; i++) {
      var ac = this.actions[i];
      if (ac.name == actionName) {
        game.handleAction(ac, this)
        if (ac["property"] != null) {
          var prop = ac["property"].split("/")
          var val = convertBoolean(prop[1])
          this.properties[prop[0]] = val
          game.propertyChanged(this.name, prop[0], val)
        }
        return
      }
    }
  }

  getLink() {
    return "o <a href=\"\" class=\"advLink\" onclick=\"return objectClicked('" + this.name + "')\" >" + this.description + "</a>"
  }

  getPopupText() {
    try {
      var txt = "";
      if (this.weight > 0) {
        if (!game.inPack(this.name)) {
          txt = " o <a class='advLink' href='' onclick='return doActionOn(\"" + this.name + "\",\"pack\")'>put it in backpack</a><br>"
        } else {
          txt = " o <a class='advLink' href='' onclick='return doActionOn(\"" + this.name + "\",\"drop\")'>drop it</a><br>"
        }
      }
      if (this.actions == null) {
        return txt;
      }
      for (var i = 0; i < this.actions.length; i++) {
        var ac = this.actions[i];
        if (ac.when != null) {
          if (!game.evaluate.call(this, ac.when)) {
            continue;
          }
        }
        txt += "<br> o <a class='advLink' href='' onclick='return doActionOn(\"" + this.name + "\",\"" + ac.name + "\")'>" + ac.desc + "</a><br>"
      }
      return txt;
    } catch (e) {
      alert(e.stack)
    }
  }
}