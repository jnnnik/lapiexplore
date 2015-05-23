var apiNodes = {};  
function getApiNode(path) {
  if(!apiNodes[path]) {
    apiNodes[path] = new ApiNode(path);
  }
  return apiNodes[path];
}

function us2cc(string) {
  var parts = string.split('_');
  for(var i=1,j=parts.length;i<j;i++) {
    var first = parts[i].charAt(0).toUpperCase();
    parts[i] = first + parts[i].substr(1);
  }
  return parts.join('');
}

function ApiNode(_path) {
  var self = this;
  if(!_path) _path = 'live_set';
  var _api = new LiveAPI(_path);
  this.getPath = function() {
    return _api.unquotedpath;
  }
  this.getInfo = function() {
    return _api.info;
  }
  var _addProperty = function(prop) {
    self[us2cc('get_'+prop)] = (function(p){
      return function(){
        return _api.get(p);
      };
    })(prop);
    self[us2cc('set_'+prop)] = (function(p){
      return function(arg){
        return _api.set(p,arg);
      };
    })(prop);
  }
  var _addFunction = function(func) {
    self[us2cc(func)] = (function(f){
      return function(arg){
        return _api.call(f,arg);
      };
    })(func);
  }
  var _addChildProperty = function(name, isCollection) {
    
    self[us2cc('get_'+name)] = (function(n){
      return function(){
        return getApiNode(self.getPath() + ' ' + name);
      };
    })(name);
    if(isCollection) {
      self[us2cc('get_'+name.substr(0,name.length-1)+'_by_name')] = (function(n) {
        return function(searchName) {
          var collection = self[us2cc('get_'+n)]().get();
          for(var i=0, j=collection.length;i<j; i++) {
            var node = collection[i];
            if(node.getName && node.getName() == searchName) {
              return node;
            }
          }
          return false;
        };
      })(name)
    }
  }
  var infoLines = this.getInfo().split("\n");

  if(infoLines[1] == 'type Vector') {
    var _childCount = _api.children[0];
    var _children = [];
    for(var i=0;i<_childCount;i++) {
      _children[i] = getApiNode(_path + ' ' + i);
    }
    this.get = function(offset) {
      if(offset === undefined) {
        return _children;
      }
      return _children[offset];
    }
    this.getFirst = function() {
      return _children[0];
    }
    this.getLast = function() {
      return _children[_childCount -1];
    }
    this.getCount = function() {
      return _childCount;
    }
  } else {
    this.getParent = function() {
      var parentPath = self.getPath() + ' canonical_parent';
      var check = new LiveAPI(parentPath);
      if(check.info === '"No object"') {
        return false;
      }
      return getApiNode(parentPath);
    }
    for(var i=0,j=infoLines.length;i<j;i++) {
      var line = infoLines[i];
      var splitLine = line.split(' ');
      if(splitLine.length != 3) continue;
      var name = splitLine[1];
      if(line.indexOf('property') === 0 && splitLine[2].indexOf('Device') === -1) {
        _addProperty(name);
      } else if(line.indexOf('function') === 0) {
        _addFunction(name);
      } else if(line.indexOf('child') === 0 || splitLine[2].indexOf('Device') === 0) {
        _addChildProperty(name, (line.indexOf('children') === 0));
      }
    }
  }
}