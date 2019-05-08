// item id is based on URL
// protocol does not matter
// port does not matter
// query params matter
// path matters

// rewrite
// / -> ''

function rewritePath(path) {
  if (path.trim() === '') {
    return '';
  }
  if (path === '/') {
    return '';
  }
  return path;
}

function removeCommonParams(urlPart) {
  urlPart = removeURLParameter(urlPart, 'ref');
  urlPart = removeURLParameter(urlPart, 'utm_source');
  urlPart = removeURLParameter(urlPart, 'utm_medium');
  urlPart = removeURLParameter(urlPart, 'utm_campaign');
  urlPart = removeURLParameter(urlPart, 'utm_term');
  urlPart = removeURLParameter(urlPart, 'utm_content');
  return urlPart;
}

function removeURLParameter(url, parameter) {
  //prefer to use l.search if you have a location/link object
  var urlparts = url.split('?');
  if (urlparts.length >= 2) {
    var prefix = encodeURIComponent(parameter) + '=';
    var pars = urlparts[1].split(/[&;]/g);

    //reverse iteration as may be destructive
    for (var i = pars.length; i-- > 0; ) {
      //idiom for string.startsWith
      if (pars[i].lastIndexOf(prefix, 0) !== -1) {
        pars.splice(i, 1);
      }
    }

    url = urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : '');
    return url;
  } else {
    return url;
  }
}

function getJumpToComment() {
  const hash = window.location.hash;
  const hasHashSign = hash.trim() !== '';
  if (hasHashSign) {
    const isCommentPointer = hash.startsWith('#jc');
    if (isCommentPointer) {
      return hash.substring(3);
    }
  }
  return null;
}

export default function extractDataFromURL(ignoreQuery) {
  const href = window.location.href;
  const pathname = window.location.pathname;
  const hostname = window.location.hostname;
  const search = window.location.search;
  const itemPort = window.location.port;
  const itemProtocol = window.location.protocol;
  const rewrittenPath = rewritePath(pathname);
  const itemId = `${hostname}${rewrittenPath}${
    ignoreQuery ? '' : removeCommonParams(search)
  }`;
  const jumpToComment = getJumpToComment();

  return {
    itemId,
    itemProtocol,
    itemPort,
    jumpToComment,
  };
}
