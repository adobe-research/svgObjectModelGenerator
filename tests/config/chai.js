var chai = require('chai');

chai.config.includeStack = true;

global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;
global.window = require("jsdom").jsdom().createWindow();
global.jQuery = require("jquery");
global.$ = global.jQuery;

