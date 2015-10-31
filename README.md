# Face Control

[![Circle CI][7]][8]
[![Code Climate][3]][4]
[![Test Coverage][5]][6]
[![NPM][9]][10]
[![License][11]][2]

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
[MIT][2]

[1]: https://github.com/tschaub/authorized
[2]: https://opensource.org/licenses/MIT

[3]: https://codeclimate.com/github/jluchiji/face-control/badges/gpa.svg
[4]: https://codeclimate.com/github/jluchiji/face-control
[5]: https://codeclimate.com/github/jluchiji/face-control/badges/coverage.svg
[6]: https://codeclimate.com/github/jluchiji/face-control/coverage
[7]: https://circleci.com/gh/jluchiji/face-control.svg?style=shield
[8]: https://circleci.com/gh/jluchiji/face-control
[9]: https://img.shields.io/npm/v/face-control.svg
[10]: https://www.npmjs.com/package/face-control
[11]: https://img.shields.io/npm/l/face-control.svg
