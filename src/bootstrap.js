import scrollparent from 'scrollparent';

export function onReady(fn) {
  if (
    document.readyState === 'complete' ||
    document.readyState === 'loaded' ||
    document.readyState === 'interactive'
  ) {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      fn();
    });
  }
}

export function findWidgetElement() {
  const widgets = document.getElementsByClassName('just-comments');
  if (widgets.length === 0) {
    console.log(
      'JustComments warning: no elements with className just-comments found.',
    );
    return;
  }
  if (widgets.length > 1) {
    console.log(
      'JustComments warning: more than one element with className just-comments found.',
    );
  }
  return widgets[0];
}

export function scrollIntoView(element) {
  try {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });
  } catch (err) {
    console.log('JustComments warning: ScrollIntoView is not supported', err);
  }
}

export function onceVisible(el, fn) {
  if (isInViewport(el)) {
    fn();
    return;
  }
  const scrollable = scrollparent(el);
  const scrollContainers = !scrollable.parentElement
    ? [window]
    : [window, scrollable];
  const handler = () => {
    if (isInViewport(el)) {
      scrollContainers.forEach((container) => {
        container.removeEventListener('scroll', handler, false);
      });
      fn();
    }
  };
  scrollContainers.forEach((container) => {
    container.addEventListener('scroll', handler, false);
  });
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
  let urlparts = url.split('?');
  if (urlparts.length >= 2) {
    let prefix = encodeURIComponent(parameter) + '=';
    let pars = urlparts[1].split(/[&;]/g);

    //reverse iteration as may be destructive
    for (let i = pars.length; i-- > 0; ) {
      //idiom for string.startsWith
      if (pars[i].lastIndexOf(prefix, 0) !== -1) {
        pars.splice(i, 1);
      }
    }

    url = urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : '');
    return url;
  }
  return url;
}

export function getPageData(useQuery) {
  const pathname = window.location.pathname;
  const hostname = window.location.hostname;
  const search = window.location.search;
  const itemPort = window.location.port;
  const itemProtocol = window.location.protocol;
  const rewrittenPath = rewritePath(pathname);
  const itemId = `${hostname}${rewrittenPath}${
    useQuery ? removeCommonParams(search) : ''
  }`;
  const jumpToComment = getJumpToComment();

  return {
    itemId,
    itemProtocol,
    itemPort,
    jumpToComment,
  };
}

export function isBot() {
  return /bot|google|baidu|bing|msn|duckduckgo|teoma|slurp|yandex/i.test(
    navigator.userAgent || '',
  );
}

export function isInViewport(elem) {
  const bounding = elem.getBoundingClientRect();
  return (
    bounding.top >= 0 &&
    bounding.left >= 0 &&
    Math.floor(bounding.bottom) <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    Math.floor(bounding.right) <=
      (window.innerWidth || document.documentElement.clientWidth)
  );
}
