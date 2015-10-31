/**
 * test/check/request.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

const Manager      = dofile('lib/manager');
const checkRequest = dofile('lib/check/request');


describe('request(manager, tree, req)', function() {

  beforeEach(function() {
    this.manager = new Manager();

    this.manager.scope('test', co(function*() {
      return 'test-scope';
    }));

  });


  it('should run global scope first', co(function*() {
    this.foo = Sinon.spy(co(function*() { return true; }));
    this.manager.role('foo', this.foo);
    this.bar = Sinon.spy(co(function*() { return null; }));
    this.manager.role('bar', this.bar);
    this.baz = Sinon.spy(co(function*() { return 'baz'; }));
    this.manager.role('baz', this.baz);


    const tree = {
      'test': [ 'bar', 'baz' ],
      '@@global': [ 'foo' ]
    };
    const request = { params: { } };
    const result = yield checkRequest(this.manager, tree, request);

    expect(result)
      .to.be.true;
    expect(this.foo)
      .to.be.calledOnce
      .to.be.calledWith(null, 'foo', request);
    expect(this.bar)
      .to.have.callCount(0);
    expect(this.baz)
      .to.have.callCount(0);
  }));

  it('should run other scopes after global', co(function*() {
    this.foo = Sinon.spy(co(function*() { return null; }));
    this.manager.role('foo', this.foo);
    this.bar = Sinon.spy(co(function*() { return null; }));
    this.manager.role('bar', this.bar);
    this.baz = Sinon.spy(co(function*() { return 'baz'; }));
    this.manager.role('baz', this.baz);


    const tree = {
      '@@global': [ 'foo' ],
      'test': [ 'bar', 'baz' ]
    };
    const request = { params: { } };
    const result = yield checkRequest(this.manager, tree, request);

    expect(result)
      .to.be.true;
    expect(this.foo)
      .to.be.calledOnce
      .to.be.calledBefore(this.bar)
      .to.be.calledBefore(this.baz);
    expect(this.foo)
      .to.be.calledWith(null, 'foo', request);
    expect(this.bar)
      .to.be.calledWith('test-scope', 'test.bar', request);
    expect(this.baz)
      .to.be.calledWith('test-scope', 'test.baz', request);
  }));

  it('should work when there are no global scopes', co(function*() {
    this.foo = Sinon.spy(co(function*() { return null; }));
    this.manager.role('foo', this.foo);
    this.bar = Sinon.spy(co(function*() { return null; }));
    this.manager.role('bar', this.bar);
    this.baz = Sinon.spy(co(function*() { return 'baz'; }));
    this.manager.role('baz', this.baz);


    const tree = {
      'test': [ 'bar', 'baz' ]
    };
    const request = { params: { } };
    const result = yield checkRequest(this.manager, tree, request);

    expect(result)
      .to.be.true;
    expect(this.foo)
      .to.have.callCount(0);
    expect(this.bar)
      .to.be.calledOnce
      .to.be.calledWith('test-scope', 'test.bar', request);
    expect(this.baz)
      .to.be.calledOnce
      .to.be.calledWith('test-scope', 'test.baz', request);
  }));

  it('should result in false when nothing matches', co(function*() {
    this.foo = Sinon.spy(co(function*() { return null; }));
    this.manager.role('foo', this.foo);
    this.bar = Sinon.spy(co(function*() { return null; }));
    this.manager.role('bar', this.bar);
    this.baz = Sinon.spy(co(function*() { return null; }));
    this.manager.role('baz', this.baz);


    const tree = {
      '@@global': [ 'foo' ],
      'test': [ 'bar', 'baz' ]
    };
    const request = { params: { } };
    const result = yield checkRequest(this.manager, tree, request);

    expect(result)
      .to.be.false;
    expect(this.foo)
      .to.be.calledOnce
      .to.be.calledWith(null, 'foo', request);
    expect(this.bar)
      .to.be.calledOnce
      .to.be.calledWith('test-scope', 'test.bar', request);
    expect(this.baz)
      .to.be.calledOnce
      .to.be.calledWith('test-scope', 'test.baz', request);
  }));

  it('should propagate errors via promise rejections', function() {
    this.foo = Sinon.spy(co(function*() { throw new Error('test error'); }));
    this.manager.role('foo', this.foo);


    const tree = { '@@global': [ 'foo' ] };
    const request = { params: { } };
    const promise = checkRequest(this.manager, tree, request);

    expect(promise)
      .to.be.rejectedWith('test error');
  });

});
