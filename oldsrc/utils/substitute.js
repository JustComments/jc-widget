export default function substitute(str, keys) {
  return str.replace('%{name}', keys.name);
}
