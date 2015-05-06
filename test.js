'use strict';
var jinxCompiler = require('./');
var expect = require('chai').expect;
var fs = require('fs');

describe('jinx-compiler', function() {

	var mainFile = 'test/app/flash/init.jinx';
	it('should compile .jinx into .as and modules', function(done) {
		var compiled = jinxCompiler(fs.readFileSync(mainFile));
		var contents = String(compiled.contents);
		
		expect(contents).to.contain('__jinx_require__(1)');
		expect(contents).to.not.contain('require (	"jinx-mempanel" )');
		done();
	});
});
