import getHalLink from '..'

describe('HAL link resolver with array of same-rel links', () => {
  const links = {
    enemies: [
      {
        href: 'http://example.com/api/users{?page,size}',
        templated: true,
      },
      {
        href: 'http://example.com/api/users/{id}',
        templated: true,
      },
    ],
  }

  it('returns collection URL without params', () => {
    expect(getHalLink(links, 'enemies')).toBe('http://example.com/api/users')
  })

  it('returns collection URL with params', () => {
    expect(
      getHalLink(links, 'enemies', {
        page: 10,
        size: 20,
      })
    ).toBe('http://example.com/api/users?page=10&size=20')
  })

  it('returns entity URL', () => {
    expect(
      getHalLink(links, 'enemies', {
        id: 42,
      })
    ).toBe('http://example.com/api/users/42')
  })

  it('prefers path params over query params', () => {
    expect(
      getHalLink(links, 'enemies', {
        id: 42,
        page: 10,
        size: 20,
      })
    ).toBe('http://example.com/api/users/42')
  })
})
