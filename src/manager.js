/**
 * manager.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

import _           from 'lodash';
import expand      from './util/expand';
import closure     from './util/closure';


export default class Manager {

  constructor() {
    this.scopes  = { };
    this.roles   = { };
    this.actions = { };
    this.implies = { };
  }


  /*!
   * Defines a scope.
   */
  scope(name, options, callback) {
    name = name.toLowerCase();

    /* Make options optional */
    if (typeof options === 'function') {
      callback = options;
      options  = { };
    }
    options = options || { };

    /* Initialize empty scope info */
    const meta = this.scopes[name] || { };

    /* Create the scope info object */
    const scope = { };
    scope.name = name;
    scope.hint = options.hint || '@@null';
    scope.deps = _([options.deps]).flatten().compact().value();
    scope.callback = callback;

    /* Cannot overwrite existing hint */
    if (meta[scope.hint]) {
      throw new Error(`Cannot overwrite scope '${scope.name}' with hint '${scope.hint}'`);
    }

    /* Setup the scope info */
    meta[scope.hint] = scope;
    this.scopes[name] = meta;
  }


  /*!
   * Defines a role.
   */
  role(name, callback) {
    name = name.toLowerCase();

    /* Disallow redefinition of existing roles */
    if (this.roles[name]) {
      throw new Error(`Cannot overwrite role '${name}'`);
    }

    /* Setup the role definition */
    this.roles[name] = callback;
  }


  /*!
   * Defines an action.
   */
  action(name, roles) {
    name = name.toLowerCase();

    /* Disallow redefinition of roles */
    if (this.actions[name]) {
      throw new Error(`Cannot overwrite action '${name}'`);
    }

    /* Setup the action with its implication closure */
    this.actions[name] = closure(this, roles);
  }


  /*!
   * Sets up a role implication.
   */
  imply(role, ...others) {
    others = _.flatten(others);

    for (const r of others) {
      const meta = (this.implies[r] = this.implies[r] || { });
      meta.implies = meta.implies || new Set();
      meta.implies.add(role);
    }

    /* Expand closures */
    for (const k of Object.keys(this.implies)) {
      this.implies[k].closure = expand(this, k);
    }

  }


}
