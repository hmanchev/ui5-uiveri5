var _ = require('lodash');

var DEFAULT_CONF = '../conf/default.conf.js';

function ConfigParser(logger) {
  this.logger = logger;
  this.config = {};
}

ConfigParser.prototype.mergeConfigs = function (config) {
  this.config = config;

  // load config file
  this._mergeConfig(this.config.conf || DEFAULT_CONF, 'default');

  // resolve profile
  if (this.config.profile) {
    this._mergeConfig('../conf/' + this.config.profile + '.profile.conf.js', 'profile config');
  }

  // apply common profile
  this._mergeConfig('../conf/profile.conf.js', 'common profile');

  // return new fully merged config
  return this.config;
};

ConfigParser.prototype._mergeConfig = function (configFile, type) {
  this.logger.debug('Loading ' + type + ' config from: ' + configFile);
  var config = require(configFile).config;
  this.config = _mergeWithArrays(config, this.config);
};

function _mergeWithArrays(object, src) {
  return _.mergeWith(object, src, function (objectValue, sourceValue) {
    // return undefined to use _.merge default strategy
    if (_.isArray(objectValue) && sourceValue) {
      return _(objectValue).concat(sourceValue).uniqWith(_.isEqual).value();
    }
  });
};

module.exports = function(logger){
  return new ConfigParser(logger);
};
