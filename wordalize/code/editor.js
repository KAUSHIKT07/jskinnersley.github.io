var editorDiv = document.getElementById("editor")
var editorPanel = document.getElementById("editorPanel")
var editorPanelContent = document.getElementById("editorPanelContent")

var component_width = 140
var component_height = 20

pxToInt = function (px) {
  return 1 * (px.replace("px", ""))
}

hideEdPanel = function () {
  editorPanel.style.visibility = "hidden"
  ed.popElement()
  if (ed.getCurrentElement() != null) {
    ed.getCurrentElement().showEditPanel()
  }
}

saveEdPanel = function () {
  ed.save()
  hideEdPanel()
}

deleteEdObject = function () {
  ed.deleteCurrent()
  hideEdPanel()
}

ifNull = function (val, defVal) {
  return val ? val : defVal
}

setEditorValue = function (prop, val) {
  try {
    document.getElementById(prop + "Editor").setValue(val)
  } catch (e) {
    alert(e.stack)
  }
}

getSingular = function (node) {
  var sing = node
  if (node.endsWith("ies")) {
    sing = sing.substring(0, sing.length - 3) + "y"
  } else if (node.endsWith("s")) {
    sing = sing.substring(0, sing.length - 1)
  }
  return sing
}
getPlural = function (node) {
  var plu = node
  if (plu.endsWith("y")) {
    plu = plu.substring(0, plu.length - 1) + "ies"
  } else if (!plu.endsWith("s")) {
    plu += "s"
  }
  return plu
}

addToJson = function (type) {
  try {
    var json = ed.json
    if (ed.getCurrentElement() != null) {
      json = ed.getCurrentElement().json
    }
    type = getPlural(type)
    if (json[type] == null) {
      json[type] = []
    }
    json[type].push({})
    if (ed.getCurrentElement() != null) {
      ed.getCurrentElement().showEditPanel()
    } else {
      ed.edit(ed.json)
    }
  } catch (e) {
    alert(e.stack)
  }
}

loadSpecFile = function () {
  var file = event.target.files[0];
  var reader = new FileReader();
  reader.readAsText(file, 'UTF-8');
  reader.onload = readerEvent => {
    var content = readerEvent.target.result;
    var pos = content.indexOf("{")
    content = content.substring(pos)
    var gameJson = JSON.parse(content)
    ed.edit(gameJson)
  }
}

testSpec = function () {
  gameJson = ed.json;
  game.init();
}

var textFile = null

makeJsonFile = function () {
  // var data = new Blob([JSON.stringify(ed.json)], {type: 'text/plain'});
  var data = new Blob(["var gameJson = " + JSON.stringify(ed.json, null, 4)], { type: 'application/javascript' });
  // If we are replacing a previously generated file we need to
  // manually revoke the object URL to avoid memory leaks.
  if (textFile !== null) {
    window.URL.revokeObjectURL(textFile);
  }
  textFile = window.URL.createObjectURL(data);
  // returns a URL you can use as a href
  return textFile;
};

class OptionSet {
  constructor() {
    this.options = []
    this.isLiteral = false
  }

  add(opt) {
    if (this.isLiteral && opt.endsWith("\'")) {
      opt = opt.substring(0, opt.length - 1)
    }
    this.options.push(opt)
  }

  isLiteralOption(i) {
    if (i >= 0 && i < this.options.length) {
      return this.options[i].isLiteral
    }
  }

  getOption(i, div) {
    var opt = this.options[i]
    if (opt instanceof OptionSet) {
      return opt.getOptionArray(i, div)
    }
    return opt
  }

  getOptionArray(i, div) {
    if (this.options.length == 1) { //ie, this is the name of an array
      var arrayName = this.options[0]
      var array = ed.json[arrayName]
      if (array != null) {
        return array
      }
      if (i > 0 && i - 1 < div.parent.dds.length) {
        var prevCO = div.parent.dds[i - 1].currentObject
        if (prevCO != null && prevCO[arrayName] != null) {
          return prevCO[arrayName]
        }
      }
    }
    return this.options
  }

