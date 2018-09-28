describe('api', function() {
  it('Should make api call and verify response', function() {
    var res = request.get('https://sapui5.hana.ondemand.com/sdk/resources/sap/ui/documentation/sdk/images/logo_sap.png');
    expect(res).toBeDefined();
  });

  it('Should Assert on error response code', function() {
    var res = request
      .get('https://sapui5.hana.ondemand.com/sdk/resources/sap/ui/documentation/sdk/images/not_found.png')
        .catch(function(response){
          expect(response.status).toBe(404);
          expect(response.message).toBe('Not Found');
        });
  });

  it('Should make api call and check response body', function() {
    var res = request.get('https://reqres.in/api/users/2');
    expect(res).toHaveHTTPBody({"data":{"id":2,"first_name":"Janet","last_name":"Weaver","avatar":"https://s3.amazonaws.com/uifaces/faces/twitter/josephstein/128.jpg"}});
  });

  it('Should make api call and check response header', function() {
    var res = request.get('https://reqres.in/api/users/2').query({ action: 'edit', city: 'London' });
    expect(res).toHaveHTTPHeader(['Content-Type', 'application/json']);
  });

  it('Should make post api call and check response', function() {
    var res = request.post('https://reqres.in/api/users1')
      .send({"name": "morpheus", "job": "leader"})
      .set('accept', 'json');
    expect(res).toHaveHTTPHeader(['Content-Type', 'application/json']);
  });

  it('Should make api call and check response header', function() {
    var res = request.delete('https://reqres.in/api/users/2');
    expect(res).toHaveHTTPBody({});
  });
});
