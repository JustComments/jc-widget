import isBot from './utils/isBot';
import extractDataFromURL from './utils/extractDataFromURL';
import isInViewport from './utils/isInViewport';
import handleBootstrapParams from './utils/handleBootstrapParams';
import { mapping, bundles } from './locales';
import { onReady } from './utils/onReady';
import { findWidgetElement } from './utils/findWidgetElement';
import { scrollIntoView, onceVisible } from './utils/scroll';

handleBootstrapParams();

let { jumpToComment } = extractDataFromURL();

let loaded = false;
function loadCoreOnce(bundleLocale) {
  if (!loaded) {
    loaded = true;
    var s = document.createElement('script');
    s.setAttribute('src', CORE_URL.replace('.js', `.${bundleLocale}.js`));
    document.body.appendChild(s);
  }
}

function forceWidgetSize(widget) {
  widget.setAttribute('style', 'min-height: 1px; min-width: 1px;');
}

function bootstrap() {
  const widget = findWidgetElement();
  if (!widget) {
    console.log('JustComments warning: widget is not loading.');
    return;
  }

  forceWidgetSize(widget);
  if (jumpToComment) {
    scrollIntoView(widget);
  }

  const locale = widget.dataset.locale || 'en';
  const disableseo = widget.dataset.disableseo === 'true';
  const loadImmediately = isBot();
  const lang = locale.split('_').shift();
  const bundleLocale = mapping[locale] || mapping[lang] || 'en';

  if (loadImmediately === true) {
    // LOAD core.js
    loadCoreOnce(bundleLocale);
  } else {
    onceVisible(widget, () => {
      loadCoreOnce(bundleLocale);
    });
  }
}

onReady(() => {
  bootstrap();
});
