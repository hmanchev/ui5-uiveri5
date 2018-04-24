# Application testing

## Test organization
We recommend using the page object pattern in integration tests. For page object examples, see [pageobjects.md](pageobjects.md)
Control locators can also be of great use since they help appication developers stick to the control lеvel of abstraction and not have to dig down into DOM level. Details on locators can be found in [locators.md](locators.md).
For more recommendations on test code structure, see [basics.md](basics.md) and[expectations.md](expectations.md).

### Test Data
Extract all test content constants in a single test data object.
