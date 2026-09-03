const {
  MAX_SUPPLY, totalSupply, realMetadata, placeholderMetadata, sendJson
} = require("../lib/reveal");

module.exports = async function handler(req, res) {
  const raw = Array.isArray(req.query.tokenId) ? req.query.tokenId[0] : req.query.tokenId;
  const tokenId = Number(raw);

  if (!Number.isInteger(tokenId) || tokenId < 1 || tokenId > MAX_SUPPLY) {
    return sendJson(res, 404, { error: "Token not found" }, "invalid-token", "no-store");
  }

  try {
    const supply = await totalSupply();
    if (tokenId <= supply) {
      return sendJson(
        res, 200, realMetadata(tokenId, req), "minted",
        "public, max-age=300, s-maxage=86400, immutable"
      );
    }
    // Fail safe against placeholder caching: never cache unminted metadata.
    return sendJson(
      res, 200, placeholderMetadata(tokenId, req), "unminted", "no-store"
    );
  } catch (err) {
    console.error("RPC read failed:", err);
    // Fail closed: never reveal when chain state cannot be confirmed.
    return sendJson(
      res, 200, placeholderMetadata(tokenId, req), "rpc-unavailable", "no-store"
    );
  }
};
