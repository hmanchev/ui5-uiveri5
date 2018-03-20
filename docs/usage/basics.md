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
You can use every locator already available in Protractor as well as the custom UIVeri5 locators: `jq` and `control`. More about locators can be found in [locators.md](docs/usage/locators.md).

### executeScript

## Debugging

### use browser.pause()
