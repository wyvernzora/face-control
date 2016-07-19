/**
 * test/check/scope.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */
const test         = require('ava');

const Sinon        = require('sinon');

const Manager      = require('../../src/manager');
const Scope        = require('../../src/check/scope').default;


/**
 * Prepare test data
 */
test.beforeEach(t => {

  const m = t.context = new Manager();

  m.scope('foo', {
    hint: 'fooId'
  }, async () => 'foo');
  m.scope('foo', {
    hint: 'barId',
    deps: 'bar'
  }, async () => 'bar:foo');
  m.scope('bar', {
    hint: 'barId'
  }, async () => 'bar');
  m.scope('bar', async () => '@@null:bar');
  m.scope('akarin', async () => null);

});


/**
 * Test cases start
 */
test('unhinted', async t => {

  const r = { params: { } };


  const e = '@@null:bar';
  const a = await Scope(t.context, r, 'bar');

  t.is(a, e);


  const c = r.$fc_cache$;

  t.is(c.bar, '@@null:bar');

});


test('hinted', async t => {

  const r = { params: { barId: 0 } };


  const e = 'bar';
  const a = await Scope(t.context, r, 'bar');

  t.is(a, e);


  const c = r.$fc_cache$;

  t.is(c.bar, 'bar');

});


test('hinted w/ deps', async t => {

  const r = { params: { barId: 0 } };


  const e = 'bar:foo';
  const a = await Scope(t.context, r, 'foo');

  t.is(a, e);


  const c = r.$fc_cache$;

  t.is(c.foo, 'bar:foo');
  t.is(c.bar, 'bar');

});


test('cache', async t => {

  const cb = Sinon.spy(async () => 'baz');
  t.context.scope('baz', cb);


  const r = { params: { } };


  await Scope(t.context, r, 'baz');
  await Scope(t.context, r, 'baz');


  t.true(cb.calledOnce);

});


test('undefined', async t => {

  const r = { params: { } };

  const p = Scope(t.context, r, 'test');

  t.throws(p, "Scope 'test' is not defined.");

});


test('no strategy', async t => {

  const r = { params: { } };

  const a = await Scope(t.context, r, 'foo');

  t.is(a, null);

});
