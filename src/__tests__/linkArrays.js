import getHalLink from '..'

describe('HAL link resolver with array of links', () => {
  it('returns URL without params for single link', () => {
    const links = [
      {
        href: 'http://example.com/api/users/bar',
        rel: 'edit'
      },
      {
        href: 'http://example.com/api/users/foo',
        rel: 'delete'
      }
    ]
    expect(getHalLink(links, 'edit')).toBe('http://example.com/api/users/bar')
  })

  it('returns URL without params for single link', () => {
    const user = {
      links: [
        {
          href: 'http://example.com/api/users/bar',
          rel: 'edit'
        },
        {
          href: 'http://example.com/api/users/foo',
          rel: 'delete'
        }
      ]
    }
    expect(getHalLink(user, 'edit')).toBe('http://example.com/api/users/bar')
  })

  it('returns null for missing link', () => {
    const links = [
      {
        href: 'http://example.com/api/users',
        rel: 'edit'
      },
      {
        href: 'http://example.com/api/users',
        rel: 'delete'
      }
    ]
    expect(getHalLink(links, 'foo')).toBe(null)
  })

  it('returns null for empty array', () => {
    const links = []
    expect(getHalLink(links, 'foo')).toBe(null)
  })

  it('returns null for missing href attribute', () => {
    const links = [
      {
        rel: 'edit'
      },
      {
        href: 'http://example.com/api/users',
        rel: 'delete'
      }
    ]
    expect(getHalLink(links, 'edit')).toBe(null)
  })
})
