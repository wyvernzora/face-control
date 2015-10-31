/**
 * test/manager.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license AGPL v3
 */

const Manager      = dofile('lib/manager');


beforeEach(function() {
  this.manager = new Manager();
});


describe('constructor()', function() {

  it('should initialize the manager instance', function() {

    expect(this.manager)
      .to.have.property('scopes')
      .that.deep.equals({ });
    expect(this.manager)
      .to.have.property('roles')
      .that.deep.equals({ });
    expect(this.manager)
      .to.have.property('actions')
      .that.deep.equals({ });
    expect(this.manager)
      .to.have.property('implies')
      .that.deep.equals({ });

  });

});


describe('scope(name, options, callback)', function() {

  it('should define a new scope', function() {
    const callback = () => { };
    this.manager.scope('test', null, callback);

    const scopes = this.manager.scopes;
    expect(scopes)
      .to.have.property('test');
    expect(scopes.test)
      .to.have.property('@@null')
      .that.exists;
    expect(scopes.test['@@null'])
      .to.have.property('deps')
      .that.deep.equals([ ]);
    expect(scopes.test['@@null'])
      .to.have.property('callback')
      .that.equals(callback);
  });

  it('should allow optional options', function() {
    const callback = () => { };
    this.manager.scope('test', callback);

    const scopes = this.manager.scopes;
    expect(scopes)
      .to.have.property('test');
    expect(scopes.test)
      .to.have.property('@@null')
      .that.exists;
    expect(scopes.test['@@null'])
      .to.have.property('deps')
      .that.deep.equals([ ]);
    expect(scopes.test['@@null'])
      .to.have.property('callback')
      .that.equals(callback);
  });

  it('should use hint and deps', function() {
    this.manager.scope('test', { hint: 'foo', deps: 'bar' }, () => { });

    const scopes = this.manager.scopes;
    expect(scopes.test)
      .to.have.property('foo')
      .that.exists;
    expect(scopes.test.foo)
      .to.have.property('deps')
      .that.deep.equals([ 'bar' ]);

  });

  it('should throw when redefining', function() {
    this.manager.scope('test', { hint: 'foo' }, () => { });

    expect(() => {
      this.manager.scope('TEST', { hint: 'foo' }, () => { });
    }).to.throw('Cannot overwrite scope \'test\' with hint \'foo\'');

  });

});


describe('role(name, callback)', function() {

  it('should define a new role', function() {
    const callback = () => { };
    this.manager.role('test', callback);

    const roles = this.manager.roles;
    expect(roles)
      .to.have.property('test')
      .that.is.a('function')
      .that.equals(callback);
  });

  it('should throw when redefining', function() {
    this.manager.role('test', () => { });

    expect(() => {
      this.manager.role('test', () => { });
    }).to.throw('Cannot overwrite role \'test\'');

  });

});


describe('action(name, roles)', function() {

  it('should define new action', function() {
    this.manager.action('test', ['foo', 'bar']);

    const actions = this.manager.actions;
    expect(actions)
      .to.have.property('test')
      .that.exists;
    expect(actions.test)
      .to.deep.equal([ 'foo', 'bar' ]);
  });

  it('should throw when redefining', function() {
    this.manager.action('test', ['foo', 'bar']);

    expect(() => {
      this.manager.action('test', ['foo', 'bar']);
    }).to.throw('Cannot overwrite action \'test\'');
  });

});


describe('imply(role, ...others)', function() {

  it('should apply implication', function() {
    this.manager.imply('test', 'foo', 'bar');

    const imply = this.manager.implies;
    expect(imply)
      .to.have.property('foo')
      .to.have.property('implies');
    expect(imply.foo.implies.has('test'))
      .to.be.true;
    expect(imply)
      .to.have.property('foo')
      .to.have.property('implies');
    expect(imply.bar.implies.has('test'))
      .to.be.true;
  });

});
