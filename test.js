'use strict';
var jinxCompiler = require('./');
var expect = require('chai').expect;
var fs = require('fs');

describe('jinx-compiler', function() {

	var mainFile = 'test/app/flash/init.jinx';
	it('should compile .jinx into .as and modules', function(done) {
    var file = fs.readFileSync(mainFile);
    file.path = mainFile;
		var compiled = jinxCompiler(file);
		var contents = String(compiled.contents);
    // console.log(contents);

		expect(contents).to.contain('__jinx_require__(1)');
		expect(contents).to.not.contain('require (	"jinx-mempanel" )');
		done();
	});
});
