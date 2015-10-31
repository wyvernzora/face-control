/**
 * test/util/expand.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

const Manager      = dofile('lib/manager');
const expand       = dofile('lib/util/expand');


describe('expand(manager, name)', function() {

  beforeEach(function() {
    this.manager = new Manager();

    this.manager.imply('foo', 'bar');
    this.manager.imply('bar', 'baz');
  });

  it('should recursively expand role implications', function() {
    const expected = [ 'baz', 'bar', 'foo' ];
    const actual = expand(this.manager, 'baz');

    expect(actual)
      .to.deep.equal(expected);
  });

  it('should handle when a role implies nothing', function() {
    this.manager.implies.test = { };

    const expected = [ 'test' ];
    const actual = expand(this.manager, 'test');

    expect(actual)
      .to.deep.equal(expected);
  });

});
