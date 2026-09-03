const items = require("../data/items.json");
const models = require("../data/models.json");

if (items.length !== 6000) throw new Error(`Expected 6000 items`);
if (models.length !== 10) throw new Error("Expected 10 models");
for (const [i, entry] of items.entries()) {
  if (!Array.isArray(entry) || entry.length !== 2) throw new Error(`Bad item ${i+1}`);
  if (!models[entry[0]]) throw new Error(`Bad model index for token ${i+1}`);
}
console.log("OK: 6000 token mappings, 10 models.");
