import { link, origin, param, segment } from '..'
import { IncomingMessage } from 'http'

describe('hateoas hal', () => {
  it('link returns root path given path is empty', () => {
    expect(link().toJSON()).toEqual('/')
  })

  it('link returns pure string URL with leading slash', () => {
    expect(link('users').toJSON()).toEqual('/users')
  })

  it('link returns pure string URL', () => {
    expect(link('/users').toJSON()).toEqual('/users')
  })

  it('link accepts numbers', () => {
    expect(link('/users', 99).toJSON()).toEqual('/users/99')
  })

  it('link returns URL with segments', () => {
    expect(link('users', segment('userId')).toJSON()).toEqual({
      href: '/users/{userId}',
      templated: true,
    })
  })

  it('link returns URL with segments mixed with path', () => {
    expect(link('users', segment('userId'), 'detail').toJSON()).toEqual({
      href: '/users/{userId}/detail',
      templated: true,
    })
  })

  it('link returns URL with optional query params', () => {
    expect(
      link('users', param('active'), param('page'), param('limit')).toJSON()
    ).toEqual({
      href: '/users{?active,page,limit}',
      templated: true,
    })
  })

  it('link returns URL without falsy query params', () => {
    expect(link('users', param(undefined, null, false)).toJSON()).toEqual(
      '/users'
    )
  })

  it('link returns URL with joined optional query params', () => {
    expect(link('users', param('active', 'page', 'limit')).toJSON()).toEqual({
      href: '/users{?active,page,limit}',
      templated: true,
    })
  })

  it('link returns URL with mixed segments and query params', () => {
    expect(
      link(
        'users',
        param('active'),
        segment('userId'),
        param('page', 'limit')
      ).toJSON()
    ).toEqual({
      href: '/users/{userId}{?active,page,limit}',
      templated: true,
    })
  })

  it('link returns nested link URL', () => {
    expect(
      link(
        link('users', param('active'), segment('userId')),
        param('page', 'limit')
      ).toJSON()
    ).toEqual({
      href: '/users/{userId}{?active,page,limit}',
      templated: true,
    })
  })

  it('link returns last origin', () => {
    expect(
      link(origin('http://localhost'), origin('http://localhost:8080')).toJSON()
    ).toEqual('http://localhost:8080/')
  })

  it('link parses origin from http.IncomingMessage', () => {
    const req = new IncomingMessage()
    req.protocol = 'http'
    req.get = prop => (prop === 'host' ? 'localhost:8080' : null)
    expect(link(origin(req)).toJSON()).toEqual('http://localhost:8080/')
  })

  it('link treats http.IncomingMessage as origin object', () => {
    const req = new IncomingMessage()
    req.protocol = 'http'
    req.get = prop => (prop === 'host' ? 'localhost:8080' : null)
    expect(link(req).toJSON()).toEqual('http://localhost:8080/')
  })
})
