var fs = require('fs');
var Q = require('q');
var os = require('os');
Q.longStackSupport = true;

var storageMock = require('./remoteStorageProvider/remoteStorageMock')();

describe("RemoteStorageProvider", function () {
  var RemoteStorageProvider = require('../src/image/remoteStorageProvider');

  var logger = require('../src/logger')(3);
  var runtime = {
    platformName: 'platform',
    platformResolution: 'resolution',
    browserName: 'browser',
    ui5: {
      theme: 'theme',
      direction: 'direction',
      mode: 'mode'
    }
  };
  var spec = {
    fullName: 'sap.testSpec',
    name: 'testSpec',
    testPath: __dirname + '/remoteStorageProvider/testSpec.spec.js',
    branch: 'master',
    lib: 'sap.m'
  };

  var refImageRoot = __dirname + '/../target';
  var imageBuffer = new Buffer(fs.readFileSync(__dirname + '/remoteStorageProvider/arrow_left.png'));
  var imageStorageMockUrl = 'http://localhost';
  var initialImgName = 'initial';
  var lnkPath = __dirname + '/../target/images/testSpec/platform/resolution/browser/theme/direction/mode/' +
    initialImgName;

  beforeAll(function(done) {
    process.env.NO_PROXY = process.env.NO_PROXY ? '' : 'localhost';
    storageMock.start().then(function(port) {
      imageStorageMockUrl += ':' + port;
      done();
    });
  });

  it("Should store new ref image", function(done) {
    var storageProvider = new RemoteStorageProvider({},
      {refImagesRoot: refImageRoot, imageStorageUrl: imageStorageMockUrl},logger,runtime);
    storageProvider.onBeforeEachSpec(spec);

    storageProvider.storeRefImage(initialImgName, imageBuffer)
      .then(function(result) {
        expect(result.refImageUrl).toMatch('.*/images/*');
        expect(fs.statSync(lnkPath + '.ref.lnk').isFile()).toBe(true);
        done();
      }).catch(function(error){
      fail(error);
      done()
    });
  });

  it("Should store new ref,act and diff images", function(done) {
    var storageProvider = new RemoteStorageProvider({},
      {refImagesRoot: refImageRoot, imageStorageUrl: imageStorageMockUrl},logger,runtime);
    storageProvider.onBeforeEachSpec(spec);

    storageProvider.storeRefActDiffImage(initialImgName, imageBuffer, imageBuffer, true)
      .then(function(result) {
        expect(result.refImageUrl).toMatch('.*/images/*');
        expect(result.actImageUrl).toMatch('.*/images/*');
        expect(result.diffImageUrl).toMatch('.*/images/*');
        expect(fs.statSync(lnkPath + '.ref.lnk').isFile()).toBe(true);
        done();
      }).catch(function(error){
        fail(error);
        done()
      });
  });

  it("Should read ref image", function(done) {
    var storageProvider = new RemoteStorageProvider({},
      {refImagesRoot: refImageRoot, imageStorageUrl: imageStorageMockUrl},logger,runtime);
    storageProvider.onBeforeEachSpec(spec);

    storageProvider.readRefImage(initialImgName)
      .then(function(result) {
        expect(result.refImageBuffer.length).toBe(1239);
        expect(result.refImageUrl).toMatch(
          '.*/images/*');
        fs.unlink(lnkPath + '.ref.lnk',function(error){
          if (error){
            fail(error);
          }
          done();
        });
      }).catch(function(error){
        fail(error);
        done()
      });
  });

  it("Should correctly return if ref image lnk does not exist", function(done) {
    var storageProvider = new RemoteStorageProvider({},
      {refImagesRoot: refImageRoot, imageStorageUrl: imageStorageMockUrl},logger,runtime);
    storageProvider.onBeforeEachSpec(spec);

    storageProvider.readRefImage('not_existing_lnk')
      .then(function(result) {
        expect(result).toBeNull();
        done();
      }).catch(function(error){
        fail(error);
        done()
      });
  });

  it("Should correctly return if ref image uuid does not exist", function(done) {
    var storageProvider = new RemoteStorageProvider({},
      {refImagesRoot: __dirname + '/remoteStorageProvider' , imageStorageUrl: imageStorageMockUrl},logger,runtime);
    storageProvider.onBeforeEachSpec(spec);

    storageProvider.readRefImage('not_existing_uuid')
      .then(function(result) {
        expect(result).toBeNull();
        done();
      }).catch(function(error){
        fail(error);
        done()
      });
  });

  it("Should throw an error if test is running on windows and file path is too long", function(done) {
    var originalPlatform = os.platform;
    var spyPlatform = spyOn(os, "platform").and.returnValue('win32');

    var refImage = refImageRoot + "/path/with/more/than/250/symbolsssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss";
    var storageProvider = new RemoteStorageProvider({},
      {refImagesRoot: refImage, imageStorageUrl: imageStorageMockUrl}, logger, runtime);
    storageProvider.onBeforeEachSpec(spec);

    storageProvider.storeRefImage(initialImgName, imageBuffer)
      .then(function(result) {
        fail(result);
        done();
      }).catch(function(error){
        done();
      });
  });

  it("Should pass if test is running on linux and file path is too long", function(done) {
    var originalPlatform = os.platform;
    var spyPlatform = spyOn(os, "platform").and.returnValue('linux');

    var refImage = refImageRoot + "/path/with/more/than/250/symbolsssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss";
    var storageProvider = new RemoteStorageProvider({},
      {refImagesRoot: refImage, imageStorageUrl: imageStorageMockUrl}, logger, runtime);
    storageProvider.onBeforeEachSpec(spec);

    storageProvider.storeRefImage(initialImgName, imageBuffer)
      .then(function(result) {
        done();
      }).catch(function(error){
        fail(error);
        done();
    });
  });
});

