/**
 * test/action.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

const Action       = dofile('lib/action');


it('should define an action', function() {

  Action.define('test', [ 'foo', 'bar' ]);

  expect(Action.actions)
    .to.have.property('test');
  expect(Action.actions.test)
    .to.deep.equal(['foo', 'bar']);

});

it('should throw when redefining', function() {
  expect(function() {
    Action.define('test', [ 'foo', 'bar' ]);
  }).to.throw('Cannot redefine action');
});
