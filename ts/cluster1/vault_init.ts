import {
  Connection,
  Keypair,
  SystemProgram,
  PublicKey,
  Commitment,
} from "@solana/web3.js";
import { Program, Wallet, AnchorProvider, Address } from "@coral-xyz/anchor";
import { WbaVault, IDL } from "./programs/wba_vault";
import wallet from "../wba-wallet.json";
import base58 from "bs58";
// Import our keypair from the wallet file
const bs = base58.decode(wallet);
const keypair = Keypair.fromSecretKey(new Uint8Array(bs));

// Commitment
const commitment: Commitment = "confirmed";

// Create a devnet connection
const connection = new Connection("https://api.devnet.solana.com");

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), {
  commitment,
});

// Create our program
const program = new Program<WbaVault>(
  IDL,
  "D51uEDHLbWAxNfodfQDv7qkp8WZtxrhi3uganGbNos7o" as Address,
  provider
);

// Create a random keypair
const vaultState = Keypair.generate();
console.log(`Vault public key: ${vaultState.publicKey.toBase58()}`);

// Create the PDA for our enrollment account
// Seeds are "auth", vaultState
const vaultAuthKeys = [Buffer.from("auth"), vaultState.publicKey.toBuffer()];
const [vaultAuth, _bump] = PublicKey.findProgramAddressSync(
  vaultAuthKeys,
  program.programId
);

// Create the vault key
// Seeds are "vault", vaultAuth
const vaultKeys = [Buffer.from("vault"), vaultAuth.toBuffer()];
const [vault, _bump2] = PublicKey.findProgramAddressSync(
  vaultKeys,
  program.programId
);

// Execute our enrollment transaction
(async () => {
  try {
    const signature = await program.methods
      .initialize()
      .accounts({
        owner: keypair.publicKey,
        systemProgram: SystemProgram.programId,
        vault,
        vaultAuth,
        vaultState: vaultState.publicKey,
      })
      .signers([keypair, vaultState])
      .rpc();
    console.log(
      `Init success! Check out your TX here:\n\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
    );
    // https://explorer.solana.com/tx/36RpZiEFNuW8fqT9FkSuUJEJdydxRXjPCNc2XWn7wQMmAupvxrzXJPqcuHyCuGNC2RA7P3RiyebCMJip96Rz1MeC?cluster=devnet
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
