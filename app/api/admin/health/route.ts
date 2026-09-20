import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  getAccount,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";
import { neon } from "@neondatabase/serverless";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const RPC_URL =
  process.env.SOLANA_RPC_URL ??
  "https://api.mainnet-beta.solana.com";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const databaseUrl = process.env.DATABASE_URL;
  const mintAddress = process.env.RCX_MINT;
  const saleWalletAddress = process.env.SALE_WALLET;
  const treasuryAddress = process.env.TREASURY_WALLET;

  if (!databaseUrl) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is not configured." },
      { status: 500 }
    );
  }

  if (!mintAddress) {
    return NextResponse.json(
      { ok: false, error: "RCX_MINT is not configured." },
      { status: 500 }
    );
  }

  if (!saleWalletAddress) {
    return NextResponse.json(
      { ok: false, error: "SALE_WALLET is not configured." },
      { status: 500 }
    );
  }

  if (!treasuryAddress) {
    return NextResponse.json(
      { ok: false, error: "TREASURY_WALLET is not configured." },
      { status: 500 }
    );
  }

  try {
    const connection = new Connection(
      RPC_URL,
      "confirmed"
    );

    const sql = neon(databaseUrl);

    const mint =
      new PublicKey(mintAddress);

    const saleWallet =
      new PublicKey(saleWalletAddress);

    const treasury =
      new PublicKey(treasuryAddress);

    const [
      slot,
      saleSolLamports,
      treasurySolLamports,
      mintInfo,
      dbCheck,
    ] = await Promise.all([
      connection.getSlot("confirmed"),
      connection.getBalance(
        saleWallet,
        "confirmed"
      ),
      connection.getBalance(
        treasury,
        "confirmed"
      ),
      getMint(
        connection,
        mint,
        "confirmed"
      ),
      sql`SELECT 1 AS ok`,
    ]);

    const saleAta =
      await getAssociatedTokenAddress(
        mint,
        saleWallet
      );

    let saleRcxRaw = 0n;

    try {
      const tokenAccount =
        await getAccount(
          connection,
          saleAta,
          "confirmed"
        );

      saleRcxRaw =
        tokenAccount.amount;
    } catch {
      /*
       * Якщо ATA ще не існує,
       * вважаємо баланс RCX нульовим.
       */
      saleRcxRaw = 0n;
    }

    const decimals =
      mintInfo.decimals;

    const divisor =
      10 ** decimals;

    return NextResponse.json({
      ok: true,

      health: {
        rpc: true,

        database:
          Number(dbCheck[0]?.ok) === 1,

        slot,

        saleWallet: {
          address:
            saleWallet.toBase58(),

          sol:
            saleSolLamports /
            1_000_000_000,

          rcx:
            Number(saleRcxRaw) /
            divisor,
        },

        treasury: {
          address:
            treasury.toBase58(),

          sol:
            treasurySolLamports /
            1_000_000_000,
        },

        token: {
          mint:
            mint.toBase58(),

          decimals,

          supply:
            Number(mintInfo.supply) /
            divisor,
        },
      },
    });
  } catch (error) {
    console.error(
      "ADMIN HEALTH ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "Health check failed.",
      },
      {
        status: 500,
      }
    );
  }
}
