/**
 * test/role.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

const _            = require('lodash');

const Role         = dofile('lib/role');
const Scope        = dofile('lib/scope');


beforeEach(function() {
  Scope.scopes.clear();
  Role.roles.clear();

  _.mapValues(Role.implies, () => null);
});

describe('define(name)', function() {

  it('should define a new role', function() {
    Role.define('foo', () => { });

    const actual = Role.roles.get('foo');

    expect(actual)
      .to.exist
      .to.be.a('function');
  });

  it('should throw when attempting to redefine', function() {
    Role.define('foo', () => { });

    expect(function() {
      Role.define('foo', () => { });
    }).to.throw('Cannot redefine role \'foo\'');

  });

});

describe('imply | expand | resolve', function() {

  it('should add implication entries', function() {
    Role.imply('one', ['two']);

    expect(Role.implies)
      .to.have.property('two');
    expect(Role.implies.two.implies.has('one'))
      .to.be.true;
  });

  it('should recursively expand closure', function() {
    Role.imply('one', ['two']);
    Role.imply('two', ['three']);
    Role.imply('three', ['four']);
    Role.imply('foo', ['three']);
    Role.imply('bar', ['two']);

    const closure1 = Role.resolve('one');
    expect(closure1)
      .to.deep.equal(['one']);

    const closure2 = Role.resolve('two');
    expect(closure2)
      .to.deep.equal(['two', 'one', 'bar']);

    const closure3 = Role.resolve('three');
    expect(closure3)
      .to.deep.equal(['three', 'two', 'one', 'bar', 'foo']);

    const closure4 = Role.resolve('four');
    expect(closure4)
      .to.deep.equal(['four', 'three', 'two', 'one', 'bar', 'foo']);

  });

});