  display() {
    var txt = "["
    for (var i = 0; i < this.options.length; i++) {
      var opt = this.options[i]
      if (opt instanceof OptionSet) {
        txt += opt.display()
      } else {
        txt += opt + ","
      }
    }
    return txt + "]"
  }

  parse(def) {
    var optSet = null
    var opt = ''
    for (var i = 0; i < def.length; i++) {
      var ch = def[i]
      if (ch == '[') {
        optSet = new OptionSet()
        this.options.push(optSet)
        i += optSet.parse(def.substring(i + 1)) + 1
      } else if (ch == ']') {
        this.add(opt)
        return i
      } else if (ch == '/') {
      } else if (ch == '|') {
        this.add(opt)
        opt = ''
      } else if (ch == '\'' || ch == '\"') {
        if (opt == '') {
          this.isLiteral = true
        } else {
          opt += ch
        }
      } else {
        opt += ch
      }
    }
  }
}

class NewButton {
  constructor(editorDiv, json, type, left, top) {
    this.type = type
    var div = document.createElement("div");
    div.classList.add("edApp")
    div.style.padding = "4px"
    div.style.height = "15px"
    div.style.top = top + "px"
    div.style.left = left + "px"
    div.style["text-align"] = "right"
    div.classList.add("newButton")
    editorDiv.appendChild(div)
    div.innerHTML = '<a class="edLink" href="" onclick="addToJson(\'' + type + '\'); return false;">Add ' + type + '</a>'
  }
}

class EditElement {

  constructor(type, json, parentElement, index) {
    this.type = type
    this.json = json
    this.parentElement = parentElement
    this.index = index
  }

  createEditorDiv(parent, prop, label) {
    var div = document.createElement("div");
    this.divs.push(div)
    div.prop = prop
    div.classList.add("edApp")
    div.style.padding = "3px"
    div.style.align = "top"
    parent.appendChild(div)
    div.innerHTML = label + ':<br>'
    div.getValue = function () {
      return document.getElementById(prop + 'Editor').value
    }
    return div;
  }

  createEditPanel(spec) {
    if (spec.trim) {
      this.createPanelFromDef(editorPanelContent, spec, "INLINE_PROP")
    } else {
      for (var prop in spec) {
        var def = spec[prop]
        this.createPanelFromDef(editorPanelContent, def, prop)
      }
    }
  }

  createPanelFromDef(parent, def, prop) {
    var displayProp = prop;
    if (def == 'STRING') {
      this.createInputDiv(parent, prop, displayProp)
    } else if (def == 'INT') {
      this.createInputDiv(parent, prop, displayProp)
    } else if (def == 'TEXT') {
      this.createTextDiv(parent, prop, displayProp)
    } else if (def == 'BOOLEAN') {
      this.createChoiceDiv(parent, prop, displayProp, ["true", "false"])
    } else if (def == 'FUNCTION') {
      var op = new OptionSet();
      op.parse("['function'|'code']/[functions|TEXT]")
      this.createChoiceDiv(parent, prop, displayProp, op)
    } else if (def.indexOf('[') == 0) {
      var op = new OptionSet()
      op.parse(def)
      this.createChoiceDiv(parent, prop, displayProp, op)
    } else if (def instanceof Array) {
      ed.createEditGroup(parent, this, prop, this.json, 10, 0, 50, true)
    }
  }

  getLabel() {
    if (this.type == "game") {
      return "GAME"
    }
    var label = this.json.name
    if (this.type == "door") {
      var doorType = this.json.type ? this.json.type : "door"
      var roomNames = this.json.between.split("/");
      label = doorType + ": " + roomNames[0] + "/" + roomNames[1]
    }
    if(label == null) {
      label = this.json
    }
    if (label.length > 20) {
      label = label.substring(0, 20) + ".."
    }
    return label
  }

