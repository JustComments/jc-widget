const regExp = /^((.*?){(.|\n)*?}$)/gm;
const classPrefix = 'jcGenCls';
const class2Prefix = 'jcGen2Cls';
const clsCache = {};

const classNo = (() => {
  let n = 0;
  return () => {
    return ++n;
  };
})();

let latestCss = '';
let oldCss = 'default';

function compileCss(css, classNames) {
  const parts = css.trim().match(regExp);
  if (!parts) {
    throw new Error(`${css} does not match regexp`);
  }
  return parts
    .map((p) => p.trim())
    .map((p) => {
      const specifier = classNames.map((c) => `.${c}`).join('');
      return p.startsWith(':') ? `${specifier}${p}` : `${specifier} ${p}`;
    })
    .join('\n');
}

// class
export function c(css, staticCss) {
  if (clsCache[css]) {
    return clsCache[css].join(' ');
  }
  const no = classNo();
  const classNames = [`${classPrefix}${no}`, `${class2Prefix}${no}`];
  const compiled = compileCss(css, classNames);
  const completeCss = compiled + (staticCss ? staticCss : '');
  latestCss += completeCss;
  clsCache[css] = classNames;
  return classNames.join(' ');
}

// class with media queries
export function m(css, queries) {
  if (clsCache[css]) {
    return clsCache[css].join(' ');
  }
  const classNames = [
    `${classPrefix}${classNo()}`,
    `${class2Prefix}${classNo()}`,
  ];
  const completeCss = [
    compileCss(css, classNames),
    ...queries.map((q) => {
      return `${q.media}{${compileCss(q.css, classNames)}}`;
    }),
  ].join('\n');
  latestCss += completeCss;
  clsCache[css] = classNames;
  return classNames.join(' ');
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
  if (oldCss === latestCss) {
    return;
  }
  const el = getStyleTag();
  const oldNode = el.childNodes[0];
  const newNode = document.createTextNode(latestCss);
  if (oldNode) {
    el.replaceChild(newNode, oldNode);
  } else {
    el.appendChild(newNode);
  }
  oldCss = latestCss;
}
