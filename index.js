var createFilter = require('rollup-pluginutils').createFilter,
    sourcemaps   = require('gulp-sourcemaps'),
    PassThrough  = require('readable-stream').PassThrough,
    File         = require('vinyl');

module.exports = function(stream, options) {
  if(!stream) {
    throw new Error("rollup-plugin-gulp must be passed a stream!");
  }
  
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
  
  var outputs = {};
  var ended = false, error;
  
  function end(err) {
    if(!ended) {
      ended = true;
      error = err || new Error("Stream ended prematurely!");
      for(var key in outputs) {
        var output = outputs[key];
        if(typeof output === 'object') {
          output.reject(error);
        }
      }
    }
  }
  outStream.on('error', end);
  outStream.on('end', end);
  
  outStream.on('data', function(file) {
    if(!ended) {
      var output = outputs[file.path];
      outputs[file.path] = false;
      if(output) {
        if(file.isBuffer()) {
          output.resolve({
            code: file.contents.toString(),
            map:  file.sourceMap
          });
        } else {
          output.reject(new Error(file.path + " has non-buffered contents!"));
        }
      } else if(output === false) {
        end(new Error(file.path + " was output twice!"));
      } else if(!options.ignoreErroneousPaths) {
        end(new Error("Erroneous path \"" + file.path + "\"!"));
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
            if(outputs[file.path] === false) {
              end(new Error(file.path + " was input after being output!"));
              reject(error);
            } else if(outputs[file.path] !== undefined) {
              end(new Error(file.path + " was input twice!"));
              reject(error);
            } else {
              outputs[file.path] = {
                resolve: resolve,
                reject:  reject
              };
              inStream.write(file);
            }
          }
        });
      }
    }
  };
}
