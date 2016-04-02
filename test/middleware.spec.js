/**
 * test/middleware.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

const FaceControl  = dofile('lib');


before(function() {

  FaceControl.scope('test', { hint: 'testId' }, co(function*() { return 'test'; }));

  FaceControl.role('foo', co(function*(ent) { return ent; }));
  FaceControl.role('err', co(function*() { throw new Error('test error'); }));

  FaceControl.action('greet', [ 'test.foo' ]);
  FaceControl.action('crash', [ 'test.err' ]);
  FaceControl.action('deny', [ 'foo' ]);

});


it('should call next() if everything checks out', function(done) {

  const request = { params: { testId: 1 } };
  const mware = FaceControl('greet');

  mware(request, null, (err) => {
    expect(err)
      .not.to.exist;

    const promise = FaceControl.can(request, 'greet');
    expect(promise)
      .to.eventually.equal(true);

    done();
  });

});

it('should call next() if request is denied', function(done) {

  const request = { params: { testId: 1 } };
  const mware = FaceControl('deny');

  mware(request, null, (err) => {
    expect(err)
      .to.exist
      .to.be.instanceOf(Error)
      .to.have.property('message', 'Permission denied: deny');

    const promise = FaceControl.can(request, 'deny');
    expect(promise)
      .to.eventually.equal(false);

    done();
  });

});

it('should call next() if an error occurs', function(done) {

  const request = { params: { testId: 1 } };
  const mware = FaceControl('crash');

  mware(request, null, (err) => {
    expect(err)
      .to.exist
      .to.be.instanceOf(Error)
      .to.have.property('message', 'test error');

    const promise = FaceControl.can(request, 'crash');
    expect(promise)
      .to.be.rejectedWith('test error');

    done();
  });

});
