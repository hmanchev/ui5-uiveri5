
var path = require('path');
var fs = require('fs');

var Q = require('q');
var request = require('request');
var _ = require('lodash');
var mkdirp = require('mkdirp');

var DEFAULT_IMAGE_STORAGE_URI = 'images';

var DEFAULT_REF_LNK_EXT = '.ref.lnk';
var DEFAULT_IMAGE_EXT = '.png';
var DEFAULT_FILE_PATH_LENGTH = 250;

/**
 * @typedef RemoteStorageProviderConfig
 * @type {Object}
 * @extends {Config}
 */

/**
 * @typedef RemoteStorageProviderInstanceConfig
 * @type {Object}
 * @property {string} refImagesRoot - reference images root, defaults to spec.testBasePath
 * @property {string} imageStorageUrl - image store url
 * @property {string} username - username for authentication in image storage application
 * @property {string} password - password for the username
 */

/**
 * Stores and loads images from local git structure
 * @constructor
 * @implements {StorageProvider}
 * @param {RemoteStorageProviderConfig}
 * @param {RemoteStorageProviderInstanceConfig}
 * @param {Logger} logger
 * @param {Runtime} runtime
 */
function RemoteStorageProvider(config,instanceConfig,logger,runtime) {
  //this.config = config;
  //this.instanceConfig = instanceConfig;
  this.logger = logger;
  this.runtime = runtime;

  this.refImagesRoot = instanceConfig.refImagesRoot;
  this.imageStorageUrl = instanceConfig.imageStorageUrl +
    '/' + (instanceConfig.imageStorageUri || DEFAULT_IMAGE_STORAGE_URI);

  this.auth = instanceConfig.username ?
    {user: instanceConfig.username, pass: instanceConfig.password} : undefined;
  this.currentSpecName = null;
  this.currentSpecTestBasePath = null;
}

/**
 * Read ref image
 * @param {string} imageName - reference image name
 * @return {q.promise<{refImageBuffer:Buffer,refImageUrl:string},{Error}>} - promise that resolves with data and image url,
 *  return null of image is not found
 */
RemoteStorageProvider.prototype.readRefImage = function(imageName){
  var that = this;
  this.logger.debug('Reading reference image: ' + imageName);

  return Q.Promise(function(resolveFn,rejectFn) {
    var refImagePath = that._getLnkFilePath(DEFAULT_REF_LNK_EXT, imageName);
    fs.stat(refImagePath, function(err, stats) {
      if (err) {
        // no such file => return no ref image
        resolveFn(null);
      } else {
        fs.readFile(refImagePath, function(err, data) {
          if(err) {
            rejectFn(new Error('Error while reading: ' + refImagePath + ' ,details: '  + error));
          } else {
            var uuid = data.toString('utf8').match(/(uuid)+\W+(\S+)/)[2];
            var refImageUrl = that.imageStorageUrl + '/' + uuid;
            request({url: refImageUrl,encoding: 'binary'},
              function (error,response,body) {
                if(error) {
                  rejectFn(new Error('Error while GET to: ' + refImageUrl + ' ,details: '  + error));
                } else {
                  if(response.statusCode === 404) {
                    resolveFn(null);
                  } else {
                    response.setEncoding();
                    resolveFn({
                      refImageBuffer: new Buffer(body,'binary'),
                      refImageUrl: refImageUrl
                    });
                  }
                }
              }
            );
          }
        });
      }
    });
  });
};

/**
 * Store new ref image
 * @param {string} refImageName  - reference image name
 * @param {Buffer} refImageBuffer - reference image buffer
 * @return {q.promise<{refImageUrl},{Error}>} - promise that resolves with ref image url
 */
RemoteStorageProvider.prototype.storeRefImage = function(imageName,refImageBuffer){
  var that = this;
  this.logger.debug('Storing ref image: ' + imageName);

  var actUuid;
  return this._uploadImage(imageName,refImageBuffer).then(function(resp) {
    actUuid = resp.uuid;
    return that._storeLnkFile(DEFAULT_REF_LNK_EXT, imageName, actUuid);
  }).then(function(){
    // return result object
    return {
      refImageUrl: that.imageStorageUrl + '/' + actUuid
    }
  });
};

/**
 * Store new reference, actual and difference images
 * @param {string} imageName  - image name
 * @param {Buffer} actImageBuffer - actual image buffer, also stored as new reference image
 * @param {Buffer} diffImageBuffer - diff image buffer
 * @param {boolean} updateRefFlag - whether to update ref image
 * @return {q.promise<{refImageUrl,actImageUrl,diffImageUrl},{Error}>} - promise that resolves with images urls
 */
