/**
 * test/util/expand.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */
const test         = require('ava');

const Manager      = require('../../src/manager');
const Expand       = require('../../src/util/expand');


/**
 * Prepare test data
 */
test.beforeEach(t => {

  const m = t.context = new Manager();

  m.imply('foo', 'bar');
  m.imply('bar', 'baz');

});


/**
 * Test cases start
 */
test(t => {

  const e = [ 'bar', 'baz', 'foo' ];
  const a = Expand(t.context, 'baz');

  t.deepEqual(a.sort(), e);

});


test('imply nothing', t => {

  const e = [ 'test' ];
  const a = Expand(t.context, 'test');

  t.deepEqual(a.sort(), e);

});
