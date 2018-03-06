import getHalLink from '..';

describe('HAL link resolver with nested arrays of links', () => {
  it('returns URL without params for single non templated link no params are passed', () => {
    const links = {
      groups: [
        {
          href: 'http://example.com/api/users',
          templated: false,
        },
      ],
    };
    expect(getHalLink(links, 'groups')).toBe('http://example.com/api/users');
  });

  it('returns URL without params for single non templated link and params are passed', () => {
    const links = {
      groups: [
        {
          href: 'http://example.com/api/users',
          templated: false,
        },
      ],
    };
    expect(getHalLink(links, 'groups', {
      page: 201,
      size: 13,
      projection: 'users',
      filter: 'testFilter',
      name: 'John',
    })).toBe('http://example.com/api/users');
  });

  it('returns URL with translated params for single templated link', () => {
    const links = {
      groups: [
        {
          href: 'http://example.com/api/users{?projection,page,size}',
          templated: true,
        },
      ],
    };
    expect(getHalLink(links, 'groups', {
      page: 201,
      size: 13,
      projection: 'users',
    })).toBe('http://example.com/api/users?projection=users&page=201&size=13');
  });

  it('returns non templated URL when given templated and non templated link without params', () => {
    const links = {
      groups: [
        {
          href: 'http://example.com/api/users/foo{?projection,page,size}',
          templated: true,
        },
        {
          href: 'http://example.com/api/users',
          templated: false,
        },
      ],
    };
    expect(getHalLink(links, 'groups')).toBe('http://example.com/api/users');
  });

  it('returns URL when given only templated link without params', () => {
    const links = {
      groups: [
        {
          href: 'http://example.com/api/users/foo{?projection,page,size}',
          templated: true,
        },
      ],
    };
    expect(getHalLink(links, 'groups')).toBe('http://example.com/api/users/foo');
  });

  it('returns first URL when given mutiple templated links without params', () => {
    const links = {
      groups: [
        {
          href: 'http://example.com/api/users/foo{?projection}',
          templated: true,
        },
        {
          href: 'http://example.com/api/users/bar{?page,size}',
          templated: true,
        },
      ],
    };
    expect(getHalLink(links, 'groups')).toBe('http://example.com/api/users/foo');
  });

  it('returns URL with options matching params when given mutiple templated links with single param', () => {
    const links = {
      groups: [
        {
          href: 'http://example.com/api/users/foo{?projection}',
          templated: true,
        },
        {
          href: 'http://example.com/api/users/bar{?page,size}',
          templated: true,
        },
      ],
    };
    expect(getHalLink(links, 'groups', {
      page: 10,
    })).toBe('http://example.com/api/users/bar?page=10');
  });

  it('returns URL with options matching params when given mutiple templated links with two params', () => {
    const links = {
      groups: [
        {
          href: 'http://example.com/api/users/foo{?projection}',
          templated: true,
        },
        {
          href: 'http://example.com/api/users/bar{?page,size}',
          templated: true,
        },
      ],
    };
    expect(getHalLink(links, 'groups', {
      page: 10,
      size: 5,
    })).toBe('http://example.com/api/users/bar?page=10&size=5');
  });

  it('returns URL with options matching params when given mutiple templated links with one matching and one non-matching param', () => {
    const links = {
      groups: [
        {
          href: 'http://example.com/api/users/foo{?projection}',
          templated: true,
        },
        {
          href: 'http://example.com/api/users/bar{?page,size}',
          templated: true,
        },
      ],
    };
    expect(getHalLink(links, 'groups', {
      page: 10,
      group: 'users',
    })).toBe('http://example.com/api/users/bar?page=10');
  });

  it('returns URL with most options matching params when given mutiple templated links with multiple params', () => {
    const links = {
      groups: [
        {
          href: 'http://example.com/api/users/foo{?projection}',
          templated: true,
        },
        {
          href: 'http://example.com/api/users/bar{?projection,page}',
          templated: true,
        },
        {
          href: 'http://example.com/api/users/xyz{?projection,page,size}',
          templated: true,
        },
      ],
    };
    expect(getHalLink(links, 'groups', {
      page: 10,
      size: 5,
      group: 'users',
      projection: 'groups',
    })).toBe('http://example.com/api/users/xyz?projection=groups&page=10&size=5');
  });
});
