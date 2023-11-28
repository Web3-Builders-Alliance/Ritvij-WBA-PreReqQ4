import wallet from "../wba-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createBundlrUploader } from "@metaplex-foundation/umi-uploader-bundlr";
import base58 from "bs58";

// Create a devnet connection
const umi = createUmi("https://api.devnet.solana.com");
const bundlrUploader = createBundlrUploader(umi);

const bs = base58.decode(wallet);
let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(bs));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

(async () => {
  try {
    // Follow this JSON structure
    // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure
    const image =
      "https://arweave.net/vY7qyQ8CD3tZi2GjhNeIJ9M9jZ0eB-9ioXpR4WTUN2k";
    const metadata = {
      name: "RUG-CHAD",
      symbol: "RUG",
      description: "A very rare RUG",
      image: image,
      attributes: [{ trait_type: "?", value: "?" }],
      properties: {
        files: [
          {
            type: "image/png",
            uri: image,
          },
        ],
      },
      creators: [],
    };
    const myUri = await bundlrUploader.uploadJson(metadata);
    console.log("Your image URI: ", myUri);
    // Your image URI:  https://arweave.net/KJPlq6wuTyjVhOjKSINmjjKpz4FwXRfJVPKhfHQH-Q8
  } catch (error) {
    console.log("Oops.. Something went wrong", error);
  }
})();
