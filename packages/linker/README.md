# `@hateoas/linker`

[![npm version](https://badge.fury.io/js/@hateoas%2/linker.svg)](https://www.npmjs.com/package/@hateoas/linker)
[![Continuous integration status](https://github.com/just-paja/hateoas/actions/workflows/integration.yml/badge.svg)](https://github.com/just-paja/hateoas/actions/workflows/integration.yml)
[![Maintainability](https://api.codeclimate.com/v1/badges/39a91265618bf728f48d/maintainability)](https://codeclimate.com/github/just-paja/hateoas/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/39a91265618bf728f48d/test_coverage)](https://codeclimate.com/github/just-paja/hateoas/test_coverage)

> Easily construct HATEOAS HAL (templated) links with zero deps

## Installation

```shell
npm install --save @hateoas/linker
```

## Example Usage

```javascript
import { link, origin, param, paramValue, segment } from '@hateoas/linker'

// consider request on /users
getUser(request, response) {
    // ...
    const selfLink = link(req, param('active')) // http://example.com/users{?active}
    // ...
}

// consider request on /users/31
getUser(request, response) {
    // ...
    const selfLink = link(req) // http://example.com/users/31
    const activateLink = link(selfLink, 'activate') // http://example.com/users/31/activate
    // ...
}
```

## API

The linker API is made to reuse outputs of `link` calls, so you can build link
on top of link. The link itself is a class and it can be turned into string by
calling `.toString()`, `.toJSON` or just using default JavaScript JSON/string
conversion.

### Trivial link

> Creates link various properties passed as arguments

```javascript
link('foo')
// "/foo"
```

### Link with origin

By passing `origin`, the linker will construct absolute URL.

```javascript
link(origin('https://example.com'), 'foo')
// "https://example.com/foo"
```

Passing `HTTPRequest` or `IncomingMessage` instance into the API will
automatically set the link origin

```javascript
link(req, 'foo')
// "http://example.com/foo"
```

### Link with parameters

By passing `param`, the linker will construct templated URL with optional query
string parameters.

```javascript
link('users', param('active'))
// { href: "/users{?active}", templated: true }
```

Multiple params can be passed

```javascript
link('users', param('active', 'funny')) 
// { href: "/users{?active,funny}", templated: true }
```

### Link with parameter values

By passing `paramValue`, the linker will construct URL with query
string parameter values.

```javascript
link('users', paramValue({ active: true })
// "/users?active=true"
```

You can combine this with other `param`s, making templated URL.

```javascript
link('users', paramValue({ active: true }), param('funny'))
// { href: "/users?active=true{&funny}", templated: true }
```

### Link with path segment

By passing `segment`, the linker will construct templated URL with variable
path segments, allowing to link to specific path by template.

```javascript
link('users', segment('userId'))
// { href: "/users/{userId}", templated: true }
```

### Bigger example

```javascript
const base = link(req, 'users')
// "http://example.com/users"
const selfLink = link(base, param('active', 'funny'))
// "http://example.com/users{?active,funny}"
const entityLink = link(base, segment('userId'))
// "http://example.com/users/{userId}"
const activateLink = link(entityLink, 'activate')
// "http://example.com/users/{userId}/activate"
```

### Inject link into entity

Use `linkObject` method, to conveniently inject links into objects.

```javascript
import { link, linkObject } from '@hateoas/linker'

const user = {
  name: 'foo',
  email: 'foo@example.com',
}

// Assume `request` is HTTPRequest instance
const self = link(request, 'users', user.name)
const activate = link(self, 'activate')

linkObject(user, { self, activate })

/*
{
  name: 'foo',
  email: 'foo@example.com',
  _links: {
    self: 'http://example.com/users/foo',
    activate: 'http://example.com/users/foo/activate',
  },
*/
})
```

### Inject link into entity collection

Use `linkCollection` method to conventiently inject links into collections.

```javascript
import { link, linkCollection } from '@hateoas/linker'

// Assume `request` is HTTPRequest instance
// Assume, there are two already linked users
const self = link(request, 'users', param('active', 'funny'))

linkCollection(users, { self })

/*
{
  name: 'foo',
  email: 'foo@example.com',
  _links: {
    self: {
      href: 'http://example.com/users{?active,funny}',
      templated: true,
    },
  },
*/
})

```
