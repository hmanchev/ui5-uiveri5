/*global describe,it,element,by,expect*/

describe('noUI5', function () {
	'use strict';

	it('should fail with no UI5 on page', function () {
        expect(browser.getTitle()).toBe('Google');
    });
});
