const serializeObject = (obj, ...args) => {
  if (!obj) {
    return null
  }
  if (obj.toJson instanceof Function) {
    return obj.toJson(...args)
  }
  if (obj.toJSON instanceof Function) {
    return obj.toJSON(...args)
  }
  return obj
}

const serialize = (obj, ...args) => {
  if (Array.isArray(obj)) {
    return obj.map(item => serialize(item, ...args))
  }
  return serializeObject(obj, ...args)
}

const aggregateEntries = (aggr, [field, value]) =>
  Object.assign(aggr, {
    [field]: value,
  })

const filterLinks = links =>
  Object.entries(links)
    .filter(([, href]) => Boolean(href))
    .reduce(aggregateEntries, {})

export const linkCollection = (data, links) =>
  linkObject({ _data: serialize(data) }, links)

export const linkObject = (object, links) => {
  if (!object) {
    return null
  }
  const serializedLinks = filterLinks({
    // eslint-disable-next-line no-underscore-dangle
    ...object?._links,
    ...links,
  })
  const serializedObject = serialize(object)
  if (Object.keys(serializedLinks).length === 0) {
    return serializedObject
  }
  return {
    ...serializedObject,
    _links: serializedLinks,
  }
}
