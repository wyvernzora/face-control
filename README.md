# Face Control

[![Codeship][7]][8]
[![NPM][9]][10]
[![License][11]][2]

Face Control is an opinionated access control middleware for Express. It is
heavily inspired by [authorized][1], but also provides a more intelligent way
to perform permission checks.

# Getting Started

## Installation
Installing the module is fairly straightforward:
```sh
$ npm install face-control --save
```

## Basics
In this section, I will describe basic ideas behind Face Control by giving an
example of space fleet permission hierarchy.

### Scope
A scope is a domain that contains various roles. For instance, a spaceship captain's
`ship:captain` role is only valid on his ship, therefore `ship` is the scope and
`captain` is the role contained in that scope.

In order to minimize the number of database round-trips, Face Control gives you
an option to tie a scope to a URL parameter via a *hint*. For instance, when a
`fleet` scope is requested, and URL contains `:shipId` parameter, it will automagically
see that it can first retrieve the `ship` scope, then from `ship.fleetId` extract
the `fleet` scope.
```js
/* https://galactic-federation.net/ship/:shipId */

/* Teaches Face Control how to find the ship info */
FaceControl.scope('ship', { hint: 'shipId' }, async req => db.ships.find(req.params.shipId));

/* Teaches Face Control how to find fleet info from ship info */
FaceControl.scope('fleet', { hint: 'shipId', deps: 'ship' }, async req => {

  /* Since 'ship' is a dependency, it will be stored here */
  const ship = req.$fc_cache$.ship;

  /* Find the 'fleet' based on the ship */
  return db.fleets.find(ship.fleetId);

});

```
As you can see, `hint` tells Face Control to use the provided callback when
there is a `:shipId` specified, while `deps` tells it that it needs to retrieve
`ship` info before trying to find out what `fleet` it is from.

Of course, you can provide multiple hinted callbacks for the same scope. In that
case, Face Control will find the most appropriate callback to use.

```js
/* https://galactic-federation.net/fleet/:fleetId */

/* Teaches Face Control how to find the fleet info from :fleetId */
FaceControl.scope('fleet', { hint: 'fleetId' }, ...);
```

### Role
A role signifies a set of actions a person is allowed to perform. Roles can be
global or tied to a specific scope. It's magic, isn't it?

```js

FaceControl.role('ship:captain', function(entity, role, request) {

  /* When the role `captain` is used without scope, it makes no sense */
  if (!entity) { throw new Error('Captain must have a ship!'); }

  /* Now, we can check if the person IS a captain */
  if (!request.user.isCaptain) { return false; }

  /* Here we can check if the user is the captain of THE ship */
  if (entity.id !== request.user.shipId) { return false; }

  /* Welcome, captain! */
  return true;

});

```

### Action
Action is essentially a set of roles that are allowed to perform a certain action.
For instance, `self-destruct` action should only be executed by `ship:captain` or
`fleet:admiral`. So, here we go:
```js
FaceControl.action('self-destruct', [ 'ship:captain', 'fleet:admiral' ]);
```

### Imply
Let's say we want `fleet:admiral` to be able to do anything a `ship:captain` is
able to. Writing both roles in every action makes configuration a tangled mess.
Instead, you can just say 'let fleet admiral automatically have ship captain powers'!
```js
FaceControl.imply('fleet:admiral', [ 'ship:captain' ]);
```
After this, when defining actions you only need to specify `ship:captain`, and
the rest is handled for you.

### Middleware
So, after going through all the trouble teaching Face Control all fine details of
your permission hierarchy, putting it to use is incredibly simple:
```js
app.use(FaceControl('ship:captain', 'hangar:technician'));
```
And that's it! Face Control will do the rest.


## License
[MIT][2]

[1]: https://github.com/tschaub/authorized
[2]: https://opensource.org/licenses/MIT

[7]: https://img.shields.io/codeship/c5436a60-2fa6-0134-9fe2-0637f2a9daca.svg?maxAge=2592000
[8]: https://codeship.com/projects/163976
[9]: https://img.shields.io/npm/v/face-control.svg
[10]: https://www.npmjs.com/package/face-control
[11]: https://img.shields.io/npm/l/face-control.svg
