export function sortByStrAttr(arr, strAttr) {
  const copy = [...arr];
  return copy.sort((a, b) => {
    return a[strAttr].localeCompare(b[strAttr]);
  });
}

export function revSortByStrAttr(arr, strAttr) {
  const copy = [...arr];
  return copy.sort((b, a) => {
    return a[strAttr].localeCompare(b[strAttr]);
  });
}

export function sortByNumAttr(arr, numAttr) {
  const copy = [...arr];
  return copy.sort((a, b) => {
    return a[numAttr] - b[numAttr];
  });
}

export function keyBy(arr, attr) {
  return arr.reduce((res, o) => {
    res[o[attr]] = o;
    return res;
  }, {});
}