  createInputDiv(parent, prop, label) {
    var div = this.createEditorDiv(parent, prop, label)
    div.innerHTML += this.getHtmlForTextArea(prop, this.json[prop], 1, 60)
    //    div.innerHTML += this.getHtmlForInput(prop, this.json[prop])
  }

  createTextDiv(parent, prop, label) {
    var div = this.createEditorDiv(parent, prop, label)
    div.innerHTML += this.getHtmlForTextArea(prop, this.json[prop], 5, 60)
  }

  getHtmlForInput(prop, val) {
    return '<input class="edApp edInputField" id=\'' + prop + 'Editor\' value=\'' + ifNull(val, "") + '\'>'
  }

  getHtmlForTextArea(prop, val, rows, cols) {
    return '<textarea class="edApp edTextArea" id=\'' + prop + 'Editor\' rows="' + rows + '" cols="' + cols + '">' + ifNull(val, "") + '</textarea>'
  }

  turnIntoArray(def) {
    var array = null;
    if (def instanceof Array) {
      array = def
    } else if (ed.json[def] != null) {
      array = ed.json[def]
    } else {
      array = def.split('|')
    }
    return array
  }

  getChoices(ddindex, div) {
    if (div.parent.initialVals.length < ddindex) {
      return
    }
    if (div.parent.choices instanceof OptionSet) {
      var nextOptions = div.parent.choices;
      if (nextOptions instanceof OptionSet) {
        nextOptions = nextOptions.getOption(ddindex, div)
      }
      var isLiteral = ddindex > 0 && div.parent.choices.isLiteralOption(0)
      if (nextOptions != null) {
        if (isLiteral) {
          var index2 = div.parent.dds[0].currentObject
          if (index2 != null) {
            var options2 = nextOptions[index2]
            if (options2 == 'null') {
              return
            }
            var json = ed.json
            if (ddindex > 0) {
              var co = div.parent.dds[ddindex - 1].currentObject
              if (co != null && co[options2] != null) {
                json = co
              }
            }
            var options = json[options2]
            if (options != null) {
              return options
            }
            if (options2 instanceof OptionSet) {
              return options2.options
            }
            return [options2]
          }
        } else {
          return nextOptions
        }
      }
    } else {
      if (ddindex == 0)
        return div.parent.choices
    }
  }

