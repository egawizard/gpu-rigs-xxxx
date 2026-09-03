const items = require("../data/items.json");
const models = require("../data/models.json");

const CONTRACT = "0xc9c09d9533e12ae769e2e6d86118f735c3a1ed70";
const CHAIN_ID = 4663;
const MAX_SUPPLY = 6000;
const DEFAULT_RPC_URL = "https://rpc.mainnet.chain.robinhood.com";
const COLLECTION_NAME = "RTX RIG Machine";
const MAPPING_SHA256 = "b8db7851b5033cd1a59378af3ba4a5951a348abbd809f5a7602526074e56f684";

let supplyCache = { value: null, expiresAt: 0 };

async function rpc(method, params) {
  const url = process.env.RPC_URL || DEFAULT_RPC_URL;
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params })
  });
  if (!response.ok) throw new Error(`RPC HTTP ${response.status}`);
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || "RPC error");
  return data.result;
}

async function totalSupply() {
  const now = Date.now();
  if (supplyCache.value !== null && now < supplyCache.expiresAt) return supplyCache.value;
  // ERC-721 totalSupply()
  const result = await rpc("eth_call", [
    { to: CONTRACT, data: "0x18160ddd" },
    "latest"
  ]);
  const value = Number(BigInt(result));
  if (!Number.isSafeInteger(value) || value < 0 || value > MAX_SUPPLY) {
    throw new Error(`Unexpected totalSupply: ${value}`);
  }
  supplyCache = { value, expiresAt: now + 5000 };
  return value;
}

function baseUrl(req) {
  const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

function realMetadata(tokenId, req) {
  const entry = items[tokenId - 1];
  if (!entry) return null;
  const [modelIdx, edition] = entry;
  const m = models[modelIdx];
  const origin = baseUrl(req);
  return {
    name: `${m.model} #${String(tokenId).padStart(4, "0")}`,
    description:
      `2D open-air GPU mining rig collectible featuring the ${m.model}. ` +
      `Rarity: ${m.rarity}. Part of the 6,000-piece RTX RIG Machine collection. ` +
      `Unofficial fan-made digital collectible; not affiliated with or endorsed by NVIDIA.`,
    image: `${origin}/images/${m.image}`,
    attributes: [
      { trait_type: "Model", value: m.model },
      { trait_type: "Rarity", value: m.rarity },
      { trait_type: "Architecture", value: m.architecture },
      { trait_type: "Series", value: m.series },
      { trait_type: "GPU Count", value: m.gpuCount },
      { trait_type: "Background", value: m.background },
      { trait_type: "Tier", value: m.tier },
      { trait_type: "Edition", value: edition }
    ]
  };
}

function placeholderMetadata(tokenId, req) {
  return {
    name: `GPU Mining Rig #${String(tokenId).padStart(4, "0")}`,
    description: "This RTX RIG Machine NFT reveals automatically as soon as its mint is confirmed on Robinhood Chain.",
    image: `${baseUrl(req)}/images/placeholder.jpg`,
    attributes: []
  };
}

function sendJson(res, status, body, revealState, cacheControl) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("access-control-allow-origin", "*");
  if (revealState) res.setHeader("x-reveal-state", revealState);
  res.setHeader("cache-control", cacheControl || "no-store");
  res.end(JSON.stringify(body));
}

module.exports = {
  CONTRACT, CHAIN_ID, MAX_SUPPLY, COLLECTION_NAME, MAPPING_SHA256,
  totalSupply, realMetadata, placeholderMetadata, sendJson
};
