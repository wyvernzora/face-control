/**
 * role.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

import _           from 'lodash';

/*!
 * Store role callbacks.
 */
export const roles = new Map();


/*!
 * Implication mapping.
 */
export const implies = { };


/*!
 * Expands implications of a specific role.
 */
export function expand(name) {

  const meta = implies[name];

  /* No implications */
  if (!meta || !meta.implies) { return [name]; }

  /* Start recursive expansion */
  const expansion = new Set([name]);
  for (const r of meta.implies) {
    expansion.add(r);
    expand(r).forEach(expansion.add, expansion);
  }

  return [...expansion];
}


/*!
 * Adds an implication to the set.
 */
export function imply(name, others) {

  for (const r of others) {
    const meta = (implies[r] = implies[r] || { });
    meta.implies = meta.implies || new Set();
    meta.implies.add(name);
  }

  for (const k of Object.keys(implies)) {
    implies[k].closure = expand(k);
  }

}


/*!
 * Resolves a set of roles into all implied roles.
 */
export function resolve(...names) {
  return _(names)
    .map(r => implies[r] ? implies[r].closure : [r])
    .flatten()
    .uniq()
    .value();
}


/*!
 * Adds a role.
 */
export function define(name, callback) {
  if (roles.has(name)) {
    throw new Error(`Cannot redefine role '${name}'`);
  }
  roles.set(name, callback);
}
