/**
 * index.spec.js
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
describe('Scope', function() {
  require('./scope.spec.js');
});

describe('Role', function() {
  require('./role.spec.js');
});

describe('Action', function() {

});

describe('Integration', function() {

});
