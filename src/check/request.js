/**
 * check/request.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

import Bluebird    from 'bluebird';

import checkScope  from './scope';


export default async function request(manager, tree, req) {

  /* Always run the @@global scope first */
  if (tree['@@global']) {
    for (const key of tree['@@global']) {
      const callback = manager.roles[key];
      const result = await Bluebird.resolve(callback(null, key, req));
      if (result) { return true; }
    }
  }

  /* Run other scopes (order is not defined) */
  for (const scope of Object.keys(tree)) {
    if (scope === '@@global') { continue; }

    /* Establish the scope in question */
    const entity = await checkScope(manager, req, scope);

    /* Run all specified roles */
    for (const key of tree[scope]) {
      const callback = manager.roles[key];
      const result = await Bluebird.resolve(callback(entity, `${scope}.${key}`, req));
      if (result) { return true; }
    }
  }

  /* Nothing matched at this point, give up */
  return false;

}
