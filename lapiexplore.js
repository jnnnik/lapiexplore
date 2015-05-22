var apiNodes = {};
var OFFSET_DEVICES = 2;
  
function getApiNode(path) {
  if(!apiNodes[path]) {
    apiNodes[path] = new ApiNode(path);
  }
  return apiNodes[path];
}

function isInt(number) {
  return !isNaN(parseInt(number)) && isFinite(number);
}

function us2cc(string) {
  var parts = string.split('_');
  for(var i=1,j=parts.length;i<j;i++) {
    var first = parts[i].charAt(0).toUpperCase();
    parts[i] = first + parts[i].substr(1);
  }
  return parts.join('');
}

function ApiNode(path) {
  var self = this;
  if(!path) path = 'live_set';
  this.path = path;
  this.api = new LiveAPI(path);
  this.parent = null;
  this.children = null;
  this.getInfo = function() {
    return self.api.info;
  }
  this.getParent = function() {
    _initParent();
    return self.parent;
  }
  var _initParent = function() {
    if(self.parent !== null) return;
    var splitPath = self.path.split(' ');
    if(splitPath.length === 1) {
      throw new Error('Can\'t getParent() of root node');
    }
    splitPath.pop();
    self.parent = getApiNode(splitPath.join(' '));
  }
  this.getChildren = function() {
    _initChildren();
    return self.children;
  }
  var _initChildren = function() {
    if(self.children !== null) return;
    self.children = [];
    var apiChildren = self.api.children;
    if(!isInt(apiChildren[0])) {
      for(var key in apiChildren) {
        self.children[self.children.length] =
          getApiNode(self.path + ' ' + apiChildren[key]);
      }
    } else {
      for(var i=0; i<apiChildren[0]; i++) {
        self.children[i] =
          getApiNode(self.path + ' ' + i);
      }
    }
  }
  var _addProperty = function(prop) {
    self[us2cc('get_'+prop)] = (function(p){
      return function(){
        return self.api.get(p);
      };
    })(prop);
    self[us2cc('set_'+prop)] = (function(p){
      return function(arg){
        return self.api.set(p,arg);
      };
    })(prop);
  }
  var _addFunction = function(func) {
    self[us2cc(func)] = (function(f){
      return function(arg){
        return self.api.call(f,arg);
      };
    })(func);
  }
  this.getChildByName = function(name) {
    var children = this.getChildren();
    for(var i=0,j=children.length;i<j;i++) {
      if(children[i].getName && children[i].getName() == name) {
        return children[i];
      }
    }
  }
  var infoLines = this.getInfo().split("\n");
  for(var i=0,j=infoLines.length;i<j;i++) {
    var line = infoLines[i];
    var name = line.split(' ')[1];
    if(line.indexOf('property') === 0) {
      _addProperty(name);
    } else if(line.indexOf('function') === 0) {
      _addFunction(name);
    }
  }
}

var n = getApiNode('live_set');
n.setTempo(120);