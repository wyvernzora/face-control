/**
 * index.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license AGPL v3
 */

import Check       from './check/request';
import { $$cache } from './check/scope';
import Collate     from './util/collate';
import Manager     from './manager';

/*!
 * Permission manager.
 */
const manager = new Manager();


/*!
 * Function to get scope from scope cache.
 */
function scope(name) {
  return this[$$cache][name];
}


/*!
 * Middleware factory.
 */
function FaceControl(...actions) {

  /* Get the scope-role tree */
  const tree = Collate(manager, actions);

  /* Create the middleware function that checks the request */
  return function(req, res, next) {
    req.scope = scope;
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


/*!
 * Export the thing.
 */
module.exports = FaceControl;
