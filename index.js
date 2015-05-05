var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var jinxLoader = require('jinx-loader');

var warp = function(pre,content,suf,separator){
	return [pre,content,suf || pre].join((separator ? separator : ','));
}

var warpModule = function(content){
	return warp('function(module, exports, __jinx_require__) {',content,'}','\n');
}


var escapeRegExp = function(str) { // credits CoolAJ86
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

var replaceModules = function(str,modules){
	for(var i in modules){
		str = str.replace(getCard(escapeRegExp(modules[i])),'__jinx_require__('+(1+modules.indexOf(modules[i]))+')');
	}
	return str;
}

var getCard = function(mid){
	return new RegExp('require\\s*\\(\\s*\'['+mid+']+\'\\s*\\)|require\\s*\\(\\s*"['+mid+']+"\\s*\\)','g')
}

var getFileName = function($){
	return path.basename($,path.extname($));
}

module.exports = function(jinxFile){
	if(Buffer.isBuffer(jinxFile) || jinxFile.contents){
		var fileContent = String((!jinxFile.contents ? jinxFile : jinxFile.contents));
	}

	var fileName = getFileName(jinxFile.path);
	var i;

	var asHeader = _.template(String(fs.readFileSync(path.resolve(__dirname,'template/_asHeader.js'))))({fileName:fileName});

	var modules = [];

	modules = _.compact(modules.concat(fileContent.match(getCard('a-zA-Z_\\-\\.\\/'))));

	for(i in modules){
		modules[i] = modules[i].match(/['"][a-zA-Z_\-\.\/]+['"]/g)[0];
		modules[i] = modules[i].substr(1,modules[i].length-2);
	}
	modules = _.uniq(modules);

	fileContent = replaceModules(fileContent,modules);


	var compilerHeader = String(fs.readFileSync(path.resolve(__dirname,'template/_compilerHeader.js')));
	var modulesFiles = jinxLoader(modules,'./').jinx;
	var modulesContents = [];

	for(i in modulesFiles) modulesContents[i] = warpModule(fs.readFileSync(modulesFiles[i]));

	modulesContents.unshift(warpModule(fileContent));

	return [asHeader,compilerHeader,'(['+modulesContents.join(',\n')+']);','}}}'].join('\n');
}
