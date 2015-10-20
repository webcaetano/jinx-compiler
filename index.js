var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var jinxLoader = require('jinx-loader');
var modules = require('./modules.js');
var includes = require('./includes.js');

var getFileName = function($){
  return path.basename($,path.extname($));
}

module.exports = function(jinxFile,dest){
  if(Buffer.isBuffer(jinxFile) || jinxFile.contents){
    var fileContent = String((!jinxFile.contents ? jinxFile : jinxFile.contents));
  }

  var fileName = getFileName(jinxFile.path);

  var asHeader = _.template(String(fs.readFileSync(path.resolve(__dirname,'template/_asHeader.js'))))({fileName:fileName})

  var fileContent = includes(fileContent,jinxFile,dest);

  var loadModules = modules(fileContent,jinxFile);
  var fileContent = loadModules.content;

  return {
    contents:new Buffer([asHeader,fileContent,'}}}'].join('\n')),
    swc:jinxLoader.swc(loadModules.modules)
  }
}
