module.exports = function handler(req, res) {
  res.statusCode = 200;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "public, max-age=300");
  res.end(JSON.stringify({
    contract: "0xc9c09d9533e12ae769e2e6d86118f735c3a1ed70",
    chainId: 4663,
    maxSupply: 6000,
    tokenMappingSha256: "b8db7851b5033cd1a59378af3ba4a5951a348abbd809f5a7602526074e56f684"
  }));
};
