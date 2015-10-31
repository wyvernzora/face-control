/**
 * test/util/expand.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license AGPL v3
 */

const Manager      = dofile('lib/manager');
const closure      = dofile('lib/util/closure');


describe('closure(manager, roles)', function() {

  beforeEach(function() {
    this.manager = new Manager();

    this.manager.imply('foo', 'bar');
    this.manager.imply('bar', 'baz');

    this.manager.imply('first', 'second');
    this.manager.imply('second', 'third');
  });

  it('should compute the implication closure of roles', function() {
    const expected = [ 'baz', 'bar', 'foo', 'third', 'second', 'first' ];
    const actual = closure(this.manager, [ 'baz', 'third' ]);

    expect(actual)
      .to.deep.equal(expected);
  });

});
