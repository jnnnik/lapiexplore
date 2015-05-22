var apiNodes = {};
  
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
    self._initParent();
    return self.parent;
  }
  this._initParent = function() {
    if(self.parent !== null) return;
    var splitPath = self.path.split(' ');
    if(splitPath.length === 1) {
      throw new Error('Can\'t getParent() of root node');
    }
    splitPath.pop();
    self.parent = getApiNode(splitPath.join(' '));
    self._initChildren();
  }
  this.getChildren = function() {
    self._initChildren();
    return self.children;
  }
  this._initChildren = function() {
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
  this._addProperty = function(prop) {
    this[us2cc('get_'+prop)] = (function(p){
      return function(){
        return self.api.get(p);
      };
    })(prop);
  }
  this._addFunction = function(func) {
    this[us2cc(func)] = (function(f){
      return function(arg){
        return self.api.call(f,arg);
      };
    })(func);
  }
  
  var infoLines = this.getInfo().split("\n");
  for(var i=0,j=infoLines.length;i<j;i++) {
    var line = infoLines[i];
    var name = line.split(' ')[1];
    if(line.indexOf('property') === 0) {
      this._addProperty(name);
    } else if(line.indexOf('function') === 0) {
      this._addFunction(name);
    }
  }
}

var n = new getApiNode('live_set');
