/**
 * check/request.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license AGPL v3
 */

import Bluebird    from 'bluebird';

import { $$cache } from './scope';
import checkScope  from './scope';


/* Utility function to wrap functions into Bluebird.try */
function wrap(fn, ...args) {
  return Bluebird.try(() => fn(...args));
}


export async function request(manager, tree, req) {

  /* Always run the @@global scope first */
  if (tree['@@global']) {
    for (const key of tree['@@global']) {
      const callback = manager.roles[key];
      const result = await wrap(callback, null, key, req);
      if (result) { return true; }
    }
  }

  /* Run other scopes (order is not defined) */
  for (const scope of Object.keys(tree)) {
    if (scope === '@@global') { continue; }

    /* Establish the scope in question */
    checkScope(manager, req, scope);

    /* Run all specified roles */
    for (const key of tree[scope]) {
      const callback = manager.roles[key];
      const entity = req[$$cache][key];
      const result = await wrap(callback, entity, `${scope}.${key}`, req);
      if (result) { return true; }
    }
  }

  /* Nothing matched at this point, give up */
  return false;

}
