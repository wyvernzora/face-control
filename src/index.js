/**
 * index.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

import Check       from './check/request';
import Collate     from './util/collate';
import Manager     from './manager';

/*!
 * Permission manager.
 */
const manager = new Manager();


/*!
 * Function to retroactively check additional permissions.
 */
function can(req, ...actions) {

  /* Get the scope-role tree */
  const tree = Collate(manager, actions);

  /* Check the permissions */
  return Check(manager, tree, req);

}


/*!
 * Middleware factory.
 */
function FaceControl(...actions) {

  /* Get the scope-role tree */
  const tree = Collate(manager, actions);

  /* Create the middleware function that checks the request */
  return function(req, res, next) {
    const promise = Check(manager, tree, req);

    promise
      .then(result => {
        if (!result) {
          const error = new Error(`Permission denied: ${ actions.join(', ') }`);
          error.name = 'AuthorizationError';
          throw error;
        }
        next();
      })
      .catch(next);
  };

}


/*!
 * Expose manager functions via FaceControl export.
 */
FaceControl.scope  = manager.scope.bind(manager);
FaceControl.role   = manager.role.bind(manager);
FaceControl.action = manager.action.bind(manager);
FaceControl.imply  = manager.imply.bind(manager);
FaceControl.can    = can;

/*!
 * Export the thing.
 */
module.exports = FaceControl;
