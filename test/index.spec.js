/**
 * test/index.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

const Chai         = require('chai');
Chai.use(require('sinon-chai'));
Chai.use(require('chai-as-promised'));


/*!
 * Setup global stuff here.
 */
global.co          = require('bluebird').coroutine;
global.expect      = Chai.expect;
global.Sinon       = require('sinon');
global.dofile      = require('app-root-path').require;

/*!
 * Start tests
 */
describe('Manager', function() {
  require('./manager.spec.js');
});

describe('Utilities', function() {
  require('./util/closure.spec.js');
  require('./util/collate.spec.js');
  require('./util/expand.spec.js');
  require('./util/split.spec.js');
});

describe('Check', function() {
  require('./check/scope.spec.js');
  require('./check/request.spec.js');
});
