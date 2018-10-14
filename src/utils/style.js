const regExp = /^((.*?){(.|\n)*?}$)/gm;
const classPrefix = 'jcGenCls';
const clsCache = {};

const classNo = (() => {
  let n = 0;
  return () => {
    return ++n;
  };
})();

let allCss = '';
let prevCss = 'default';

function compileCss(css, className) {
  const parts = css.trim().match(regExp);
  if (!parts) {
    throw new Error(`${css} does not match regexp`);
  }
  return parts
    .map((p) => p.trim())
    .map(
      (p) => (p.startsWith(':') ? `.${className}${p}` : `.${className} ${p}`),
    )
    .join('\n');
}

// class
export function c(css, staticCss) {
  if (clsCache[css]) {
    return clsCache[css];
  }
  const className = `${classPrefix}${classNo()}`;
  const compiled = compileCss(css, className);
  const completeCss = compiled + (staticCss ? staticCss : '');
  allCss += completeCss;
  clsCache[css] = className;
  return className;
}

// class with media queries
export function m(css, queries) {
  // body...
  if (clsCache[css]) {
    return clsCache[css];
  }
  const className = `${classPrefix}${classNo()}`;
  const completeCss = [
    compileCss(css, className),
    ...queries.map((q) => {
      return `${q.media}{${compileCss(q.css, className)}}`;
    }),
  ].join('\n');
  allCss += completeCss;
  clsCache[css] = className;
  return className;
}

const getStyleTag = (() => {
  let el;
  return () => {
    if (!el) {
      const css = document.createElement('style');
      css.type = 'text/css';
      document.getElementsByTagName('head')[0].appendChild(css);
      el = css;
    }
    return el;
  };
})();

export function sync() {
  const el = getStyleTag();
  if (prevCss === allCss) {
    return;
  }
  prevCss = allCss;
  if (el.styleSheet) el.styleSheet.cssText = allCss;
  // Support for IE
  else el.appendChild(document.createTextNode(allCss)); // Support for the rest
}
