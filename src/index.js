import qsm from 'query-string-manipulator'

const HAL_EXPANSION_TOKEN = '{?'
const HAL_CONTINUATION_TOKEN = '{&'
const tokens = [HAL_EXPANSION_TOKEN, HAL_CONTINUATION_TOKEN]

function getOptionsToken (link) {
  for (const token of tokens) {
    const index = link.indexOf(token)
    if (index !== -1) {
      return [token, index]
    }
  }
  return [null, 0]
}

function getLinkOptions (link) {
  const [token, tokenIndex] = getOptionsToken(link)
  if (token) {
    const strippedLink = link.substr(0, tokenIndex)
    const optionsStr = link.substr(tokenIndex + token.length).split('}')[0]
    return {
      url: strippedLink,
      options: optionsStr.split(',')
    }
  }
  return { url: link, options: [] }
}

function translateDestructuredLink (url, options, params) {
  if (params) {
    return qsm(url, {
      set: options
        .filter(option => option in params)
        .reduce((aggr, option) => ({
          ...aggr,
          [option]: params[option]
        }), {})
    })
  }
  return url
}

function translateTemplatedLink (link, params) {
  const { url, options } = getLinkOptions(link.href)
  return params
    ? translateDestructuredLink(url, options, params)
    : url
}

function translateLink (link, params) {
  if (!link.href) {
    return null
  }
  if (link.templated) {
    return translateTemplatedLink(link, params)
  }
  return link.href
}

function getMatchQuotient (options, params) {
  return params
    ? options.filter(option => option in params).length
    : 0
}

function findBestTemplatedLinkForParams (linkList, params) {
  return linkList
    .map(mapLink => mapLink.href)
    .filter(mapLink => mapLink)
    .map(getLinkOptions)
    .reduce((bestLink, currentLink) => {
      const linkDescriptor = {
        ...currentLink,
        matchQuotient: getMatchQuotient(currentLink.options, params)
      }
      if (!bestLink || linkDescriptor.matchQuotient > bestLink.matchQuotient) {
        return linkDescriptor
      }
      return bestLink
    }, null)
}

function translateArrayIntoLink (linkList, params) {
  if (!params) {
    const link = linkList.find(linkCheck => !linkCheck.templated)
    if (link) {
      return translateLink(link, params)
    }
  }
  const link = findBestTemplatedLinkForParams(linkList, params)
  return link
    ? translateDestructuredLink(link.url, link.options, params)
    : null
}

function resolveLinksArray (links, linkName) {
  const link = links.find(item => item.rel === linkName)
  return (link && link.href) || null
}

function resolveNamedLink (link, params) {
  if (typeof link === 'string') {
    return link
  } else if (link instanceof Array) {
    if (link.length > 0) {
      return translateArrayIntoLink(link, params)
    }
  } else if (link instanceof Object) {
    return translateLink(link, params)
  }
  return null
}

function resolveLinksObject (object, linkName, params) {
  const links = object._links || object.links || object
  if (links instanceof Array) {
    return resolveLinksArray(links, linkName)
  }
  if (links[linkName]) {
    return resolveNamedLink(links[linkName], params)
  }
  return null
}

export function resolve (object, linkName, params) {
  if (!linkName) {
    throw new Error('No link name was passed to hal link resolver')
  }
  return object
    ? resolveLinksObject(object, linkName, params)
    : null
}

export default resolve
