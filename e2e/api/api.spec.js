describe('api', function() {
  it('Should make api call and verify method', function() {
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
});
