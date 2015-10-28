/**
 * index.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

import * as Scope  from './scope';
import * as Action from './action';
import * as Role   from './role';
import * as Verify from './verify';


const FaceControl = Verify.factory;

/*!
 * Scope methods.
 */
FaceControl.scope = Scope.define;


/*!
 * Role methods.
 */
FaceControl.role = Role.define;
FaceControl.imply = Role.imply;


/*!
 * Action methods.
 */
FaceControl.action = Action.define;


module.exports = FaceControl;
