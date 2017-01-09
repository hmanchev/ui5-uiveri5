'use strict';

var argv = require('yargs').
    usage('Usage: visualtest [options] [confFile]\n' +
          'confFile defaults to conf.js if presented in current working directory.').
    string('libFilter').
    describe('libFilter', 'Comma separated list of lib suites to execute, defaults to all').
    string('specFilter').
    describe('specFilter', 'Comma separated list of specs to execute, defaults to all').
    string('baseUrl').
    describe('baseUrl', 'Base url to execute the spec against, defaults to http://localhost:8080').
    string('seleniumAddress').
    describe('seleniumAddress','Address of remote selenium server, if missing will start local webdriver').
    string('seleniumHost').
    describe('seleniumHost','Override the hostname to connect to local webdriver or selenium jar').
    string('seleniumPort').
    describe('seleniumPort','Override the default port used by the local webdriver or selenium jar').
    boolean('useSeleniumJar').default('useSeleniumJar',undefined).
    describe('useSeleniumJar','Use selenium jar to start local webdrivers, default to true').
    string('seleniumAddressProxy').
    describe('seleniumAddressProxy','Use this proxy for the WD connection to remote selenium server').
    string('browsers').
    describe('browsers', 'Comma separated list of browsers to execute tests, defaults to chrome').
    describe('params', 'Param object to be passed to the tests').
    describe('timeouts', 'Timeouts').
    string('config').
    describe('config', 'JSON formatted config object to override config file options').
    string('confKey').
    describe('confKey', 'Config key, accepts extended dot notation').
    count('verbose').
    alias('v', 'verbose').
    describe('verbose', 'Print debug logs').
    string('specs').
    describe('specs', 'Specs to execute, blob pattern used by localSpecResolver only').
    //string('take').
    boolean('take').default('take',undefined).
    //alias('t','take').
    describe('take', 'Take screenshots, default: true').
    //string('compare').
    boolean('compare').default('compare',undefined).
    //alias('c','compare').
    describe('compare', 'Compare actual to reference screenshots, default: true').
    //string('update').
    boolean('update').default('update',undefined).
    //alias('u','update').
    describe('update', 'Update reference screenshots with actual screenshots if differ, default false').
    strict().
    argv;
    //TODO profile argument
    //TODO params

var cliParser = require('./cliParser')();
var config = cliParser.parse(argv);

// run the visualtest
require('./visualtest').run(config);
