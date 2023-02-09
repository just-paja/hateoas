import { linkCollection, linkObject, link } from '..'

const parse = obj => JSON.parse(JSON.stringify(obj))

describe('linkObject', () => {
  it('given obj is null and links is undefined, it returns null', () => {
    expect(linkObject(null)).toBe(null)
  })

  it('given obj is null and links are passed, it returns null', () => {
    expect(
      linkObject(null, {
        self: link('users'),
      })
    ).toBe(null)
  })

  describe('given object is user', () => {
    const user = {
      name: 'foo',
      email: 'foo@example.com',
    }

    it('given links are null, it returns user without links', () => {
      expect(linkObject(user, null)).toEqual({
        name: 'foo',
        email: 'foo@example.com',
      })
    })

    it('given self link is passed, it returns user with self link', () => {
      expect(
        parse(
          linkObject(user, {
            self: link('users', 'foo'),
          })
        )
      ).toEqual({
        name: 'foo',
        email: 'foo@example.com',
        _links: {
          self: '/users/foo',
        },
      })
    })
  })

  describe('given object is user with links', () => {
    const user = {
      name: 'foo',
      email: 'foo@example.com',
      _links: {
        activate: '/users/foo/activate',
        self: null,
      },
    }

    it('given links are null, it returns user with previous links', () => {
      expect(linkObject(user, null)).toEqual({
        name: 'foo',
        email: 'foo@example.com',
        _links: {
          activate: '/users/foo/activate',
        },
      })
    })

    it('given self link is passed, it returns user with replaced self link', () => {
      expect(
        parse(
          linkObject(user, {
            self: link('users', 'foo'),
          })
        )
      ).toEqual({
        name: 'foo',
        email: 'foo@example.com',
        _links: {
          activate: '/users/foo/activate',
          self: '/users/foo',
        },
      })
    })
  })

  describe('given object has toJson method', () => {
    const user = {
      name: 'foo',
      email: 'foo@example.com',
      toJson() {
        return { name: this.name, email: this.email }
      },
    }

    it('given links are null, it returns user without links', () => {
      expect(linkObject(user, null)).toEqual({
        name: 'foo',
        email: 'foo@example.com',
      })
    })

    it('given self link is passed, it returns user with self link', () => {
      expect(
        parse(
          linkObject(user, {
            self: link('users', 'foo'),
          })
        )
      ).toEqual({
        name: 'foo',
        email: 'foo@example.com',
        _links: {
          self: '/users/foo',
        },
      })
    })
  })

  describe('given object has toJSON method', () => {
    const user = {
      name: 'foo',
      email: 'foo@example.com',
      toJSON() {
        return { name: this.name, email: this.email }
      },
    }

    it('given links are null, it returns user without links', () => {
      expect(linkObject(user, null)).toEqual({
        name: 'foo',
        email: 'foo@example.com',
      })
    })

    it('given self link is passed, it returns user with self link', () => {
      expect(
        parse(
          linkObject(user, {
            self: link('users', 'foo'),
          })
        )
      ).toEqual({
        name: 'foo',
        email: 'foo@example.com',
        _links: {
          self: '/users/foo',
        },
      })
    })
  })
})

describe('linkCollection', () => {
  const user1 = {
    name: 'foo',
    email: 'foo@example.com',
  }
  const user2 = {
    name: 'bar',
    email: 'bar@example.com',
  }
  it('maps array into linked collection', () => {
    expect(
      parse(
        linkCollection([user1, user2], {
          self: link('/users'),
        })
      )
    ).toEqual({
      _data: [user1, user2],
      _links: {
        self: '/users',
      },
    })
  })
})
