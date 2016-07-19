/**
 * util/closure.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

import _           from 'lodash';


/**
 * Computes the implication closure of a set of roles.
 *
 * @param  {object} manager   FaceControl permission manager.
 * @param  {array}  roles     The set of roles whose closure to compute.
 * @return {array}            Implication closure of the roles.
 */
export default function closure(manager, roles) {
  return _(roles)
    .map(r => manager.implies[r] ? manager.implies[r].closure : [ r ])
    .flatten()
    .uniq()
    .value();
}
