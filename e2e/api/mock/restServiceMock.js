var express = require('express');
var Q = require('q');
var portfinder = require('portfinder');

//Constructor
function RestServiceMock() {
  this.app = express();

  var response = 1;
  this.app.get('/user/', function(req, res) {
    response++;
    res.send({result: response});
  });

  this.app.get('/users/', function(req, res) {
    var response = [{user1: 'testUser1'},{user2: 'testUser2'}];
    res.set('Content-Type', 'application/json');
    if(req.query) {
      if(req.query.user && (req.query.user == 'user1')) {
        response = [{user1: 'testUser1'}];

        res.send(response);
      } else if(req.query.delay) {
        var delay = req.query.delay;

        setTimeout(function() {
          res.send({result: delay});
        }, delay)
      } else {
        res.send(response);
      }
    }
  });

  this.app.get('/notFound/', function(req, res) {
    res.status(404).send('Not Found');
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
