# API testing
Setting up a test system or providing a consistent data set for a UI test is a challange. One good pactice is to have a self-contained UI tests that prepare the test content thmeselves, interact with the UI and then assert changes in the system state. Or cleanup the test content so the system is left in a known state.
To do so, the test need a way to call REST endpoints. Our api testing is insipired by the [SuperTest](https://github.com/visionmedia/supertest) but is adapted to the uiveri5 experience. The request object is a pure [SuperAgent](https://github.com/visionmedia/superagent) request object, adapted with execution flow. No additional methods are provided.

## Synchronization
Rest calls are fully synchronized in the execution flow of the UI interactions. No need to chain the promises or work with callbacks.

## Execute a rest call
```javascript
request('myapi.dev.hana.ondemand.com')
    .get('/contacts/1');
```

## Assert a result of the call
```javascript
let res = request('myapi.dev.hana.ondemand.com')
    .get('/contacts/1');

// modeled accordin SuperTest API but 'jasminized' to fix overal uiveri experiance
expect(res).toHaveHTTPCode(200);
expect(res).toHaveHTTPBody({name: 'something'}); // TODO json assertion lib ?
expect(res).toHaveHTTPHeader('Content-Type', 'application/json');
```

## Save result from call and use it in another call
```javascript
let contacts;
request('myapi.dev.hana.ondemand.com')
    .get('/contacts')
    .then((res) => {
        contacts = res.body;
    });

// the arrow function is necesary to postpone the URL building till the actual execution time
request('myapi.dev.hana.ondemand.com')
    .delete((contacts) => `/contacts/{contacts[0].id}`);
```
