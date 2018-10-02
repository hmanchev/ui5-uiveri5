# Visual Testing

## Requirements
Only one describe() block with name <lib>.<SpecName>
No browser.get()

### "Spec name does not match control name" error
Spec name is used to resolve the control name and its meta information like control owner. Control owner is
necessary for assigning gerrit reviews for update of reference images. In case spec name does not match control
name, you need to explicitly specify the control name in suite meta data like:
````
describe("sap.m.AppWithBackground", function () {
	browser.testrunner.currentSuite.meta.controlName = 'sap.m.App';

	//... it() blocks
});
````
### Image name limitations
Image name can contain only allowed file system symbols like: litters, numbers, underscore, hyphen.
Image name length should be minimum 3 characters length and maximum 40 characters length.

## Test structure
For recommendations on test code structure, see [basics.md](basics.md), [locators.md](locators.md) and [expectations.md](expectations.md)

## Configurations

### Override reference image storage for local image storage case
When localStorageProvider is used, by default the reference images are stored in the source tree, parallel to the
the tests in a subfolder 'visual'. This is fine if you plan to submit the images in git as part of the test.
In central visual test execution usaces, it could be useful to store the reference images in a separate folder,
outside ot the source tree. Configure the required folder in your conf.js like this:
```javascript
storageProvider: {name: './image/localStorageProvider',
  refImagesRoot: 'c:\imagestore',actImagesRoot:'c:\imagestore'}
```

### External image references in HTML report
You could overwrite images (reference and actual) root for consumption from remote host like:
```javascript
storageProvider: {name: './image/localStorageProvider',
  refImagesRoot: 'c:\imagestore',actImagesRoot:'c:\imagestore',
  refImagesShowRoot: 'file://share',actImagesShowRoot:'file://share'}
```