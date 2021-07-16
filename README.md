# hateoas-hal-link-resolver

[![Continuous integration status](https://github.com/just-paja/hateoas-hal-link-resolver/actions/workflows/integration.yml/badge.svg)](https://github.com/just-paja/hateoas-hal-link-resolver/actions/workflows/integration.yml)
[![Maintainability](https://api.codeclimate.com/v1/badges/39a91265618bf728f48d/maintainability)](https://codeclimate.com/github/just-paja/hateoas-hal-link-resolver/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/39a91265618bf728f48d/test_coverage)](https://codeclimate.com/github/just-paja/hateoas-hal-link-resolver/test_coverage)

Translate HATEOAS HAL links into URLs that can be used by your application trough one method. Handles missing links and translation of templated link options into query string parameters.

It supports following expansions of the [URI template spec](https://datatracker.ietf.org/doc/html/rfc6570#section-3.2.2):
* `{}`
* `{#}`
* `{.}`
* `{/}`
* `{;}`
* `{?}`
* `{&}`

Valid arguments for expansion are single string or arrays of strings. 
When providing an array in combination with an operator, this variable will be exploded by default with the separator associated with the operator i.e.:

```
const links = {
  _links: {
    example: {
      href: 'https://local{/api}{?param}'
    }
  }
}

resolve(links, 'example', {
  api: ['path', 'subpath'],
  param: ['p1', 'p2'],
}) >> 'https://local/path/subpath?param=p1&param=p2'
```

## Install

```shell
npm install hateoas-hal-link-resolver
```

## Usage

Resolver is written for EcmaScript modules, so after installing you are one step from using it.

```javascript
import resolve from 'hateoas-hal-link-resolver';
```

This defined user object will be a base for all of our examples.

```javascript
const user = {
  name: 'The Doctor',
  _links: {
    self: 'https://example.com/characters/1',
    companions: {
      href: 'https://example.com/characters/1/companions{?page,size}',
      templated: true,
    },
    enemies: [
      {
        href: 'https://example.com/characters/1/enemies{?race,page,size}',
        templated: true,
      },
      {
        href: 'https://example.com/characters/1/enemies{?nameSearch,page,size}',
        templated: true,
      },
      {
        href: 'https://example.com/characters/1/enemies?noParams',
        templated: false,
      },
    ],
  },
};
```

### Getting simple string link

```javascript
resolve(user._links, 'self');
// https://example.com/characters/1
```

### Getting templated link

When you pass no parameters, the link template will be simply stripped of options. Based on [top example](#usage).

```javascript
resolve(user._links, 'companions');
// https://example.com/characters/1/companions
```

When you pass parameters, they will be translated into the link template options. Based on [top example](#usage).

```javascript
resolve(user._links, 'companions', {
  page: 3,
  size: 5,
});
// https://example.com/characters/1/companions?page=3&size=5
```

#### Missing some parameters?

Beware, all parameters that have no matching link option will get lost. Based on [top example](#usage).

```javascript
resolve(user._links, 'companions', {
  page: 3,
  filter: 'Bad Wolf',
});
// https://example.com/characters/1/companions?page=3
```

### Getting link from array of links

The resolver will choose the best link for you based on the list of parameters you provide. If you provide none, then the non-templated links are preferred. Based on [top example](#usage).

```javascript
resolve(user._links, 'enemies');
// Returns the non-templated link
// https://example.com/characters/1/enemies?noParams
```

```javascript
resolve(user._links, 'enemies', {
  race: 'timelord',
});
// https://example.com/characters/1/enemies?race=timelord
```

#### Conflicting values

It may happen that you provide parameters that are mutually exclusive by the links definition. In that case, resolver will give you the first link specified. In the [top example](#usage), we cannot search by name and race at the same time.

```javascript
resolve(user._links, 'enemies', {
  race: 'timelord',
  nameSearch: 'The Master',
  page: 10,
  size: 5,
});
// https://example.com/characters/1/enemies?race=timelord&page=10&size=5
```

### Object shortcut

If your API uses `_links` or `links` to provide HAL links, you can simply pass the object to get branch shortcut.

```javascript
resolve(user, 'self');
// https://example.com/characters/1
```
