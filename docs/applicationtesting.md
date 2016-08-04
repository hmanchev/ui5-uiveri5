
# Application testing

## Test organization

### Test Data
Extract all test content constants in a single test data object.

### Page Objects (PO)
Frequently there is advantage in gathering selectors in a semantical objects that describe the structure of the
page to be tested. This approach have many benefits, like simplifying the understanding of the test, simplifying
potential modifications. Object literal notation in JavaScript gives allowys simple and expressive syntax for PO
declaration and usage.

Declare POs:
```javascript
var shell = {
  header: {
    userName: element(by.css('.sapUshellShell .sapUShellShellHeader .sapUShellShellHeadUsrItmName'));
  },
  tiles: {
    trackPurchaseOrder:
      element.all(by.css('.sapUshellShell .sapUshellTile .sapUshellTileInner')).get(0)
  }
};
```
Use PO:
```javascript
it('should load the Start Screen', function () {
  expect(browser.getTitle()).toBe('Home');
  expect(shell.header.userName.getText()).toBe('BLACKM');

  // click on the "Track Purchase Order" tile
  shell.tiles.trackPurchaseOrder.click();
});
```

#### POs in common file
If several test scripts interact with a single page, it would be nice to extract the POs to separate files.
They could be referenced from every test script that needs them. Test scripts are effectively
[node modules](https://nodejs.org/api/modules.html) and could use arbitrary [nodejs](https://nodejs.org/en/about/)
functinality.

Declare PO:
```javascript
// pages/shell.view.js:
module.exports = {
  header: {
    userName: element(by.css('.sapUshellShell .sapUShellShellHeader .sapUShellShellHeadUsrItmName'));
  },
  tiles: {
    trackPurchaseOrder:
      element.all(by.css('.sapUshellShell .sapUshellTile .sapUshellTileInner')).get(0)
  }
}
```
Import PO in test script:
```javascript
// purchaseOrder.spec.js
var shellView = require('./pages/shell.view');

describe('Fiori_MM', function () {
  it('should load the Start Screen', function () {
    expect(browser.getTitle()).toBe('Home');
    expect(shellView.header.userName.getText()).toBe('BLACKM');

    // click on the "Track Purchase Order" tile
    shellView.tiles.trackPurchaseOrder.click();
  });
});
```

## Selectors
Use manually assigned IDs and prefer id selectors in such apps
Prefer hierarchical class selectors. Try to compose them the way you would explain to a human where to click.

### Avoid ID selectors ( using generated IDs )
Selection a DOM element by ID is the simplest and widely used approach in classical web site testing.
The classical web page is composed manually and so the important elements are manually assigned nice
and meaningful IDs. So it is easy to identify those elements in automatic tests.
But in highly-dynamic JS frameworks like SAPUI5 the DOM is generated out of the views. The views could
also be generated from the content meta-information. Very often, IDs are not assigned by a developer during application
creation. In such cases, the ID ir generated in runtime from the control name and a suffix that is the sequential number
of this control in this app. The generated ID could also could contain prefix of the enclosing view, like "__xmlview1".
In this scheme, the leading "__" mean "internal and generated, not to be relied on"
There are several problems with using such generated IDs in application tests.
1. IDs are stable between application runs but are generated and will definitely change when the application is modified.
Even minor unrelated change like adding one more button in some common area like header could cause a change of
all IDs. This will require changes in all selectors used in all tests for this application.
2. IDs are execution-unique and are generated on the runtime. So repetitive ID's require repetitive navigation path
in the application. This makes it especially hard for a human to develop and support the test. It is also impossible to
execute only part of the whole scenario by using disabled or focused specs and suites.
3. There are cases when the generated IDs will be different depending on the environment the application is running.
4. Generated IDs are totally not self-documenting and this makes the test harder to understand and maintain.

### Avoid non-visible attributes
Think from the point of view of the users. Users do not see DOM nodes and their attributes but see rendered DOM.
So write selectors that include only "visible" attributes.
This also makes the test much self-documenting and simplifies maintenance.

### Minimize use of attribute selectors

### JQuery
SAPUI5 runtime include and heavily use jquery so we bridge the power of jquery to application tests.
All [jquery selectors](https://api.jquery.com/category/selectors/) are available,including the powerful pseudo-selectors.
Select an element by jquery expression:
```javascript
element(by.jq('<jguery expression>'));
```

#### Select and element that contain specific child
Sometimes it is useful to have a backward selectors e.g. select the parent of an element with specific properties.
This is easily achieved with jquery [:has()](https://api.jquery.com/has-selector/) pseudo-selector.
Select a tile from Fiori Launchpad:
```javascript
element(by.jq('.sapUshellTile:has(\'.sapMText:contains(\"Track Purchase Order\")\')'))
```

#### Select an element from list
Protractor ElementArrayFinder that is returned from element.all() has a .get(<index>) method that will return
an element by its index. But chaining several levels of .get() could slowdown the test execution as every
interaction requires a browser roundtrip. Additionally whole expression becomes cumbersome and hard to read.
Much simpler is to use the jquery [:eq()](https://api.jquery.com/eq-selector/) pseudo-selector.
```javascript
element(by.jq('.sapMList > ul > li:eq(1)')),
```

## Test code

###  WebDriver Element, promises and control flow

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

### Comparing a value before and after action
Sometimes you need to compare a value after an action with the same value before the action.
One way to achieve this is to resolve the value before and store it a local var.
Then execute the action and then resolve the same value again and compare the new value in the promise resolved
handler directly.
You could not compare the two values directly in an expectation outside the resolved handled as the
comparison will be executed immediately, where as the values will be resolved later.
You could also not compare a value and the element promise because the expectation comparison function will
'catch' the initial value of the primitive type var. So the comparison will happen in the correct time but
with outdated value.

```javascript
if('compare two values',function(){
  var valueBefore;
  element(by.css('input')).getText().then(function(value){
    valueBefore = value;
  });

  element(by.css('button').click();

  element(by.css('input')).getText().then(function(valueAfter){
    expect(valueBefore).toBe(valueAfter);
  });
});
```

## Debugging

### use browser.pause()



# Advanced Ideas

## Component selectors (__not available yet__).
In the application testing approach we use hierarchical class selectors composed of UI5 component main
(marker) class names. This hierarchical composition is important to guarantee the stability of selectors,
check [here](docs/applicationtesting.md) for further details. But the usage of component classes is somehow
problematic as DOM is not UI5 API and DOM could change between UI5 minor releases. Only UI5 JS API is guaranteed
to be backward-compatible so an approach to mitigate this issue is to use component selectors.
Component selector is a css-like selector that works on the UI5 component tree and not on the DOM tree.
This selector is handled by ToolsAPI inside recent UI5 versions (>1.34) and integrates nicely with
(UI5 Inspector)[https://chrome.google.com/webstore/detail/ui5-inspector/bebecogbafbighhaildooiibipcnbngo]
````
masterSection = {
  filterIcon: element(by.comp('sap.m.PageFooter sap.m.Button[label="filter"]')
}
masterSection.filterIcon.click();
````
