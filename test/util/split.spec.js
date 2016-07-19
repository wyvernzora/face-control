/**
 * test/util/expand.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */
const test         = require('ava');

const Split        = require('../../src/util/split');


test('unscoped', t => {

  const e = { scope: '@@global', role: 'test' };
  const a = Split('test');

  t.deepEqual(a, e);

});


test('scoped', t => {

  const e = { scope: 'foo', role: 'bar' };
  const a = Split('foo.bar');

  t.deepEqual(a, e);

});


test('bad role name', t => {

  const a = () => Split('foo:bar.baz');

  t.throws(a, 'Invalid role name: foo:bar.baz');

});
