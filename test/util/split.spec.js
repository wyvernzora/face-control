/**
 * test/util/split.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license AGPL v3
 */

const split        = dofile('lib/util/split');


describe('split(role)', function() {

  it('should recognize unscoped roles', function() {
    const expected = { scope: '@@global', role: 'test' };
    const actual = split('test');

    expect(actual)
      .to.deep.equal(expected);
  });

  it('should recognize scoped roles', function() {
    const expected = { scope: 'foo', role: 'bar' };
    const actual = split('foo.bar');

    expect(actual)
      .to.deep.equal(expected);
  });

  it('should throw on bad role name', function() {

    expect(function() {
      split('foo:bar.baz');
    }).to.throw('Invalid role name: foo:bar.baz');

  });

});
