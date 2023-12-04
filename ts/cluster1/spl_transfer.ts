import {
  Commitment,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import wallet from "../wba-wallet.json";
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";
import base58 from "bs58";

// We're going to import our keypair from the wallet file
const bs = base58.decode(wallet);
const keypair = Keypair.fromSecretKey(new Uint8Array(bs));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("2rQKsxqdtvpxieGeqo3rs9yCyaf94yhoLA7nXW36KxA5");

// Recipient address
const to = new PublicKey("FKzt4ErLRAFUbVD5HRsFdR1vBYH6UHahxQ1fFocHVrGP");

(async () => {
  try {
    // Get the token account of the fromWallet address, and if it does not exist, create it
    const fromAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey
    );

    // Get the token account of the toWallet address, and if it does not exist, create it
    const toAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      to
    );

    // Transfer the new token to the "toTokenAccount" we just created
    const transferTx = await transfer(
      connection,
      keypair,
      fromAta.address,
      toAta.address,
      keypair,
      1_000_000
    );
    console.log(
      `Check out your TX here:\n\nhttps://explorer.solana.com/tx/${transferTx}?cluster=devnet`
    );
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
