/**
 * util/expand.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */


/**
 * Expands a role to all roles that imply it.
 *
 * @param  {object} manager FaceControl permission manager.
 * @param  {string} name    Role name to expand.
 * @return {array}          Closure of the given role.
 */
export default function expand(manager, name) {
  const meta = manager.implies[name];

  /* No implications */
  if (!meta || !meta.implies) { return [name]; }

  /* Recursively expand implications */
  const expansion = new Set([name]);
  for (const role of meta.implies) {
    expand(manager, role).forEach(expansion.add, expansion);
    expansion.add(role);
  }

  return Array.from(expansion);
}
