import getHalLink from '..'

describe('HAL link with single links', () => {
  it('returns directly link URL when required key is string when object has _links', () => {
    const object = {
      _links: {
        emptyKey: 'http://example.com/api/users'
      }
    }
    expect(getHalLink(object, 'emptyKey')).toBe('http://example.com/api/users')
  })

  it('returns directly link URL when required key is string', () => {
    const links = {
      emptyKey: 'http://example.com/api/users'
    }
    expect(getHalLink(links, 'emptyKey')).toBe('http://example.com/api/users')
  })

  it('returns URL when required key is object, not templated', () => {
    const links = {
      emptyKey: {
        href: 'http://example.com/api/users'
      }
    }
    expect(getHalLink(links, 'emptyKey')).toBe('http://example.com/api/users')
  })

  it('returns URL without params when templated HAL link contains single option and params are not passed', () => {
    const links = {
      emptyKey: {
        href: 'http://example.com/api/users{?projection}',
        templated: true
      }
    }
    expect(getHalLink(links, 'emptyKey')).toBe('http://example.com/api/users')
  })

  it('returns URL without params when templated HAL link contains multiple options and params are not passed', () => {
    const links = {
      emptyKey: {
        href: 'http://example.com/api/users{?projection,size,sort,projection}',
        templated: true
      }
    }
    expect(getHalLink(links, 'emptyKey')).toBe('http://example.com/api/users')
  })

  it('returns URL without params when templated HAL link contains single option and none of passed params are an option', () => {
    const links = {
      emptyKey: {
        href: 'http://example.com/api/users{?projection}',
        templated: true
      }
    }
    expect(getHalLink(links, 'emptyKey')).toBe('http://example.com/api/users')
  })

  it('returns URL without params when templated HAL link contains multiple options and none of passed params are an option', () => {
    const links = {
      emptyKey: {
        href: 'http://example.com/api/users{?projection,page,size,sort}',
        templated: true
      }
    }
    expect(getHalLink(links, 'emptyKey')).toBe('http://example.com/api/users')
  })

  it('returns URL with single translated HAL param', () => {
    const links = {
      groups: {
        href: 'http://example.com/api/users{?projection}',
        templated: true
      }
    }
    expect(getHalLink(links, 'groups', {
      projection: 'users'
    })).toBe('http://example.com/api/users?projection=users')
  })

  it('returns URL with multiple translated HAL params', () => {
    const links = {
      groups: {
        href: 'http://example.com/api/users{?projection,page,size}',
        templated: true
      }
    }
    expect(getHalLink(links, 'groups', {
      page: 201,
      size: 13,
      projection: 'users'
    })).toBe('http://example.com/api/users?projection=users&page=201&size=13')
  })

  it('returns URL with multiple translated HAL params without unused options', () => {
    const links = {
      groups: {
        href: 'http://example.com/api/users{?projection,page,size,filter,name}',
        templated: true
      }
    }
    expect(getHalLink(links, 'groups', {
      page: 201,
      size: 13,
      projection: 'users'
    })).toBe('http://example.com/api/users?projection=users&page=201&size=13')
  })

  it('returns URL with multiple translated HAL params without unused params', () => {
    const links = {
      groups: {
        href: 'http://example.com/api/users{?projection,page,size}',
        templated: true
      }
    }
    expect(getHalLink(links, 'groups', {
      page: 201,
      size: 13,
      projection: 'users',
      filter: 'testFilter',
      name: 'John'
    })).toBe('http://example.com/api/users?projection=users&page=201&size=13')
  })

  it('returns URL with single translated HAL continuation param', () => {
    const links = {
      groups: {
        href: 'http://example.com/api/users?all=true{&projection}',
        templated: true
      }
    }
    expect(getHalLink(links, 'groups', {
      projection: 'users'
    })).toBe('http://example.com/api/users?all=true&projection=users')
  })

  it('returns URL with multiple translated HAL continuation params', () => {
    const links = {
      groups: {
        href: 'http://example.com/api/users?all=true{&projection,page,size}',
        templated: true
      }
    }
    expect(getHalLink(links, 'groups', {
      page: 201,
      size: 13,
      projection: 'users'
    })).toBe('http://example.com/api/users?all=true&projection=users&page=201&size=13')
  })

  it('returns URL with multiple translated HAL continuation params without unused options', () => {
    const links = {
      groups: {
        href: 'http://example.com/api/users?all=true{&projection,page,size,filter,name}',
        templated: true
      }
    }
    expect(getHalLink(links, 'groups', {
      page: 201,
      size: 13,
      projection: 'users'
    })).toBe('http://example.com/api/users?all=true&projection=users&page=201&size=13')
  })

  it('returns URL with multiple translated HAL continuation params without unused params', () => {
    const links = {
      groups: {
        href: 'http://example.com/api/users?all=true{&projection,page,size}',
        templated: true
      }
    }
    expect(getHalLink(links, 'groups', {
      page: 201,
      size: 13,
      projection: 'users',
      filter: 'testFilter',
      name: 'John'
    })).toBe('http://example.com/api/users?all=true&projection=users&page=201&size=13')
  })
})