RemoteStorageProvider.prototype.storeRefActDiffImage = function(imageName,actImageBuffer,diffImageBuffer,updateRefFlag){
  var that = this;
  this.logger.debug('Storing ref,act and diff images for: ' + imageName);

  var actUuid;
  // start with storing the actImage buffer
  return this._uploadImage(imageName,actImageBuffer).then(function(resp) {
    actUuid = resp.uuid;
    // save ref lnk file
    if (updateRefFlag) {
      return that._storeLnkFile(DEFAULT_REF_LNK_EXT, imageName, actUuid);
    }
  }).then(function(){
    // store diff image
    return that._uploadImage(imageName,diffImageBuffer);
  }).then(function(resp){
    var diffUuid = resp.uuid;
    // return result object
    return {
      refImageUrl: that.imageStorageUrl + '/' + actUuid,
      actImageUrl: that.imageStorageUrl + '/' + actUuid,
      diffImageUrl: that.imageStorageUrl + '/' + diffUuid
    }
  });
};

RemoteStorageProvider.prototype._uploadImage = function(imageName,imageBuffer) {
  var that = this;

  var metaJson = JSON.stringify(this.meta);
  var formData = {
    "image": {
      value: imageBuffer,
      options: {
        filename: imageName + DEFAULT_IMAGE_EXT
      }
    },
    "json" : new Buffer(metaJson)
  };

  return Q.Promise(function(resolveFn,rejectFn) {
    request.post({url: that.imageStorageUrl, formData: formData,
        auth: that.auth},
      function (error, response, body) {
        if (error) {
          rejectFn(new Error('Error while POST to: ' + that.imageStorageUrl + ' ,details: '  + error));
        } else {
          var responseBody = '';
          try {
            responseBody = JSON.parse(body);
          } catch (error) {
            that.logger.trace('Response body: ' + body);
            rejectFn(new Error('Cannot parse response body due to: ' + error +
              ", response: " + JSON.stringify(response)));
          }

          if(response.statusCode === 201 || response.statusCode === 422) {
            resolveFn({uuid:responseBody.uuid});
          } else {
            rejectFn(new Error('Server responded with status code: ' + response.statusCode +
              ", response: " + JSON.stringify(response)));
          }
        }
      });
  });

};

RemoteStorageProvider.prototype._storeLnkFile = function(ext,imageName,uuid) {
  var that = this;
  var refFilePath = that._getLnkFilePath(ext,imageName);

  return Q.Promise(function(resolveFn,rejectFn) {
    if(refFilePath.length > DEFAULT_FILE_PATH_LENGTH) {
      rejectFn(new Error('Lnk file path: ' + refFilePath + ' is longer than: ' + DEFAULT_FILE_PATH_LENGTH + ' characters.'));
    } else {
      mkdirp(path.dirname(refFilePath), function (err) {
        if (err) {
          rejectFn(new Error('Error while creating path for lnk file: ' + refFilePath + ' ,details: ' + error));
        } else {
          fs.writeFile(refFilePath, 'uuid=' + uuid, function (error) {
            if (error) {
              rejectFn(new Error('Error while storing lnk file: ' + refFilePath + ' ,details: ' + error));
            } else {
              resolveFn();
            }
          });
        }
      })
    }
  });
};

RemoteStorageProvider.prototype._getLnkFilePath = function(ext, fileName) {
  var refImagePath = [
    this.refImagesRoot || this.currentSpecTestBasePath,
    'images',
    this._getRuntimePathSegment(),
    (fileName + ext)
  ].join('/');

  return path.resolve(refImagePath).replace(/\\/g,'/');
};

RemoteStorageProvider.prototype._getRuntimePathSegment = function(){
  return [
    this.currentSpecName,
    this.runtime.platformName,
    this.runtime.platformResolution,
    this.runtime.browserName,
    this.runtime.ui5.theme,
    this.runtime.ui5.direction,
    this.runtime.ui5.mode
  ].join('/');
};

/**
 * Hook, called before each spec
 * @param {Spec} spec - spec
 *
 * Used to store current spec
 */
RemoteStorageProvider.prototype.onBeforeEachSpec = function(spec){
  this.logger.debug('Init remoteStorageProvider with spec: ' + spec.fullName);

  this.currentSpecName = spec.name;
  this.currentSpecTestBasePath = spec.testPath.substring(0,spec.testPath.lastIndexOf('/'));

  this.meta = {
    _meta : {
      spec: {
        lib: spec.lib,
        name: spec.name,
        branch: spec.branch
      }
    }
  };

  this.meta._meta.runtime = _.clone(this.runtime, true);
};

module.exports = function(config,instanceConfig,logger,runtime){
  return new RemoteStorageProvider(config,instanceConfig,logger,runtime);
};
