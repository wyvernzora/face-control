/**
 * test/check/request.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */
const test         = require('ava');

const Sinon        = require('sinon');

const Manager      = require('../../src/manager');
const Check        = require('../../src/check/request');


/**
 * Prepare test data
 */
test.beforeEach(t => {

  const m = t.context = new Manager();

  m.scope('test', async () => 'test-scope');

});


/**
 * Test cases start
 */
test('global first', async t => {

  const m = t.context;

  const stub0 = Sinon.spy(async () => true);
  m.role('foo', stub0);

  const stub1 = Sinon.spy(async () => null);
  m.role('test.bar', stub1);

  const stub2 = Sinon.spy(async () => 'baz');
  m.role('test.baz', stub2);


  const tree = {
    'test': [ 'bar', 'baz' ],
    '@@global': [ 'foo' ]
  };
  const request = { params: { } };
  const result = await Check(m, tree, request);


  t.true(result);
  t.true(stub0.calledOnce);
  t.false(stub1.called);
  t.false(stub2.called);

});


test('priority', async t => {

  const m = t.context;

  const stub0 = Sinon.spy(async () => null);
  m.role('foo', stub0);

  const stub1 = Sinon.spy(async () => null);
  m.role('test.bar', stub1);

  const stub2 = Sinon.spy(async () => 'baz');
  m.role('test.baz', stub2);


  const tree = {
    'test': [ 'bar', 'baz' ],
    '@@global': [ 'foo' ]
  };
  const request = { params: { } };
  const result = await Check(m, tree, request);


  t.true(result);
  t.true(stub0.calledBefore(stub1));
  t.true(stub1.calledBefore(stub2));
  t.true(stub2.calledOnce);

});


test('no global scopes', async t => {

  const m = t.context;

  const stub0 = Sinon.spy(async () => null);
  m.role('foo', stub0);

  const stub1 = Sinon.spy(async () => null);
  m.role('test.bar', stub1);

  const stub2 = Sinon.spy(async () => 'baz');
  m.role('test.baz', stub2);


  const tree = {
    'test': [ 'bar', 'baz' ]
  };
  const request = { params: { } };
  const result = await Check(m, tree, request);


  t.true(result);
  t.false(stub0.called);
  t.true(stub1.calledOnce);
  t.true(stub2.calledOnce);

});


test('no match', async t => {

  const m = t.context;

  const stub0 = Sinon.spy(async () => null);
  m.role('foo', stub0);

  const stub1 = Sinon.spy(async () => null);
  m.role('test.bar', stub1);

  const stub2 = Sinon.spy(async () => null);
  m.role('test.baz', stub2);


  const tree = {
    'test': [ 'bar', 'baz' ],
    '@@global': [ 'foo' ]
  };
  const request = { params: { } };
  const result = await Check(m, tree, request);


  t.false(result);
  t.true(stub0.calledBefore(stub1));
  t.true(stub1.calledBefore(stub2));
  t.true(stub2.calledOnce);

});


test('error', async t => {

  const m = t.context;

  const stub0 = Sinon.spy(async () => { throw new Error('test'); });
  m.role('foo', stub0);

  const tree = {
    '@@global': [ 'foo' ]
  };
  const request = { params: { } };
  const promise = Check(m, tree, request);


  t.throws(promise, 'test');

});


test('undefined role', async t => {

  const m = t.context;

  const tree = {
    '@@global': [ 'foo' ]
  };
  const request = { params: { } };
  const promise = Check(m, tree, request);


  t.throws(promise, "Role 'foo' is not defined");

});
