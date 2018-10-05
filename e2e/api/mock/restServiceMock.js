var express = require('express');
var multer = require('multer');
var Q = require('q');
var portfinder = require('portfinder');

//Constructor
function RestServiceMock() {
  this.upload = multer({});
  this.app = express();
  this.imagesMap = {};
  this.config = {
    isServiceAvailable: true
  };

  var that = this;

  var response = 1;
  this.app.get('/user/', function(req, res) {
    response++;
    res.send({result: response});
  });

  var timeout = 5000;
  this.app.get('/userTimeout/', function(req, res) {
    setTimeout(function(){
      res.send({result: timeout});
      timeout -= 2000;
      }, timeout);
  });

  this.app.get('/users/', function(req, res) {
    var response = [{user1: 'testUser1'},{user2: 'testUser2'}];
    if(req.query && req.query.user && (req.query.user == 'user1')) {
      response = [{user1: 'testUser1'}];
    }

    res.send(response);
  });

  this.app.get('/notFound/', function(req, res) {
    res.status(404).send('Not Found');
  });

  this.app.post('/users/', function(req, res) {
    res.set('Content-Type', 'text/plain');
    res.send('done');
  });

  this.app.delete('/users/:user', function(req, res) {
    res.send({deleted: req.param('user')});
  });
}

RestServiceMock.prototype.start = function() {
  var that = this;
  return Q.Promise(function (resolveFn, rejectFn) {
    portfinder.getPort(function (err, port) {
      if (err) {
        rejectFn(err);
      } else {
        that.app.listen(port, function (error) {
          if (error) {
            rejectFn(error);
          } else {
            console.log('Server started');
            resolveFn(port);
          }
        });
      }
    });
  });
};

module.exports = function(){
  return new RestServiceMock();
};
