/**
 * test/util/closure.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */
const test         = require('ava');

const Manager      = require('../../src/manager');
const Closure      = require('../../src/util/closure');


test(t => {

  const m = new Manager();

  m.imply('foo', 'bar');
  m.imply('bar', 'baz');

  m.imply('first', 'second');
  m.imply('second', 'third');


  const e = [ 'bar', 'baz', 'first', 'foo', 'second', 'third' ];
  const a = Closure(m, [ 'baz', 'third' ]);

  t.deepEqual(a.sort(), e);

});
