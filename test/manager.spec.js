/**
 * test/manager.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */
const test         = require('ava');

const Manager      = require('../src/manager');


/**
 * Prepare a new instance for each test
 */
test.beforeEach(t => {
  t.context = new Manager();
});


/**
 * Test cases start
 */
test('init', t => {

  const m = t.context;

  t.deepEqual(m.scopes, { });
  t.deepEqual(m.roles, { });
  t.deepEqual(m.actions, { });
  t.deepEqual(m.implies, { });

});


test('scope -> new', t => {

  const m = t.context;

  const cb = () => { };
  m.scope('test', null, cb);

  const s = m.scopes.test['@@null'];


  t.is(s.deps.length, 0);
  t.is(s.callback, cb);

});


test('scope -> no options', t => {

  const m = t.context;

  const cb = () => { };
  m.scope('test', cb);

  const s = m.scopes.test['@@null'];


  t.is(s.deps.length, 0);
  t.is(s.callback, cb);

});


test('scope -> hint / deps', t => {

  const m = t.context;

  const cb = () => { };
  m.scope('test', { hint: 'foo', deps: 'bar' }, cb);

  const s = m.scopes.test.foo;


  t.is(s.deps.length, 1);
  t.is(s.deps[0], 'bar');
  t.is(s.callback, cb);

});


test('scope -> overwrite', t => {

  const m = t.context;
  m.scope('test', { hint: 'foo' }, () => { });

  const a = () => m.scope('test', { hint: 'foo' }, () => { });

  t.throws(a, "Cannot overwrite scope 'test' with hint 'foo'");

});


test('role -> new', t => {

  const m = t.context;

  const cb = () => { };
  m.role('test', cb);


  const a = m.roles;

  t.is(a.test, cb);

});


test('role -> overwrite', t => {

  const m = t.context;

  m.role('test', () => { });

  const a = () => m.role('TEST', () => { });

  t.throws(a, "Cannot overwrite role 'test'");

});


test('action -> new', t => {

  const m = t.context;

  m.action('test', [ 'foo', 'bar' ]);

  const a = m.actions;

  t.deepEqual(a.test, [ 'foo', 'bar' ]);

});


test('action -> overwrite', t => {

  const m = t.context;

  m.action('test', [ 'foo', 'bar' ]);

  const a = () => m.action('test', [ 'foo', 'bar' ]);

  t.throws(a, "Cannot overwrite action 'test'");

});


test('imply -> new', t => {

  const m = t.context;

  m.imply('test', 'foo', 'bar');

  const a = m.implies;

  t.true(a.foo.implies.has('test'));
  t.true(a.bar.implies.has('test'));

});
