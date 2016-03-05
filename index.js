var createFilter = require('rollup-pluginutils').createFilter,
    sourcemaps   = require('gulp-sourcemaps'),
    PassThrough  = require('readable-stream').PassThrough,
    File         = require('vinyl');

module.exports = function(stream, options) {
  options = options || {};
  var filter = createFilter(options.include, options.exclude);
  
  var inStream = stream, outStream = stream;
  if(typeof stream === 'function') {
    inStream = new PassThrough({objectMode: true});
    outStream = stream(inStream);
  }
  
  if(options.sourceMap || options.sourceMap === undefined) {
    var innerStream = inStream;
    inStream = sourcemaps.init();
    inStream.pipe(innerStream);
  }
  
  var outputs = [];
  var ended = false, error;
  
  function end(err) {
    if(!ended) {
      ended = true;
      error = err || new Error("Stream ended prematurely!");
      var output;
      while(output = outputs.pop()) {
        output.reject(error);
      }
    }
  }
  outStream.on('error', end);
  outStream.on('end', end);
  
  outStream.on('data', function(file) {
    if(!ended) {
      var output = outputs.pop();
      if(output.path === file.path) {
        if(file.isBuffer()) {
          output.resolve({
            code: file.contents.toString(),
            map:  file.sourceMap
          });
        } else {
          end(new Error(file.path + " has non-buffered contents!"));
        }
      } else {
        end(new Error("Output path " + file.path + " does not match input path " + output.path + "!"));
      }
    }
  });
  
  return {
    transform: function(code, path) {
      if(filter(path)) {
        return new Promise(function(resolve, reject) {
          if(ended) {
            reject(error);
          } else {
            var file = new File({path: path, contents: new Buffer(code)});
            outputs.unshift({
              resolve: resolve,
              reject:  reject,
              path:    file.path
            });
            inStream.write(file);
          }
        });
      }
    }
  };
}
