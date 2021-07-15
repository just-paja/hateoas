import getHalLink from '..'

describe('HAL link resolver with different kind of operators', () => {
  it('String expansion', () => {
    const links = {
      edit: {
        href: 'http://example.com/api/users/{bar}/{foo}?param={param}',
        templated: true
      }
    }
    expect(getHalLink(links, 'edit',
      { bar: 'bar', foo: 'foo', param: ['multiple', 'params'] })).toBe(
      'http://example.com/api/users/bar/foo?param=multiple,params')
  })
  it('Unnamed operator expansion', () => {
    const links = {
      edit: {
        href: 'http://example.com/api/users{/bar}{/foo}',
        templated: true
      }
    }
    expect(getHalLink(links, 'edit',
      { bar: ['bar1', 'bar2'], foo: 'foo' })).toBe(
      'http://example.com/api/users/bar1/bar2/foo')
  })
  it('Multiple unnamed operator expansion', () => {
    const links = {
      edit: {
        href: 'http://example.com/api/users{/bar,foo}',
        templated: true
      }
    }
    expect(getHalLink(links, 'edit',
      { bar: ['bar1', 'bar2'], foo: 'foo' })).toBe(
      'http://example.com/api/users/bar1/bar2/foo')
  })
  it('Empty unnamed operator expansion', () => {
    const links = {
      edit: {
        href: 'http://example.com/api/users{/bar,foo}',
        templated: true
      }
    }
    expect(getHalLink(links, 'edit',
      { bar: '', foo: '' })).toBe(
      'http://example.com/api/users')
  })
  it('Named operator expansion', () => {
    const links = {
      edit: {
        href: 'http://example.com/api/users{?param}',
        templated: true
      }
    }
    expect(getHalLink(links, 'edit',
      { param: ['p1', 'p2'] })).toBe(
      'http://example.com/api/users?param=p1&param=p2')
  })
  it('Multiple named operators expansion', () => {
    const links = {
      edit: {
        href: 'http://example.com/api/users{?param,bar}',
        templated: true
      }
    }
    expect(getHalLink(links, 'edit',
      { bar: ['bar1', 'bar2'], param: 'p1' })).toBe(
      'http://example.com/api/users?param=p1&bar=bar1&bar=bar2')
  })
  it('Empty named operators expansion', () => {
    const links = {
      edit: {
        href: 'http://example.com/api/users{?param,bar}',
        templated: true
      }
    }
    expect(getHalLink(links, 'edit',
      { bar: ['', ''], param: '' })).toBe(
      'http://example.com/api/users?param=&bar=&bar=')
  })
})
