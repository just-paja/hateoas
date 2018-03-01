import qsm from 'query-string-manipulator';

const HAL_OPTIONS_START_TOKEN = '{?';

const getLinkOptions = (link) => {
  const optionsStart = link.indexOf(HAL_OPTIONS_START_TOKEN);
  if (optionsStart !== -1) {
    const strippedLink = link.substr(0, optionsStart);
    const optionsStr = link.substr(optionsStart + HAL_OPTIONS_START_TOKEN.length).split('}')[0];
    return {
      url: strippedLink,
      options: optionsStr.split(','),
    };
  }
  return { url: link, options: [] };
};

const translateDestructuredLink = (url, options, params) => (
  params ? qsm(url, {
    set: options
      .filter(option => option in params)
      .reduce((aggr, option) => ({
        ...aggr,
        [option]: params[option],
      }), {}),
  }) : url
);

const translateTemplatedLink = (link, params) => {
  const { url, options } = getLinkOptions(link.href);
  if (params) {
    return translateDestructuredLink(url, options, params);
  }
  return url;
};

const translateLink = (link, params) => {
  if (!link.href) {
    return null;
  }
  if (link.templated) {
    return translateTemplatedLink(link, params);
  }
  return link.href;
};

const getMatchQuotient = (options, params) => (
  params ? options.filter(option => option in params).length : 0
);

const findBestTemplatedLinkForParams = (linkList, params) => linkList
  .map(mapLink => mapLink.href)
  .filter(mapLink => mapLink)
  .map(getLinkOptions)
  .reduce((bestLink, currentLink) => {
    const linkDescriptor = {
      ...currentLink,
      matchQuotient: getMatchQuotient(currentLink.options, params),
    };
    if (!bestLink || linkDescriptor.matchQuotient > bestLink.matchQuotient) {
      return linkDescriptor;
    }
    return bestLink;
  }, null);

const translateArrayIntoLink = (linkList, params) => {
  if (!params) {
    const link = linkList.find(linkCheck => !linkCheck.templated);
    if (link) {
      return translateLink(link, params);
    }
  }
  const link = findBestTemplatedLinkForParams(linkList, params);
  return link ?
    translateDestructuredLink(link.url, link.options, params) :
    null;
};

export default (links, linkName, params) => {
  if (!linkName) {
    throw new Error('No link name was passed to hal link resolver');
  }
  if (links && links[linkName]) {
    if (typeof links[linkName] === 'string') {
      return links[linkName];
    } else if (links[linkName] instanceof Array) {
      if (links[linkName].length > 0) {
        return translateArrayIntoLink(links[linkName], params);
      }
    } else if (typeof links[linkName] === 'object') {
      return translateLink(links[linkName], params);
    }
  }
  return null;
};
