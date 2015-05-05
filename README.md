# [![Imgur](http://i.imgur.com/FHjshUv.png)](https://github.com/webcaetano/jinx)

This is an nodejs module for compile .jinx into .as (actionscript3)  

### Usage
```javascript
var jinxCompiler = require('jinx-compiler');

var jinxFile = 'test/app/flash/init.jinx';
var compiled = jinxCompiler(fs.readFileSync(jinxFile)); // return an actionscript
```

---------------------------------

The MIT [License](https://raw.githubusercontent.com/webcaetano/jinx-compiler/master/LICENSE.md)
