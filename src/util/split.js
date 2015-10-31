/**
 * util/split.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

/* Regex to split roles */
const regex = /^(?:(\w+)[.:])?(\w+)$/;


export default function split(name) {
  const matches = regex.exec(name);

  /* Bad role name */
  if (!matches) {
    throw new Error(`Invalid role name: ${name}`);
  }

  /* Split! */
  return {
    scope: matches[1] || '@@global',
    role: matches[2]
  };
}
