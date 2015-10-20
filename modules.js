var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var crypto = require('crypto');
var jinxLoader = require('jinx-loader');

var self = {};

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
	modules = _.omit(modules,'main');
	for(var i in modules){
		str = str.replace(getCard(escapeRegExp(modules[i].name)),'__jinx_require__('+(modules[i].id)+')');
	}
	return str;
}

var md5 = function(str){
	if(!str) return '';
	var toMD5 = crypto.createHash("md5");
	return toMD5.update(str).digest("hex");
}

var getCard = function(mid){
	return new RegExp('require\\s*\\(\\s*\'['+mid+']+\'\\s*\\)|require\\s*\\(\\s*"['+mid+']+"\\s*\\)','g')
}

var listedModulesInFile  = function(content){
	if(!content) return;
	return content.match(getCard('a-zA-Z_\\-\\.\\/'));
}

var getModulesFromFile = function(content,jinxFile,modules){
	var modulesNames = [];
	var i;
	var filePath = jinxFile.path ? jinxFile.path : jinxFile;

	modulesNames = _.uniq(modulesNames.concat(listedModulesInFile(content)));

	for(i in modulesNames){
		modulesNames[i] = modulesNames[i].match(/['"][a-zA-Z_\-\.\/]+['"]/g)[0];
		modulesNames[i] = modulesNames[i].substr(1,modulesNames[i].length-2);
	}

	var modulesFiles = jinxLoader.main(modulesNames,filePath);
	var modulesContents = [];
	var selfModules = {};

	if(!modules) modules = {};

	for(i in modulesFiles) {
		var tmpContent = warpModule(fs.readFileSync(modulesFiles[i]));
		if(!modules[md5(tmpContent)]) {
			selfModules[md5(tmpContent)] = modules[md5(tmpContent)] = {
				content:tmpContent,
				file:modulesFiles[i],
				name:modulesNames[i],
				id:self.ids++
			}
			modulesContents[i] = tmpContent;
		}
	}

	if(!modules['main']) {
		modules['main'] = {
			content:warpModule(content),
			file:filePath,
			name:'__main__',
			id:0,
		}
	}

	if(modules[md5(content)]) return;

	for(i in selfModules){
		if(!selfModules[i] || selfModules[i].name=='__main__') continue;
		var m = _.uniq(listedModulesInFile(selfModules[i].content));
		if(m && m.length) {
			getModulesFromFile(selfModules[i].content,selfModules[i].file,modules);
		}
	}

	return modules;
}

module.exports = function(content,jinxFile){
	self = {
		ids:1
	};
	var modulesHeader = String(fs.readFileSync(path.resolve(__dirname,'template/_compilerHeader.js')));
	var modules = getModulesFromFile(content,jinxFile);
	var modulesContents = [];
	var modulesNames = [];

	_.each(_.omit(modules,'main'),function(module){
		modulesContents.push(module.content);
		modulesNames.push(module.name);
	})

	modulesContents.unshift(modules.main.content);

	_.each(modulesContents,function(content,k){
		modulesContents[k] = replaceModules(content,modules)
	});

	return {
		content:[modulesHeader,'(['+modulesContents.join(',\n')+']);'].join('\n'),
		modules:modulesNames
	}
}
