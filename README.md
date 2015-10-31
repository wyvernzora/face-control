# Face Control

FaceControl is an opinionated Express middleware for scoped, role-based access management.
It is heavily inspired by [authorized][1], but attempts to provide a simpler, more
optimized process of both defining and verifying permissions.

## Getting Started
```sh
$ npm install face-control --save
```

## Documentation

### `scope(name, [options,] callback)`
Scope is a domain that a role can belong to. A scope can be defined in the
following way:
```js
FaceControl.scope('organization', async function() { ... });
```
You can provide additional information about the scope via the `options` parameter:

 + `hint`: this option indicates that scope callback is used only when a URL parameter
 with the specified name exists.

 + `deps`: dependencies, i.e. scopes that have to be established before trying to
 establish current one.

Combining above information, it is possible to define scopes with complex relationships.
Using an example of github repositories:
```js

// Used when on URL like: /orgs/:orgId/repo
FaceControl.scope('organization', { hint: 'orgId' }, async function(req) {
  return model.findOrganization(req.params.orgId);
});

// Used when on URL like: /repos/:repoId
FaceControl.scope('organization', { hint: 'repoId', deps: 'repo' }, async function(req) {
  const repo = req.scope('repo');
  return model.findOrganization(repo.orgId);
});

// Finds repo scope
FaceControl.scope('repo', async function(req) {
  return model.findRepo(req.params.repoId);
});

```

Please note that the callback function should either be synchronous or return a
promise.

### `role(name, callback)`
Defines a role and associated callback function that verifies the role.
`name` parameter should not be prefixed with the scope, for example:
```js
FaceControl.role('manager', function(ent, role, req) { return req.user.isManager; });
```

If during middleware creation you specified a scoped role like `org.manager`, the
`ent` parameter will be the scope entity `org`. Otherwise, `ent` parameter will be
`null`. `role` parameter is the full scoped name of the role that is being checked.

Of course, the callback function can be async or return a promise.


### `action(name, roles)`
Defines an action and roles that can execute it. Roles in this case have to be scoped.
```js
FaceControl.action('self-destruct', ['ship:captain', 'fleet:admiral']);
```

### `imply(role, ...implied)`
States that anyone having `role` should also be implicitly granted all `implied`
roles. For example, `ship:captain` is also a `ship:crew`:
```js
FaceControl.imply('ship:captain', 'ship:crew');
```
The implications can have multiple levels:
```js
FaceControl.imply('fleet:admiral', 'ship:captain');
```
After both examples above, `fleet:admiral` will be able to access any action accessible
to `ship:captain` and `ship:crew`.

### `FaceControl(...actions)`
This function creates the Express.js middleware that checks permissions.
```js
app.use(FaceControl('self-destruct', 'open-airlock'));
```

## License
Face Control is hereby released under terms of GNU AGPL v3. It means that if you
use this library in a server-side application, you are required to license that
application under GNU AGPL v3 as well and make its source code publicly available.

The reasoning behind this license choice is to discourage our competitors from
using this library while keeping it open source. If you wish to use this library
while keeping your application proprietary, we would be happy to discuss a more
permissive license.


[1]: https://github.com/tschaub/authorized
