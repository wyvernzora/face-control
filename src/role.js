/**
 * role.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

import _           from 'lodash';
import {scopes}    from './scope';

/*!
 * Store role callbacks.
 */
const _callbacks = new Map();


/*!
 * Store implications.
 */
const _rules = { };


/*!
 * Actual implication lookup map.
 */
const _implies = { };


/*!
 * Expands implications of a specific role.
 */
export function expand(role) {

  /* No implications */
  if (!_rules[role]) { return [role]; }

  /* Start recursive expansion */
  const expansion = new Set([role]);
  _rules[role].forEach(r => {
    expansion.add(r);
    expand(r).forEach(i => expansion.add(i));
  });

  return [...expansion];
}


/*!
 * Adds an implication to the set.
 */
export function imply(role, others) {

  /* Add implication */
  const set = (_rules[role] || []).concat(others);
  _rules[role] = set;

  /* Generate a mapping, then reverse it */
  const mapping = { };
  for (const r of set) { mapping[r] = expand(r); }

  Object.keys(mapping).forEach(k => {
    const value = mapping[k];
    for (const v of value) {
      _implies[v] = _implies[v] || [];
      _implies[v].push(k);
    }
  });
  _.mapValues(_implies, _.uniq);

}


/*!
 * Resolves a set of roles into all implied roles.
 */
export function resolve(...roles) {
  return roles
    .map(r => _implies[r] || [])
    .flatten()
    .uniq()
    .value();
}


/*!
 * Adds a role.
 */
export function define(name, callback) {
  if (_callbacks.has(name)) {
    throw new Error(`Cannot redefine role '${name}'`);
  }

  if (/\./.test(name)) {
    const scope = name.split('.', 2)[0];
    if (!scopes.has(scope)) {
      throw new Error(`Scope '${scope}' is not defined.`);
    }
  }

  _callbacks.set(name, callback);
}