  setupDropdown(div, label) {
    var ddindex = div.ddindex
    var initVal = ''
    if (div.parent.initialVals.length > ddindex) {
      initVal = div.parent.initialVals[ddindex]
    }

    var options = this.getChoices(ddindex, div)
    div.currentObject = getArrayElement(options, initVal)
    if (options.length == 1) {
      if (options[0] == 'STRING') {
        div.innerHTML += this.getHtmlForTextArea(div.prop + "TXT", initVal, 1, 60)
        div.style.display = "block"
        //        div.innerHTML += this.getHtmlForInput(div.prop, initVal)
        return
      }
      if (options[0] == 'TEXT') {
        div.innerHTML += this.getHtmlForTextArea(div.prop + "TXT", initVal, 5, 60)
        div.style.display = "block"
        return
      }
    }

    if (initVal == null || initVal == '') {
      initVal = 'Choose...'
    }

    var html = '<div class="dropdown"><button id="' + div.prop + 'EditorButton" class="edButton dropbtn">' + initVal + '</button> <div class="dropdown-content">'
    var labels = []

    for (var i = 0; i < options.length; i++) {
      var val = options[i]
      val = val.name != null ? val.name : val;
      if (val.trim != null) { //check this is a String
        val = val.trim().replace(/'/g, "")
        labels[i] = val
        html += '<a class="edLink" href="" onclick=\'setEditorValue("' + div.prop + '", "' + val + '"); return false;\'>' + val + '</a>'
      }
    }
    div.labels = labels
    html += "</div></div>"
    div.innerHTML = html
    var nextOptions = this.getChoices(ddindex + 1, div)
    if (nextOptions != null) {
      this.createDropdown(div.parent, null)
    }
  }

  createDropdown(parent, label) {
    var div = document.createElement("div");
    div.classList.add("dropdown-group")
    div.style.position = "relative"

    parent.appendChild(div)
    var ddindex = parent.dds.length
    parent.dds.push(div)

    div.parent = parent
    div.prop = parent.prop + "_" + ddindex + "_"
    div.id = div.prop + "Editor"
    div.ddindex = ddindex
    this.setupDropdown(div, label)

    div.setValue = function (val) {
      try {

        for (var i = div.parent.dds.length - 1; i > div.ddindex; i--) {
          div.parent.removeChild(div.parent.dds[i])
        }
        truncateArray(parent.dds, div.ddindex + 1)
        truncateArray(parent.initialVals, div.ddindex + 1)
        parent.initialVals[div.ddindex] = val

        parent.edElem.setupDropdown(div, label)
      } catch (e) {
        alert(e.stack)
      }
      div.val = val
    }

    return div
  }

  createChoiceDiv(container, prop, label, choices) {
    var parent = this.createEditorDiv(container, prop, label)
    parent.id = prop + "Editor"
    parent.edElem = this

    var initialVal = null;
    if (prop == "INLINE_PROP") {
      if(this.json.trim == null) {
        this.json = "";
      }
      initialVal = this.json
    } else {
      initialVal = this.json[prop]
    }
    parent.val = initialVal
    parent.initialVals = initialVal != null ? initialVal.split("/") : []
    parent.choices = choices
    parent.dds = []
    this.createDropdown(parent, label)

    parent.getValue = function () {
      var val = ''
      for (var i = 0; i < parent.dds.length; i++) {
        var dd = parent.dds[i]
        var ival = document.getElementById(dd.prop + 'EditorButton')
        if (ival != null) {
          ival = ival.innerHTML
          if (ival == 'Choose...') {
            ival = ''
          }
        } else {
          ival = document.getElementById(dd.prop + 'TXTEditor')
          if (ival != null) {
            ival = ival.value
          }
        }
        val += ival + '/'
      }
      val = val.substring(0, val.length - 1)
      return val
    }
    return parent
  }

  delete() {
    var plu = getPlural(this.type)
    var pjson = this.parentElement.json
    var ind = pjson[plu].indexOf(this.json)
    pjson[plu].splice(ind, 1)
    ed.edit(gameJson)
  }

  save() {
    for (var i = 0; i < this.divs.length; i++) {
      var val = this.divs[i].getValue()
      var prop = this.divs[i].prop
      if(prop == 'INLINE_PROP') {
        var pjson = this.parentElement.json[getPlural(this.type)]
        pjson[this.index] = val;
      } else {
        this.json[prop] = val
      }
      // alert("SET "+prop+" WAS "+this.json[prop]+" TO "+val);
    }
    this.div.innerHTML = this.getLabel()
  }

  showEditPanel() {
    var frac = 50
    editorPanel.style.visibility = "visible"
    editorPanelContent.innerHTML = ''
    this.divs = []

    var currentElement = ed.getCurrentElement()
    var spec = specEditDef
    if (currentElement != null) {
      spec = currentElement.specDef
    }
    var plural = getPlural(this.type)
    var def = spec[this.type]
    if (def == null) {
      def = spec[plural]
      if (def != null) {
        def = def[0]
      }
    }
    if (def == null && currentElement != null) {
      def = currentElement.specDef
    }
    this.specDef = def
    this.createEditPanel(def);

  }

  makeDblClickable() {
    this.div.addEventListener('mousedown', function (event) {
      event.preventDefault();
    }, true)
    var self = this
    this.div.addEventListener('dblclick', function (event) {
      event.stopPropagation();
      self.showEditPanel()
      ed.pushElement(self);
    }, true)
  }

  makeDraggable(div) {
    div.addEventListener('mousedown', () => {
      div.downPos = [event.pageX, event.pageY]
      div.startPos = [pxToInt(div.style.left), pxToInt(div.style.top)]
      div.style["z-index"] = 1000
    })

    div.addEventListener('mouseup', () => {
      div.downPos = null
      div.style["z-index"] = 1
    })

    div.addEventListener('mousemove', () => {
      if (div.downPos != null) {
        var dx = div.startPos[0] + event.pageX - div.downPos[0]
        var dy = div.startPos[1] + event.pageY - div.downPos[1]
        div.style.left = dx + "px"
        div.style.top = dy + "px"
      }
    })
  }

  makeComponent(parent, x, y) {
    var div = document.createElement("div");
    this.div = div;
    this.x = x;
    this.y = y;
    div.style.width = component_width + "px"
    div.style.height = component_height + "px"
    parent.appendChild(div)
    div.classList.add("edComponent")
    div.classList.add("edApp")
    div.innerHTML = this.getLabel()
    this.makeDblClickable()
    // this.makeDraggable(div)
    return div
  }

}

class Editor {
  constructor() {
    this.currentElements = []
  }

