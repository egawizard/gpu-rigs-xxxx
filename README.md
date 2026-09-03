# GPU Mining Rigs — Instant Reveal Server

Preconfigured for:

- Robinhood Chain mainnet
- Chain ID: 4663
- Contract: 0xc9c09d9533e12ae769e2e6d86118f735c3a1ed70
- Max supply: 6000
- Reveal mode: on-mint / instant reveal
- Token IDs: 1–6000
- Mapping SHA-256: b8db7851b5033cd1a59378af3ba4a5951a348abbd809f5a7602526074e56f684

## What it does

The contract baseURI should point to:

    https://YOUR-PROJECT.vercel.app/api/

The trailing slash is REQUIRED.

When OpenSea requests tokenURI for token 123, the contract returns:

    https://YOUR-PROJECT.vercel.app/api/123

The server checks the live ERC-721 totalSupply() on Robinhood Chain.

- If token 123 has minted, it returns the real image + traits.
- If token 123 has not minted, it returns the placeholder.
- If RPC is unavailable, it FAILS CLOSED and returns the placeholder.

The server caches totalSupply for only 5 seconds, so normal reveal is about 0–5 seconds
after the chain state is visible to the RPC.

## Vercel deployment

1. Keep this project PRIVATE. Do not publish `data/items.json` in a public repo
   before the drop, because it contains the hidden token → rarity mapping.
2. Deploy this folder to Vercel.
3. In Vercel Environment Variables set:
       RPC_URL=https://rpc.mainnet.chain.robinhood.com
   The code also has this official public RPC as a fallback.
4. Open:
       https://YOUR-PROJECT.vercel.app/api/health
   It should say:
       ok
5. Open:
       https://YOUR-PROJECT.vercel.app/api/status
   It should return your contract and live totalSupply.

## Set the NFT contract Base URI

Using the owner wallet, call:

    setBaseURI("https://YOUR-PROJECT.vercel.app/api/")

IMPORTANT: include the final `/`.

You can call setBaseURI through Robinhood Chain Blockscout's Write Contract page
for the NFT contract, while connected with the owner wallet.

## Test before public mint

After setting baseURI:

- For an already minted token ID, /api/<id> must return header:
      x-reveal-state: minted
- For an unminted token ID, it must return:
      x-reveal-state: unminted

Check `/api/status` again after setting baseURI.

## After the 6,000 mint finishes

For long-term permanence, export the final 6,000 JSON metadata and images to IPFS,
then setBaseURI again to the final:

    ipfs://YOUR_FINAL_METADATA_CID/

Do not shut down this Vercel server until the final IPFS baseURI is confirmed onchain
and OpenSea is displaying the collection correctly.

## Rarity distribution

Common      2,700
Uncommon    1,500
Rare          900
Epic          600
Legendary     300

The token mapping is the exact shuffled mapping used in the OpenSea CSV package.
