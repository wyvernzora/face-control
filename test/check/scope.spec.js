/**
 * test/check/scope.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

const Manager      = dofile('lib/manager');
const checkScope   = dofile('lib/check/scope').default;
const $$cache      = dofile('lib/check/scope').$$cache;


describe('scope(manager, request, name)', function() {

  beforeEach(function() {
    this.manager = new Manager();

    this.manager.scope('foo', {
      hint: 'fooId'
    }, co(function*() {
      return 'foo';
    }));
    this.manager.scope('foo', {
      hint: 'barId',
      deps: 'bar'
    }, co(function*() {
      return 'bar:foo';
    }));
    this.manager.scope('bar', {
      hint: 'barId'
    }, co(function*() {
      return 'bar';
    }));
    this.manager.scope('bar', co(function*() {
      return '@@null:bar';
    }));
    this.manager.scope('akarin', co(function*() {
      return null;
    }));

  });


  it('should establish unhinted scope', co(function*() {
    const request = { params: { } };

    const expected = '@@null:bar';
    const actual = yield checkScope(this.manager, request, 'bar');

    expect(actual)
      .to.equal(expected);

    const cache = request[$$cache];
    expect(cache)
      .to.have.property('bar', '@@null:bar');
  }));

  it('should establish hinted scope', co(function*() {
    const request = { params: { barId: 0 } };

    const expected = 'bar';
    const actual = yield checkScope(this.manager, request, 'bar');

    expect(actual)
      .to.equal(expected);

    const cache = request[$$cache];
    expect(cache)
      .to.have.property('bar', 'bar');
  }));

  it('should establish hinted scope with deps', co(function*() {
    const request = { params: { barId: 0 } };

    const expected = 'bar:foo';
    const actual = yield checkScope(this.manager, request, 'foo');

    expect(actual)
      .to.equal(expected);

    const cache = request[$$cache];
    expect(cache)
      .to.have.property('foo', 'bar:foo');
    expect(cache)
      .to.have.property('bar', 'bar');
  }));

  it('should use cache when available', co(function*() {
    const callback = Sinon.spy(co(function*() { return 'baz'; }));
    this.manager.scope('baz', callback);

    const request = { params: { } };

    yield checkScope(this.manager, request, 'baz');
    yield checkScope(this.manager, request, 'baz');

    expect(callback)
      .to.be.calledOnce;
  }));

  it('should throw if scope is not defined', function() {

    const promise = checkScope(this.manager, { params: { } }, 'test');

    expect(promise)
      .to.be.rejectedWith('Scope \'test\' is not defined.');
  });

  it('should throw if no suitable strategy found', function() {
    const promise = checkScope(this.manager, { params: { } }, 'foo');

    expect(promise)
      .to.be.rejectedWith('No suitable strategy found for scope \'foo\'');
  });

  it('should throw if no callback returns falsy value', function() {
    const promise = checkScope(this.manager, { params: { } }, 'akarin');

    expect(promise)
      .to.be.rejectedWith('Akarin not found.');
  });

});
