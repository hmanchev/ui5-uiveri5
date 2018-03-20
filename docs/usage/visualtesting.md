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
For recommendations on test code structure, see [basics.md](docs/usage/basics.md), [locators.md](docs/usage/locators.md) and [expectations.md](docs/usage/expectations.md)
