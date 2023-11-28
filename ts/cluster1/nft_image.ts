import wallet from "../wba-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createBundlrUploader } from "@metaplex-foundation/umi-uploader-bundlr";
import base58 from "bs58";
import { readFile } from "fs/promises";

// Create a devnet connection
const umi = createUmi("https://api.devnet.solana.com");
const bundlrUploader = createBundlrUploader(umi);

const bs = base58.decode(wallet);
let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(bs));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

(async () => {
  try {
    const file = await readFile("cluster1/images/generug.png");
    const image = createGenericFile(file, "Generug", {
      contentType: "image/png",
    });

    const [myUri] = await bundlrUploader.upload([image]);
    console.log("Your image URI: ", myUri);
    // Your image URI:  https://arweave.net/vY7qyQ8CD3tZi2GjhNeIJ9M9jZ0eB-9ioXpR4WTUN2k
  } catch (error) {
    console.log("Oops.. Something went wrong", error);
  }
})();
