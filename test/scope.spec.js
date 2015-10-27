/**
 * scope.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

const target       = require('../lib/scope');


describe('define(name, optiona, callback)', function() {

  after(function() { target.scopes.clear(); });


  it('should define a scope', function() {
    const callback = function() { };
    target.define('test', null, callback);

    const actual = target.scopes.get('test');
    expect(actual)
      .to.exist
      .to.have.length(1);
    expect(actual[0])
      .to.be.an('object')
      .to.have.a.property('callback', callback);
    expect(actual[0])
      .to.have.a.property('name', 'test');
    expect(actual[0])
      .to.have.a.property('hint')
      .not.to.exist;
    expect(actual[0])
      .to.have.a.property('deps');
  });

  it('should apply options', function() {
    const callback = function() { };
    target.define('test', { hint: 'test_id', deps: [ 'foo' ] }, callback);


    const actual = target.scopes.get('test');
    expect(actual)
      .to.exist
      .to.have.length(2);
    expect(actual[1])
      .to.be.an('object')
      .to.have.a.property('callback', callback);
    expect(actual[1])
      .to.have.a.property('name', 'test');
    expect(actual[1])
      .to.have.a.property('hint', 'test_id');
    expect(actual[1])
      .to.have.a.property('deps');
    expect(actual[1].deps[0])
      .to.equal('foo');
  });

});


describe('establish(req, name)', function() {

  beforeEach(function() {
    target.scopes.clear();
  });

  it('should find the entity', co(function*() {
    const resolver = Sinon.spy(co(function*() { return 'foo'; }));

    target.define('test', null, resolver);
    const request = { params: { test: 'foo' } };
    const scope = yield target.establish(request, 'test');

    expect(resolver)
      .to.be.calledOnce;
    expect(scope)
      .to.equal('foo');
    expect(request[target.store])
      .to.have.property('test', 'foo');

    const another = yield target.establish(request, 'test');

    expect(resolver)
      .to.be.calledOnce;
    expect(another)
      .to.equal('foo');
  }));

  it('should throw on undefined scope', function() {
    const request = { params: { test: 'foo' } };
    const promise = target.establish(request, 'test');
    expect(promise)
      .to.be.rejectedWith('Scope \'test\' is not defined.');
  });

  it('should work on dependencies', co(function*() {
    const resolver = Sinon.spy(co(function*() { return 'foo'; }));
    target.define('test', { deps: 'test_1' }, resolver);

    const dep = Sinon.spy(co(function*() { return 'bar'; }));
    target.define('test_1', null, dep);

    const request = { params: { test: 'foo' } };
    const scope = yield target.establish(request, 'test');

    expect(scope)
      .to.equal('foo');
    expect(request[target.store])
      .to.have.property('test', 'foo');
    expect(request[target.store])
      .to.have.property('test_1', 'bar');
    expect(dep)
      .to.be.calledBefore(resolver);
  }));

  it('should throw if entity is not found', function() {
    target.define('test', null, co(function*() { return null; }));
    const request = { params: { test: 'foo' } };
    const promise = target.establish(request, 'test');

    expect(promise)
      .to.be.rejectedWith('Test not found.');
  });

  it('should use the first most suitable strategy', co(function*() {
    const resolver = Sinon.spy(co(function*() { return 'foo'; }));
    target.define('test', { hint: 'test' }, resolver);

    const dep = Sinon.spy(co(function*() { return 'bar'; }));
    target.define('test', { hint: 'test' }, dep);

    const request = { params: { test: 'foo' } };
    const scope = yield target.establish(request, 'test');

    expect(scope)
      .to.equal('foo');
    expect(resolver)
      .to.be.calledOnce
      .to.be.calledWith(request);
    expect(dep)
      .to.have.callCount(0);
  }));

});
