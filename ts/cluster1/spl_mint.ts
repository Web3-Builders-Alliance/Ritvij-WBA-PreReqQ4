import { Keypair, PublicKey, Connection, Commitment } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import wallet from "../wba-wallet.json";
import base58 from "bs58";

// Import our keypair from the wallet file
const bs = base58.decode(wallet);
const keypair = Keypair.fromSecretKey(new Uint8Array(bs));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

const token_decimals = 1_000_000n;

// Mint address
const mint = new PublicKey("2rQKsxqdtvpxieGeqo3rs9yCyaf94yhoLA7nXW36KxA5");
(async () => {
  try {
    // Create an ATA
    const ata = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey
    );
    console.log(`Your ata is: ${ata.address.toBase58()}`);
    // Your ata is: CQVnRrLDUSoL2Gvr8s571DXZKp3WwcDZJW8bvhP9Lz69
    // Mint to ATA
    const mintTx = await mintTo(
      connection,
      keypair,
      mint,
      ata.address,
      keypair,
      token_decimals
    );
    console.log(`Your mint txid: ${mintTx}`);
    // Your mint txid: 3vEAh35VQx9PzNJ44u4nv95fRnTigWgb3NbaKAQRxaevePkXNhA8Bdyn81e5hH11CR1qJpa41YDnseVuW9iHovFL
  } catch (error) {
    console.log(`Oops, something went wrong: ${error}`);
  }
})();
