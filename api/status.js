const {
  CONTRACT, CHAIN_ID, MAX_SUPPLY, COLLECTION_NAME, MAPPING_SHA256, totalSupply, sendJson
} = require("../lib/reveal");

module.exports = async function handler(req, res) {
  try {
    const supply = await totalSupply();
    return sendJson(res, 200, {
      ok: true,
      chainId: CHAIN_ID,
      contract: CONTRACT,
      maxSupply: MAX_SUPPLY,
      collection: COLLECTION_NAME,
      totalSupply: supply,
      revealMode: "on-mint",
      pollCacheSeconds: 5,
      mappingSha256: MAPPING_SHA256
    }, "status", "no-store");
  } catch (err) {
    return sendJson(res, 503, {
      ok: false,
      chainId: CHAIN_ID,
      contract: CONTRACT,
      maxSupply: MAX_SUPPLY,
      collection: COLLECTION_NAME,
      error: String(err && err.message ? err.message : err)
    }, "rpc-unavailable", "no-store");
  }
};
