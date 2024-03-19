/*
 * The method within this file are taken from the octokit/request package.
 * Path: node_modules/@octokit/request/dist-node/index.js
 *
 * This is due to the fact that the method is not exported from the package.
 */

function toErrorMessage(data) {
  if (typeof data === 'string') return data
  let suffix
  if ('documentation_url' in data) {
    suffix = ` - ${data.documentation_url}`
  } else {
    suffix = ''
  }
  if ('message' in data) {
    if (Array.isArray(data.errors)) {
      return `${data.message}: ${data.errors.map(JSON.stringify).join(', ')}${suffix}`
    }
    return `${data.message}${suffix}`
  }
  return `Unknown error: ${JSON.stringify(data)}`
}

module.exports = { toErrorMessage }
