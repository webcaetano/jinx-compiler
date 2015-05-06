var fs = require('fs');
var _ = require('lodash');
var path = require('path');

var getCard = function(mid){
	return new RegExp('#{0,1}include\\s+\'[a-zA-Z_\\-\\.\\/]+\'\\s*|#{0,1}include\\s+\"[a-zA-Z_\\-\\.\\/]+\"\\s*','g');
}

var escapeRegExp = function(str) { // credits CoolAJ86
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

module.exports = function(content,jinxFile,dest){
	var includes = [];

	includes = _.compact(includes.concat(content.match(getCard('a-zA-Z_\\-\\.\\/'))));

	for(i in includes){
		includes[i] = includes[i].match(/['"][a-zA-Z_\-\.\/]+['"]/g)[0];
		includes[i] = includes[i].substr(1,includes[i].length-2);
	}
	includes = _.uniq(includes);

	for(var i in includes){
		content = content.replace(
			getCard(escapeRegExp(includes[i])),
			'include "'+path.join(
				path.relative(path.dirname(dest),'./'),
				path.relative('./',path.dirname(jinxFile.path)),
				includes[i]
			).replace(/\\/g,"/")+'"'
		);
	}

	return content;
}
