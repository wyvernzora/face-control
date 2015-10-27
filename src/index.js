/**
 * index.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

import Bluebird    from 'bluebird';

import * as Scope  from './scope';
import * as Action from './action';
import * as Role   from './role';


function FaceControl(...actions) {

  /* Expand into the full set of required roles */
  const roles = new Set();
  for (const a of actions) {
    const deps = Action.actions[a];
    if (!deps) { throw new Error(`Action '${a}' not defined.`); }
    deps.forEach(roles.add, roles);
  }

  /* Collate unique scopes */
  const scopes = new Set();
  for (const r of roles) {
    if (!Role._callbacks.has(r)) {
      throw new Error(`Role '${r}' not defined.`);
    }
    if (/\./.test(r)) {
      scopes.add(r.split('.')[0]);
    }
  }

  /* Setup the async middleware */
  const middleware = async function(req) {

    /* Establish all required scopes */
    for (const scope of scopes) {
      await Scope.establish(req, scope);
    }

    /* Try to match any role */
    /* TODO Support async role callbacks (or not?) */
    for (const role of roles) {
      if (Role._callbacks[role](req)) { return true; }
    }

    /* Did not match anything :( */
    const error = new Error(`Action not allowed: ${actions.join(',')}`);
    error.status = 403;
    throw error;
  };

  /* Return the unpromisified middleware */
  return function(req, res, next) {
    Bluebird
      .resolve(middleware(req, res, next))
      .then(() => next())
      .catch(next);
  };

}


/*!
 * Scope methods.
 */
FaceControl.scope = Scope.define;


/*!
 * Role methods.
 */
FaceControl.role = Role.define;
FaceControl.imply = Role.imply;


/*!
 * Action methods.
 */
FaceControl.action = Action.define;


module.exports = FaceControl;
