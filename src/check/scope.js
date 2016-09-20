/**
 * check/scope.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

import _           from 'lodash';
import Debug       from 'debug';
import Chalk       from 'chalk';
import Bluebird    from 'bluebird';

const debug = Debug('fc:scope');


/*!
 * We don't want to accidentally overwrite anything in the request
 * object, therefore we hide the scope cache behind a symbol.
 */
export const $$cache = '$fc_cache$';


/**
 * Establishes the scope for a request.
 */
export default async function scope(manager, request, name) {
  const cache = (request[$$cache] = request[$$cache] || { });

  /* @@global scope always results in null */
  if (name === '@@global') { return null; }

  /* If we already have the scope cached, proceed */
  if (cache[name]) {
    debug(`${Chalk.bold.green('cached')} ${name}`);
    return cache[name];
  }

  /* Find the best strategy using hints */
  const strategies = manager.scopes[name];
  if (!strategies) {
    throw new Error(`Scope '${name}' is not defined.`);
  }

  /* If no hinted strategies match, use unhinted */
  const key = _.find(Object.keys(request.params), i => strategies[i]) || '@@null';

  /* If the strategy found is undefined, we got problems */
  debug(`${Chalk.bold.yellow('hint')} ${key}`);
  const strategy = strategies[key];
  if (!strategy) {
    debug(`${Chalk.bold.red('no strategy')} ${name}`);
    return null;
  }

  /* Establish all dependencies first */
  const promises = strategy.deps.map(i => scope(manager, request, i));
  await Bluebird.all(promises);

  /* Establish the target scope itself */
  debug(`${Chalk.bold.red('fetch')} ${name}`);
  const entity = await Bluebird.try(() => strategy.callback(request));

  /* Save to scope cache and return */
  return (cache[name] = entity);
}
