/**
 * scope/add.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

import _           from 'lodash';
import Bluebird    from 'bluebird';

/*!
 * Singleton collection to store scopes.
 */
export const scopes = new Map();


/*!
 * Adds a scope definition to the scope manager.
 */
export function scope(name, options, callback) {
  const meta = scopes.get(name) || [ ];
  const cfg  = { };

  if (!options) { options = { }; }

  cfg.name = name.toLowerCase();
  cfg.hint = options.hint;
  cfg.deps = _.flatten([options.deps]);
  cfg.callback = callback;

  scope.push(cfg);
  scopes.set(name, meta);
}


/*!
 * Establishes the scope for a given request.
 */
export async function establish(req, name) {

  /* Scope already established, proceed */
  if (req[name]) { return req[name]; }

  /* Find the most appropriate strategy */
  const strategies = scopes.get(name);
  if (!strategies || strategies.length === 0) {
    throw new Error(`Scope '${name}' is not defined.`);
  }
  const strategy = _(strategies).findLast(i => req.params[i.hint] || !i.hint).value();

  /* Work on all dependencies */
  const promises = strategy.deps.map(i => establish(req, i));
  await Bluebird.all(promises);

  /* Establish the scope */
  const ent = await strategy.callback(req);
  return (req[name] = ent);

}
