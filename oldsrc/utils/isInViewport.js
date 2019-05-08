export default function isInViewport(elem) {
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
