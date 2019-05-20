import qsm from 'query-string-manipulator'

const HAL_OPTIONS_START_TOKEN = '{?'

function getLinkOptions (link) {
  const optionsStart = link.indexOf(HAL_OPTIONS_START_TOKEN)
  if (optionsStart !== -1) {
    const strippedLink = link.substr(0, optionsStart)
    const optionsStr = link.substr(optionsStart + HAL_OPTIONS_START_TOKEN.length).split('}')[0]
    return {
      url: strippedLink,
      options: optionsStr.split(',')
    }
  }
  return { url: link, options: [] }
}

function translateDestructuredLink (url, options, params) {
  return params
    ? qsm(url, {
      set: options
        .filter(option => option in params)
        .reduce((aggr, option) => ({
          ...aggr,
          [option]: params[option]
        }), {})
    })
    : url
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

export function resolve (object, linkName, params) {
  if (!linkName) {
    throw new Error('No link name was passed to hal link resolver')
  }
  if (object) {
    const links = object._links || object.links || object
    if (links instanceof Array) {
      const link = links.find(item => item.rel === linkName)
      if (link) {
        return link.href ? link.href : null
      }
      return null
    }
    if (links[linkName]) {
      if (typeof links[linkName] === 'string') {
        return links[linkName]
      } else if (links[linkName] instanceof Array) {
        if (links[linkName].length > 0) {
          return translateArrayIntoLink(links[linkName], params)
        }
      } else if (links[linkName] instanceof Object) {
        return translateLink(links[linkName], params)
      }
    }
  }
  return null
}

export default resolve