  pushElement(elem) {
    this.currentElements.push(elem)
  }

  popElement() {
    this.currentElements.splice(this.currentElements.length - 1, 1)
  }

  getCurrentElement() {
    if (this.currentElements.length == 0) {
      return
    }
    return this.currentElements[this.currentElements.length - 1]
  }

  save() {
    this.getCurrentElement().save()
    this.setTitle()
    document.getElementById("saveSpec").href = makeJsonFile()
  }

  deleteCurrent() {
    this.getCurrentElement().delete()
    document.getElementById("saveSpec").href = makeJsonFile()
  }

  //Makes a group of components, like "characters" or "actions" (inside an "object")
  createEditGroup(parent, parentElement, node, json, x, y, height, inPanel) {
    var div = document.createElement("div");
    if (inPanel) {
      div.classList.add("edGroupInPanel")
    } else {
      div.classList.add("edGroup")
    }
    parent.appendChild(div)
    div.style.left = x + "px"
    var sing = getSingular(node)
    var newObject = new NewButton(div, json, sing, x, y)
    if (json[node] != null) {
      for (var i = 0; i < json[node].length; i++) {
        var edit = new EditElement(sing, json[node][i], parentElement, i)
        edit.makeComponent(div, x, (y + height) + (i * height))
      }
    }
  }

  setTitle() {
    document.getElementById("edTitle").innerHTML = "Editor for \"" + this.json.game.title + "\""
  }

  edit(json) {
    
    this.json = json
    this.setTitle();

    var singleGroup = document.getElementById("editorSingleGroups")
    var multiGroup = document.getElementById("editorMultiGroups")
    singleGroup.innerHTML = ''
    multiGroup.innerHTML = ''
    var x = 10
    var y = 10
    var numNonArrays = 0
    var numArrays = 0
    for (var node in specEditDef) {
      var def = specEditDef[node];
      var isArray = def instanceof Array
      if (!isArray) {
        var edit = new EditElement(node, json[node], this, 0)
        edit.makeComponent(singleGroup, 10 + (numNonArrays * (component_width + 20)), 10)
        numNonArrays++;
      } else {
        var x = 10 + (numArrays * (component_width + 20))
        var y = 70
        this.createEditGroup(multiGroup, this, node, json, x, y, 50)
        numArrays++;
      }
    }

    editorDiv.addEventListener('mousedown', function (event) {
      hideEdPanel()
      event.preventDefault();
    }, true)

    document.getElementById("saveSpec").download = "spec.js"
  }

}

var ed = new Editor();
ed.edit(gameJson)


// var op = new OptionSet()
// op.parse("['test'|'some']/[one|two|[three|four]]")
// op.parse("[characters]/[scripts]")
// alert(op.display())
