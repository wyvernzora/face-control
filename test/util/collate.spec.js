/**
 * test/util/collate.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */
const test         = require('ava');

const Manager      = require('../../src/manager');
const Collate      = require('../../src/util/collate');


/**
 * Prepare test data
 */
test.beforeEach(t => {

  const m = t.context = new Manager();

  m.action('one', [ 'a.foo', 'b.bar', 'baz' ]);
  m.action('two', [ 'a.foo', 'a.bar', 'baz', 'test' ]);

});


/**
 * Test cases start
 */
test(t => {

  const e = {
    '@@global': [ 'baz', 'test' ],
    'a': [ 'foo', 'bar' ],
    'b': [ 'bar' ]
  };
  const a = Collate(t.context, [ 'one', 'two' ]);

  t.deepEqual(e, a);

});


test('undefined action', t => {

  const a = () => Collate(t.context, [ 'hello' ]);

  t.throws(a, "Action 'hello' is not defined.");

});
