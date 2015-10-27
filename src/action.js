/**
 * action.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

import * as Role   from './role';


/*!
 * Store actions and required roles.
 */
export const actions = { };


/*!
 * Defines an action.
 */
export function define(action, roles) {
  if (actions[action]) {
    throw new Error(`Cannot redefine action '${action}'.`);
  }
  actions[action] = Role.resolve(...roles);
}
