/**
 * scope/add.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

import _           from 'lodash';
import Bluebird    from 'bluebird';


/*!
 * Symbol for accessing the scope cache.
 */
export const store = Symbol();


/*!
 * Singleton collection to store scopes.
 */
export const scopes = new Map();


/*!
 * Adds a scope definition to the scope manager.
 */
export function define(name, options, callback) {
  const meta = scopes.get(name) || [ ];
  const cfg  = { };

  if (!options) { options = { }; }

  cfg.name = name.toLowerCase();
  cfg.hint = options.hint;
  cfg.deps = _([options.deps]).flatten().compact().value();
  cfg.callback = callback;

  meta.push(cfg);
  scopes.set(name, meta);
}


/*!
 * Establishes the scope for a given request.
 */
export async function establish(req, name) {
  const cache = (req[store] = req[store] || { });

  /* Scope already established, proceed */
  if (cache[name]) { return cache[name]; }

  /* Find the most appropriate strategy */
  const strategies = scopes.get(name);
  if (!strategies || strategies.length === 0) {
    const err = new Error(`Scope '${name}' is not defined.`);
    err.status = 500;
    throw err;
  }
  const strategy = _(strategies).find(i => req.params[i.hint] || !i.hint);

  /* Work on all dependencies */
  const promises = strategy.deps.map(i => Bluebird.try(() => establish(req, i)));
  await Bluebird.all(promises);

  /* Establish the scope */
  const ent = await strategy.callback(req);

  if (!ent) {
    const err = new Error(`${_.capitalize(name)} not found.`);
    err.status = 404;
    throw err;
  }

  return (cache[name] = ent);

}
