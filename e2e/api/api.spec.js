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
    expect(res).toHaveHttpBody({"data":{"id":2,"first_name":"Janet","last_name":"Weaver","avatar":"https://s3.amazonaws.com/uifaces/faces/twitter/josephstein/128.jpg"}});
  });

});
