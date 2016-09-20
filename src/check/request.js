/**
 * check/request.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

import Debug       from 'debug';
import Chalk       from 'chalk';
import Bluebird    from 'bluebird';
import checkScope  from './scope';

const debug = Debug('fc:request');

export default async function request(manager, tree, req) {

  /* Check against the priority list */
  for (const scope of manager.priority) {
    if (!tree[scope]) { continue; }

    /* Establish the scope in question */
    const entity = await checkScope(manager, req, scope);

    /* Run all specified roles */
    for (const key of tree[scope]) {

      /* Generate the scope info */
      const info = { role: key };
      if (scope === '@@global') {
        info.scope = null;
        info.qualified = key;
      } else {
        info.scope = scope;
        info.qualified = `${scope}.${key}`;
      }

      const callback = manager.roles[info.qualified];
      if (!callback) {
        throw new Error(`Role '${info.qualified}' is not defined`);
      }
      const result = await Bluebird.resolve(callback(entity, info, req));
      if (result) {
        debug(`${Chalk.bold.green('allow')} ${scope}:${key}`);
        return true;
      }
      debug(`${Chalk.bold.red('deny')} ${scope}:${key}`);
    }
  }

  /* Nothing matched at this point, give up */
  return false;

}
