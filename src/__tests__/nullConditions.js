import getHalLink from '..'

describe('HAL link resolver in general', () => {
  it('returns null when links are is falsy', () => {
    expect(getHalLink(undefined, 'foo')).toBe(null)
  })

  it('throws error when no key was passed and links are falsy', () => {
    expect(() => {
      getHalLink(null, '')
    }).toThrow()
  })

  it('throws error when no key was passed', () => {
    expect(() => {
      getHalLink({}, '')
    }).toThrow()
  })

  it('returns null when links do not contain required key', () => {
    expect(getHalLink({}, 'missingKey')).toBe(null)
  })

  it('returns null when required key is null', () => {
    const links = { falsyKey: null }
    expect(getHalLink(links, 'falsyKey')).toBe(null)
  })

  it('returns null when required key is empty string', () => {
    const links = { falsyKey: '' }
    expect(getHalLink(links, 'falsyKey')).toBe(null)
  })

  it('returns null when required key is number', () => {
    const links = { falsyKey: 654546 }
    expect(getHalLink(links, 'falsyKey')).toBe(null)
  })

  it('returns null when required key is empty array', () => {
    const links = { emptyKey: [] }
    expect(getHalLink(links, 'emptyKey')).toBe(null)
  })

  it('returns null when required key is object without href', () => {
    const links = {
      emptyKey: {
        link: 'http://example.com/api/users'
      }
    }
    expect(getHalLink(links, 'emptyKey')).toBe(null)
  })

  it('returns null when given array of links without href', () => {
    const links = {
      groups: [
        {
          src: 'http://example.com/api/users/foo{?projection}',
          templated: true
        },
        {
          url: 'http://example.com/api/users/bar{?projection,page}',
          templated: true
        },
        {
          path: 'http://example.com/api/users/xyz{?projection,page,size}',
          templated: true
        }
      ]
    }
    expect(getHalLink(links, 'groups', {
      page: 10,
      size: 5,
      group: 'users',
      projection: 'groups'
    })).toBe(null)
  })
})
