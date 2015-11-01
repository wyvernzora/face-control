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

  /* Always run the @@global scope first */
  if (tree['@@global']) {
    for (const key of tree['@@global']) {
      const callback = manager.roles[key];
      const info = { scope: null, role: key };
      const result = await Bluebird.resolve(callback(null, info, req));
      if (result) {
        debug(Chalk.bold.green('allow') + ` @@global:${key}`);
        return true;
      }
      debug(Chalk.bold.red('deny') + ` @@global:${key}`);
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
      const info = { scope: scope, role: key };
      const result = await Bluebird.resolve(callback(entity, info, req));
      if (result) {
        debug(Chalk.bold.green('allow') + ` ${scope}:${key}`);
        return true;
      }
      debug(Chalk.bold.red('deny') + ` ${scope}:${key}`);
    }
  }

  /* Nothing matched at this point, give up */
  return false;

}
