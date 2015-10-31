/**
 * test/util/collate.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license AGPL v3
 */

const Manager      = dofile('lib/manager');
const collate      = dofile('lib/util/collate');


describe('collate(manager, actions)', function() {

  beforeEach(function() {
    this.manager = new Manager();

    this.manager.action('one', [ 'a.foo', 'b.bar', 'baz' ]);
    this.manager.action('two', [ 'a.foo', 'a.bar', 'baz', 'test' ]);
  });

  it('should compute the scope tree', function() {
    const expected = {
      '@@global': [ 'baz', 'test' ],
      'a': [ 'foo', 'bar' ],
      'b': [ 'bar' ]
    };
    const actual = collate(this.manager, [ 'one', 'two' ]);

    expect(actual)
      .to.deep.equal(expected);
  });

  it('should throw when encountering undefined actions', function() {

    expect(() => {
      collate(this.manager, [ 'hello' ]);
    }).to.throw('Action \'hello\' is not defined.');

  });

});
