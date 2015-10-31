/**
 * util/collate.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license AGPL v3
 */

import split       from './split';

/*!
 * Organizes role names into a tree for efficient scoping.
 *
 * @param  {object} manager  FaceControl permission manager.
 * @param  {array}  actions  The set of roles that can access a resource.
 * @return {object}          Collated role tree.
 */
export default function collate(manager, actions) {

  /* Expand actions into the full role set */
  const roles = new Set();
  for (const action of actions) {
    const deps = manager.actions[action];
    if (!deps) { throw new Error(`Action '${action}' is not defined.`); }
    deps.forEach(roles.add, roles);
  }

  /* Collate roles into a scoped tree */
  const collated = { };
  for (const role of roles) {
    const meta = split(role);

    collated[meta.scope] = collated[meta.scope] || [ ];
    collated[meta.scope].push(meta.role);
  }

  /* Return the finished role tree */
  return collated;

}
