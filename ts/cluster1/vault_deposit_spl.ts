import {
  Connection,
  Keypair,
  SystemProgram,
  PublicKey,
  Commitment,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  Program,
  Wallet,
  AnchorProvider,
  Address,
  BN,
} from "@coral-xyz/anchor";
import { WbaVault, IDL } from "./programs/wba_vault";
import wallet from "../wba-wallet.json";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
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
const vaultState = new PublicKey(
  "EqrNRajSnfvsmxB4AL7KviJof573G6zfUyWydgh7V12q"
);

// Create the PDA for our enrollment account
// Seeds are "auth", vaultState
const vaultAuthKeys = [Buffer.from("auth"), vaultState.toBuffer()];
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

const token_decimals = 1_000_000n;

// Mint address
const mint = new PublicKey("2rQKsxqdtvpxieGeqo3rs9yCyaf94yhoLA7nXW36KxA5");

// Execute our enrollment transaction
(async () => {
  try {
    // Get the token account of the fromWallet address, and if it does not exist, create it
    const ownerAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey,
      undefined,
      commitment
    );

    // Get the token account of the fromWallet address, and if it does not exist, create it
    const vaultAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      vaultAuth,
      true,
      commitment
    );
    const signature = await program.methods
      .depositSpl(new BN(1n * token_decimals))
      .accounts({
        owner: keypair.publicKey,
        vaultState,
        vaultAuth,
        systemProgram: SystemProgram.programId,
        ownerAta: ownerAta.address,
        vaultAta: vaultAta.address,
        tokenMint: mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .signers([keypair])
      .rpc();
    console.log(
      `Deposit success! Check out your TX here:\n\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
    );
    // https://explorer.solana.com/tx/qiVdYq8UGawWyrMQzxkYr8Rocr6kFuzwrrsvcy82drA9enppUc8jGq4hNykLyn4HyXJqDFRCxB61vjyKuqKPoTZ?cluster=devnet
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
