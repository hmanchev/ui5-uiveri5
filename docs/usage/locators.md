# Locators

## What to prefer
Always work on the highest level of abstraction that is possible in the specific case. 
* Prefer control selectors instead of DOM-level selecto. 
* Prefer ID selectors if you have manually assinged IDs. 
* Prefer hierarchical class selectors but avoid layout-specific classes and try to stick to semantical classes.

__Try to compose the selector as if you are explaining a manual tester where to click.__

## What to avoid

### Avoid ID selectors using generated IDs
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
2. This is even more probable with metadata-driven UIs like Fiori Elements. The firori elements template could change with a UI5 minor version upgrade and could introduce  new visual elements that will also change the generated IDs of the rest.
3. IDs are execution-unique and are generated on the runtime. So repetitive ID's require repetitive navigation path
in the application. This makes it especially hard for a human to develop and support the test as would require to alwasy start from the begioing and pass over the whole test. It is also impossible to execute only part of the whole scenario by using disabled or focused specs and suites.
4. There are cases when the generated IDs will be different depending on the environment the application is running.
5. Generated IDs are totally not self-documenting and this makes the test harder to understand and maintain.

### Avoid non-visible attributes
Think from the point of view of the users. Users do not see DOM nodes and their attributes but see rendered DOM.
So write selectors that include only "visible" attributes.
This also makes the test much self-documenting and simplifies maintenance.

### Minimize use of attribute locators
These locators work slow and are usually not closely related to the visual representation. Besides, attribute values may often change and may not be specific enough if used on their own.

## DOM locators
All standart locators from webdriverjs are supported, please check webdirvejs docs for references.

## UIVeri5 locators

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
  
### Control locators
In the application testing approach we use hierarchical class locators composed of UI5 control main
(marker) class names (the class names of the control root DOM element). This hierarchical composition is important to guarantee the stability of locators. But the usage of classes is somehow problematic as DOM is not UI5 API and DOM could change between UI5 minor releases. Only UI5 JS API is guaranteed to be backward-compatible. One approach to mitigate this issue is to use control locators. Control locators are closely tied to the control level of abstraction and therefore should be much more intuitive for application developers. Control locators can be written easily by inspecting the application using [UI5 Inspector](https://chrome.google.com/webstore/detail/ui5-inspector/bebecogbafbighhaildooiibipcnbngo)
Using control locators will give you an ElementFinder of the element best representing the searched control. This element can change according to the applied interaction adapter, which is further described below.

#### Declarative matchers
Under the hood, control locators rely on [OPA5](https://openui5.hana.ondemand.com/#/api/sap.ui.test.Opa5/overview) utilities. If you are familiar with OPA5's `waitFor` structure, then you will be able to immediately transition to control locators. `by.control` accepts a plain object specifying the viewName, controlType, id suffix, and other properties of the control to look for, as well as a plain object of control matchers which perform in the same way as [OPA5 matchers](https://openui5.hana.ondemand.com/#/api/sap.ui.test.matchers/overview) with the corresponding names. The only difference from a typical `waitFor` is that some properties are not accepted, for example matcher and action object constructions and functions such as check, success and actions. Currently the supported matchers are: aggregationContainsPropertyEqual, aggregationEmpty, aggregationFilled, aggregationLengthEquals, bindingPath, I18NText, labelFor, properties, propertyStrictEquals.
Matchers syntax:
```javascript
element(by.control({
  viewName: "myViewName",
  controlType: "sap.m.ObjectHeader",
  bindingPath: {path: "/1", modelName: "JSONModel"},
  I18NText: {propertyName: "text", key: "buttonText"},
  labelFor: {key: "labelText", modelName: "i18n"}, // or {text: "myText}
  properties: {text: "My Header Text"},
  aggregationContainsPropertyEqual: {aggregationName: "myAggregation", propertyName: "enabled", propertyValue: true},
  aggregationLengthEquals: {name: "myAggregation", value: 1}
  aggregationEmpty: {name: "myAggregation"},
  aggregationFilled: {name: "myAggregation"}
}))
```
Using one type of matcher more than once:
```javascript
element(by.control({
  viewName: "myViewName",
  controlType: "sap.m.ObjectHeader",
  aggregationFilled: [
    {name: "myAggregation"},
    {name: "myOtherAggregation"}
  ]
}))
```

#### Interaction adapters
Interaction adapters allow selecting a certain subelement of a control. They are inspired by [Opa5 press adapters](https://openui5.hana.ondemand.com/#/api/sap.ui.test.actions.Press). You specify an adapter using the `interaction` property of the by.control object. The interaction can be any one of: "root", "focus", "press", "auto", {idSuffix: "myIDsuffix"}. the Default is "auto". This is what the located element will be in each case:
* root: the root DOM element of the control
* focus: the DOM element that should typically get the focus
* press: the DOM element that should get the press events, as determined by OPA5
* auto: the DOM element that should receive events, as determined by OPA5. This would search for special elements with the following priority: press, focus, root.
* {idSuffix: "myIDsuffix"}: child of the control DOM reference with ID ending in "myIDsuffix"

One common use case for changing the adapter is locating search fields:
```javascript
var searchInput = element(by.control({
  controlType: "sap.m.SearchField",
  interaction: "focus"
}); // will locate the input field
var searchPress = element(by.control({
  controlType: "sap.m.SearchField",
  interaction: "press"
}); // will locate the search button (magnifier)
```

Another use case would be controls like ObjectIdentified or ObjectAttribute that could have different aappearance and have OPA interaction adapters. The default "auto" interaction would use the interaction adapter to find the DOM. But if the control is not in the expected apearance and due to the hardcoded interaction adapter type order, it is possible that the search will fail with a message like: _INFO: Expectation FAILED: Failed: unknown error: Control Element sap.m.ObjectAttribute#\_\_attribute0 has no dom representation idSuffix was text_. The you need to overide the intercation type and search for a focused element:
```
var objectAttributeText = element(by.control({
                controlType: "sap.m.ObjectAttribute",
                interaction: "focus",
                properties: [{
                  title: "Freight RFQ"
                }]
              })); // will locate the text inside this ObjectAttribute
```

#### Control ancestors
When you use a control locator to find a child element of a specific parent, IUVeri5 will apply the [ancestor matcher](https://openui5.hana.ondemand.com/#/api/sap.ui.test.matchers.Ancestor) to the child. The parent element's control ID is used to find child controls. For example, if the parent is a header bar, its control's root element will be the header, so if you then search for child elements, the other header bars might match as well.  Example:
```javascript
element(by.id("page1-intHeader-BarLeft")) // can be any locator
  .element(by.control({
    controlType: "sap.m.Button"
  })); // will look for buttons in the header
```
