var chai = require('chai');

chai.config.includeStack = true;

global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;

//! repairMedia = true to update failed media with current results
//! Please review the changes carefully and try the media before and after the update
global.repairMedia = false;

