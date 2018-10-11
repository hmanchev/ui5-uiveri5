describe('api', function() {
  var restServiceMock = require('./mock/restServiceMock')();
  var restServiceMockUrl = 'http://localhost';

  beforeAll(function(done) {
    restServiceMock.start().then(function(port) {
      restServiceMockUrl += ':' + port;
      done();
    });
  });

  it('Should make api call and verify response', function() {
    var res = request.get(restServiceMockUrl +'/users');
    expect(res).toBeDefined();
  });

  it('Should Assert on error response code', function() {
    var res = request
      .get(restServiceMockUrl +'/notFound')
        .catch(function(response){
          expect(response.status).toBe(404);
          expect(response.message).toBe('Not Found');
        });
  });

  it('Should make api call and check response body', function() {
    var res = request.get(restServiceMockUrl +'/users');
    expect(res).toHaveHTTPBody([{user1: 'testUser1'},{user2: 'testUser2'}]);
  });

  it('Should make api call and check response header', function() {
    var res = request.get(restServiceMockUrl +'/users').query({ user: 'user1'});
    expect(res).toHaveHTTPHeader(['Content-Type', 'application/json']);
    expect(res).toHaveHTTPBody([{user1: 'testUser1'}]);
  });

  it('Should make post api call and check response', function() {
    var res = request.post(restServiceMockUrl +'/users')
      .send({"name": "morpheus", "job": "leader"})
      .set('accept', 'json');
    expect(res).toHaveHTTPHeader(['Content-Type', 'application/json']);
  });

  it('Should make delete api call and check response header', function() {
    var res = request.delete(restServiceMockUrl +'/users/user1');
    expect(res).toHaveHTTPBody({deleted: 'user1'});
  });

  it('should schedule requests in proper order', function() {
    var first = request.get(restServiceMockUrl +'/user');
    var second = request.get(restServiceMockUrl +'/user');

    expect(first).toHaveHTTPBody({result: 2});
    expect(second).toHaveHTTPBody({result: 3});
  });

  it('should schedule requests in proper order with timeouts', function() {
    var first = request.get(restServiceMockUrl +'/users').query({delay: 5000});
    var second = request.get(restServiceMockUrl +'/users').query({delay: 3000});

    expect(first).toHaveHTTPBody({result: '5000'});
    expect(second).toHaveHTTPBody({result: '3000'});
  });
});
