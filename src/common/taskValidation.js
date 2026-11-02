function normalizeTitle(title) {
  return typeof title === 'string' ? title.trim() : '';
}

function isValidId(id) {
  return id.length <= 19 && /^\d+$/.test(id) && BigInt(id) > 0n &&
    BigInt(id) <= 9223372036854775807n;
}

function isObjectBody(body) {
  return body !== null && typeof body === 'object' && !Array.isArray(body);
}

module.exports = { isObjectBody, isValidId, normalizeTitle };
