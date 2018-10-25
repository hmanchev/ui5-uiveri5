# UIVeri5 usage basics
As it is based on Protractor v.2.5.0, UIVeri5 takes advantage of Protractor's Jasmine integration and control flow. You can read more about it [here](https://github.com/angular/protractor/blob/master/docs/control-flow.md)

##  WebDriver Element, promises and control flow

### Promises are resolved automatically
```javascript
// works but is too complicated
someElement.count().then(function (count) {
    expect(count).toBeGreaterThan(0);
  }
);

// better
expect(someElement.count()).toBeGreaterThan(0);
```

### Implicit synchronization
UIVeri5 can synchronize with UI5 automatically. This means that it will check for unfinished asynchronous work performed by the application before every action and expectation (essentially before every element location). This stabilizes test execution as the test waits for the application to become responsive before continuing with the next step.

### Locators - id vs css vs jq
You can use every locator already available in Protractor as well as the custom UIVeri5 locators: `jq` and `control`. More about locators can be found in [locators.md](locators.md).

### executeScript

## Debugging

### Node v7.7.0 and later
Node legacy debugger is deprecated. Node Inspector and DevTools are recommended instead.
To enable debugging, start visualtest with `debug` option (or its alias `inspect`): `visualtest --debug`. To stop on a certain line, add `debugger` to your test:
```javascript
myElement.getText().then(text => {
  debugger;
  expect(text).toEqual("myText");
});
```

### Older Node releases
Use legacy debugger and set breakpoints with `browser.pause()` and `browser.debugger()`
```javascript
myElement.getText().then(function (text) {
  browser.debugger();
  expect(text).toEqual("myText");
});
```

For details see:
* https://github.com/angular/protractor/blob/master/docs/debugging.md
* https://github.com/angular/protractor/issues/4307
* https://nodejs.org/en/docs/guides/debugging-getting-started/
