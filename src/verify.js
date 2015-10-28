/**
 * verify.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

import _           from 'lodash';
import Bluebird    from 'bluebird';

import * as Scope  from './scope';
import * as Action from './action';
import * as Role   from './role';

/*!
 * Resolves to the set of scopes and roles that need to be observed
 * from a set of actions.
 */
export function collate(actions) {
  const roles = new Set();
  const scopes = new Set();

  /* Expand into the full set of required roles */
  for (const a of actions) {
    const deps = Action.actions[a];
    if (!deps) { throw new Error(`Action '${a}' is not defined.`); }
    deps.forEach(roles.add, roles);
  }

  /* Collate unique scopes */
  for (const r of roles) {
    const meta = { scope: null, name: r };
    const split = r.split('.', 2);
    if (split.length === 2) {
      meta.name = split[1];
      meta.scope = split[2];
    }

    if (!Role.roles.has(meta.name)) {
      throw new Error(`Role '${meta.name}' is not defined.`);
    }

    if (meta.scope) {
      if (!Scope.scopes.has(meta.scope)) {
        throw new Error(`Scope '${meta.scope}' is not defined.`);
      }
      scopes.add(meta.scope);
    }
  }

  /* Return the data */
  return {
    scopes: [...scopes],
    roles: [...roles]
  };
}


/*!
 * The promised verifier middleware.
 */
export async function verify(actions, scopes, roles, req) {

  /* Establish all required scopes */
  for (const scope of scopes) {
    await Scope.establish(req, scope);
  }

  /* Try to match any role */
  /* TODO Support async role callbacks (or not?) */
  for (const role of roles) {
    const result = Role.roles.get(role)(req);
    if (result) { return true; }
  }

  /* Did not match anything :( */
  const error = new Error(`Action not allowed: ${actions.join(',')}`);
  error.status = 403;
  throw error;
}


/*!
 * Verifier factory.
 */
export function factory(...actions) {

  const data = collate(actions);
  const check = _.partial(verify, actions, data.scopes, data.roles);

  /* Return the unpromisified middleware */
  return function(req, res, next) {
    Bluebird
      .resolve(check(req))
      .then(() => next())
      .catch(next);
  };
}
