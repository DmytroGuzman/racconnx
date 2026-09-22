import { NextRequest, NextResponse } from "next/server";

import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";

import {
  getMint,
  getOrCreateAssociatedTokenAccount,
  transferChecked,
} from "@solana/spl-token";

import { neon } from "@neondatabase/serverless";
import { getSaleSettings } from "@/lib/saleSettings";
import { getMaintenanceSettings } from "@/lib/maintenanceSettings";
import { checkRateLimit, getClientKey } from "@/lib/rateLimit";
import bs58 from "bs58";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/*
|--------------------------------------------------------------------------
| CONNECTION
|--------------------------------------------------------------------------
*/

const RPC_URL =
  process.env.SOLANA_RPC_URL ??
  "https://api.mainnet-beta.solana.com";

const connection = new Connection(
  RPC_URL,
  "confirmed"
);

/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
*/

function getConfig() {
  const databaseUrl =
    process.env.DATABASE_URL;

  const mint =
    process.env.RCX_MINT;

  const treasury =
    process.env.TREASURY_WALLET;

  const saleWallet =
    process.env.SALE_WALLET;

  const saleSecret =
    process.env.SALE_WALLET_SECRET;

  const rcxPerSol =
    Number(process.env.RCX_PER_SOL);

  const minPurchaseSol =
    Number(
      process.env.MIN_PURCHASE_SOL ??
        "0.001"
    );

  const maxPurchaseSol =
    Number(
      process.env.MAX_PURCHASE_SOL
    );

  const presaleCapRcx =
    Number(
      process.env.PRESALE_CAP_RCX ??
        "300000000"
    );

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not configured."
    );
  }

  if (!mint) {
    throw new Error(
      "RCX_MINT is not configured."
    );
  }

  if (!treasury) {
    throw new Error(
      "TREASURY_WALLET is not configured."
    );
  }

  if (!saleWallet) {
    throw new Error(
      "SALE_WALLET is not configured."
    );
  }

  if (!saleSecret) {
    throw new Error(
      "SALE_WALLET_SECRET is not configured."
    );
  }

  if (
    !Number.isFinite(rcxPerSol) ||
    rcxPerSol <= 0 ||
    !Number.isInteger(rcxPerSol)
  ) {
    throw new Error(
      "RCX_PER_SOL must be a positive integer."
    );
  }

  if (
    !Number.isFinite(minPurchaseSol) ||
    minPurchaseSol <= 0
  ) {
    throw new Error(
      "MIN_PURCHASE_SOL is invalid."
    );
  }

  if (
    !Number.isFinite(maxPurchaseSol) ||
    maxPurchaseSol < minPurchaseSol
  ) {
    throw new Error(
      "MAX_PURCHASE_SOL is invalid or lower than MIN_PURCHASE_SOL."
    );
  }

  if (
    !Number.isFinite(presaleCapRcx) ||
    presaleCapRcx <= 0 ||
    !Number.isInteger(presaleCapRcx)
  ) {
    throw new Error(
      "PRESALE_CAP_RCX must be a positive integer."
    );
  }

  return {
    databaseUrl,
    mint,
    treasury,
    saleWallet,
    saleSecret,
    rcxPerSol,
    minPurchaseSol,
    maxPurchaseSol,
    presaleCapRcx,
  };
}

/*
|--------------------------------------------------------------------------
| SALE WALLET KEYPAIR
|--------------------------------------------------------------------------
*/

function getSaleKeypair(
  secret: string
) {
  try {
    const bytes =
      bs58.decode(secret.trim());

    return Keypair.fromSecretKey(
      bytes
    );
  } catch {
    throw new Error(
      "SALE_WALLET_SECRET is invalid."
    );
  }
}

/*
|--------------------------------------------------------------------------
| GET — API STATUS
|--------------------------------------------------------------------------
*/

export async function GET() {
  try {
    const config =
      getConfig();

    const mint =
      new PublicKey(
        config.mint
      );

    const treasury =
      new PublicKey(
        config.treasury
      );

    const configuredSaleWallet =
      new PublicKey(
        config.saleWallet
      );

    const saleKeypair =
      getSaleKeypair(
        config.saleSecret
      );

    if (
      !saleKeypair.publicKey.equals(
        configuredSaleWallet
      )
    ) {
      throw new Error(
        "SALE_WALLET_SECRET does not match SALE_WALLET."
      );
    }

    const mintInfo =
      await getMint(
        connection,
        mint
      );

    const slot =
      await connection.getSlot();

    const sql =
      neon(config.databaseUrl);

    await sql`SELECT 1 AS ok`;

    const saleSettings =
      await getSaleSettings(sql, {
        rcxPerSol: config.rcxPerSol,
        minPurchaseSol: config.minPurchaseSol,
        maxPurchaseSol: config.maxPurchaseSol,
      });

    const maintenanceSettings =
      await getMaintenanceSettings(sql);

    return NextResponse.json({
      ok: true,

      network:
        "Solana Mainnet",

      rpcConnected:
        true,

      databaseConnected:
        true,

      slot,

      token: {
        symbol: "RCX",
        mint:
          mint.toBase58(),
        decimals:
          mintInfo.decimals,
      },

      treasury:
        treasury.toBase58(),

      saleWallet:
        saleKeypair.publicKey.toBase58(),

      saleWalletSecretMatches:
        true,

      saleActive:
        saleSettings.active,

      maintenanceMode:
        maintenanceSettings.enabled,

      rate: {
        rcxPerSol:
          saleSettings.rcxPerSol,
      },

      limits: {
        minPurchaseSol:
          saleSettings.minPurchaseSol,
        maxPurchaseSol:
          saleSettings.maxPurchaseSol,
      },
    });
  } catch (error) {
    console.error(
      "BUY API GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "Buy API initialization failed.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
*/

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const maintenanceConfig =
      getConfig();

    const maintenanceSql =
      neon(maintenanceConfig.databaseUrl);

    const maintenanceSettings =
      await getMaintenanceSettings(maintenanceSql);

    const clientKey = getClientKey(request);
    const generalLimit = await checkRateLimit(
      maintenanceSql,
      "buy-api",
      clientKey,
      60,
      60
    );

    if (!generalLimit.allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": String(generalLimit.retryAfterSeconds) },
        }
      );
    }

    if (maintenanceSettings.enabled) {
      return NextResponse.json(
        {
          ok: false,
          error: "RaccoonX is currently under maintenance.",
        },
        {
          status: 503,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | BLOCKHASH
    |--------------------------------------------------------------------------
    */

    if (
      body.action ===
      "blockhash"
    ) {
      const {
        blockhash,
        lastValidBlockHeight,
      } =
        await connection.getLatestBlockhash(
          "confirmed"
        );

      return NextResponse.json({
        ok: true,
        blockhash,
        lastValidBlockHeight,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFY PAYMENT + DELIVER RCX
    |--------------------------------------------------------------------------
    */

    if (
      body.action ===
      "verify"
    ) {
      const verifyLimit = await checkRateLimit(
        maintenanceSql,
        "buy-verify",
        clientKey,
        12,
        60
      );

      if (!verifyLimit.allowed) {
        return NextResponse.json(
          { ok: false, error: "Too many purchase verification attempts." },
          {
            status: 429,
            headers: { "Retry-After": String(verifyLimit.retryAfterSeconds) },
          }
        );
      }

      const signature =
        String(
          body.signature ?? ""
        ).trim();

      const buyerString =
        String(
          body.buyer ?? ""
        ).trim();

      /*
       * solAmount використовується
       * лише як очікувана сума платежу.
       *
       * Кількість RCX сервер
       * розрахує сам.
       */

      const requestedSol =
        Number(
          body.solAmount
        );

      if (!signature) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Missing payment signature.",
          },
          {
            status: 400,
          }
        );
      }

      try {
        const decodedSignature =
          bs58.decode(signature);

        if (decodedSignature.length !== 64) {
          throw new Error("Invalid signature length.");
        }
      } catch {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Invalid payment signature.",
          },
          {
            status: 400,
          }
        );
      }

      if (!buyerString) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Missing buyer wallet.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        !Number.isFinite(
          requestedSol
        ) ||
        requestedSol <= 0
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Invalid SOL amount.",
          },
          {
            status: 400,
          }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | LOAD CONFIG
      |--------------------------------------------------------------------------
      */

      const config =
        getConfig();

      const sql =
        neon(
          config.databaseUrl
        );

      const saleSettings =
        await getSaleSettings(sql, {
          rcxPerSol: config.rcxPerSol,
          minPurchaseSol: config.minPurchaseSol,
          maxPurchaseSol: config.maxPurchaseSol,
        });

      if (!saleSettings.active) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "RCX sale is currently paused.",
          },
          {
            status: 503,
          }
        );
      }

      if (
        requestedSol <
          saleSettings.minPurchaseSol ||
        requestedSol >
          saleSettings.maxPurchaseSol
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              `Purchase must be between ${saleSettings.minPurchaseSol} and ${saleSettings.maxPurchaseSol} SOL.`,
          },
          {
            status: 400,
          }
        );
      }

      let buyer: PublicKey;

      try {
        buyer =
          new PublicKey(
            buyerString
          );
      } catch {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Invalid buyer wallet.",
          },
          {
            status: 400,
          }
        );
      }

      const treasury =
        new PublicKey(
          config.treasury
        );

      const mint =
        new PublicKey(
          config.mint
        );

      const configuredSaleWallet =
        new PublicKey(
          config.saleWallet
        );

      const saleKeypair =
        getSaleKeypair(
          config.saleSecret
        );

      if (
        !saleKeypair.publicKey.equals(
          configuredSaleWallet
        )
      ) {
        throw new Error(
          "SALE_WALLET_SECRET does not match SALE_WALLET."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CHECK DATABASE FIRST
      |--------------------------------------------------------------------------
      */

      const existing =
        await sql`
          SELECT
            payment_signature,
            buyer_wallet,
            sol_lamports,
            rcx_raw_amount,
            status,
            rcx_signature
          FROM purchases
          WHERE payment_signature = ${signature}
          LIMIT 1
        `;

      if (
        existing.length > 0
      ) {
        const purchase =
          existing[0];

        /*
         * Уже успішно видано.
         *
         * Повертаємо попередній
         * результат, але нічого
         * повторно не надсилаємо.
         */

        if (
          purchase.status ===
          "delivered"
        ) {
          return NextResponse.json({
            ok: true,

            verified: true,

            delivered: true,

            alreadyProcessed:
              true,

            paymentSignature:
              signature,

            rcxSignature:
              purchase.rcx_signature,

            buyer:
              purchase.buyer_wallet,

            message:
              "This purchase was already completed.",
          });
        }

        /*
         * Якщо запис processing —
         * автоматично повторно RCX
         * НЕ відправляємо.
         */

        if (
          purchase.status ===
          "processing"
        ) {
          return NextResponse.json(
            {
              ok: false,

              verified: true,

              delivered: false,

              requiresReview:
                true,

              error:
                "This payment is already being processed or requires transaction review.",
            },
            {
              status: 409,
            }
          );
        }

        /*
         * Failed також не retry-имо
         * автоматично.
         */

        return NextResponse.json(
          {
            ok: false,

            verified: true,

            delivered: false,

            requiresReview:
              true,

            error:
              "This payment requires manual review.",
          },
          {
            status: 409,
          }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | FIND SOLANA PAYMENT
      |--------------------------------------------------------------------------
      */

      let transaction =
        null;

      for (
        let attempt = 0;
        attempt < 12;
        attempt++
      ) {
        transaction =
          await connection.getParsedTransaction(
            signature,
            {
              commitment:
                "confirmed",

              maxSupportedTransactionVersion:
                0,
            }
          );

        if (transaction) {
          break;
        }

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              1000
            )
        );
      }

      if (!transaction) {
        return NextResponse.json(
          {
            ok: false,

            error:
              "Transaction was not found or is not confirmed yet.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        transaction.meta?.err
      ) {
        return NextResponse.json(
          {
            ok: false,

            error:
              "Payment transaction failed on-chain.",
          },
          {
            status: 400,
          }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | VERIFY SOL TRANSFER
      |--------------------------------------------------------------------------
      */

      const requestedLamports =
        Math.round(
          requestedSol *
            LAMPORTS_PER_SOL
        );

      if (
        !Number.isSafeInteger(
          requestedLamports
        ) ||
        requestedLamports <= 0
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Invalid payment amount.",
          },
          {
            status: 400,
          }
        );
      }

      let paidLamports:
        number | null =
        null;

      for (
        const instruction of
        transaction.transaction
          .message.instructions
      ) {
        if (
          !(
            "parsed" in
            instruction
          )
        ) {
          continue;
        }

        if (
          instruction.program !==
          "system"
        ) {
          continue;
        }

        const parsed =
          instruction.parsed;

        if (
          parsed?.type !==
            "transfer" ||
          parsed?.info == null
        ) {
          continue;
        }

        const source =
          String(
            parsed.info.source ??
              ""
          );

        const destination =
          String(
            parsed.info.destination ??
              ""
          );

        const lamports =
          Number(
            parsed.info.lamports
          );

        if (
          source ===
            buyer.toBase58() &&
          destination ===
            treasury.toBase58() &&
          Number.isSafeInteger(
            lamports
          ) &&
          lamports > 0
        ) {
          paidLamports =
            lamports;

          break;
        }
      }

      if (
        paidLamports === null
      ) {
        return NextResponse.json(
          {
            ok: false,

            error:
              "Expected SOL payment was not found in this transaction.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * Сума on-chain повинна
       * збігатися із сумою,
       * для якої frontend
       * створив покупку.
       */

      if (
        paidLamports !==
        requestedLamports
      ) {
        return NextResponse.json(
          {
            ok: false,

            error:
              "SOL payment amount does not match the requested purchase.",
          },
          {
            status: 400,
          }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CALCULATE RCX SERVER-SIDE
      |--------------------------------------------------------------------------
      */

      const mintInfo =
        await getMint(
          connection,
          mint
        );

      const decimals =
        mintInfo.decimals;

      /*
       * Уникаємо розрахунку
       * через SOL float.
       *
       * paidLamports / 1e9 SOL
       * × RCX_PER_SOL
       * × 10^decimals
       */

      const rate =
        BigInt(
          Math.trunc(
            saleSettings.rcxPerSol
          )
        );

      const rawMultiplier =
        10n **
        BigInt(decimals);

      const rcxRawAmount =
        (
          BigInt(
            paidLamports
          ) *
          rate *
          rawMultiplier
        ) /
        BigInt(
          LAMPORTS_PER_SOL
        );

      if (
        rcxRawAmount <= 0n
      ) {
        throw new Error(
          "Calculated RCX amount is zero."
        );
      }

      /*
       * transferChecked у поточному
       * SPL Token API приймає
       * bigint amount.
       */

      const rcxDisplayAmount =
        Number(
          rcxRawAmount
        ) /
        10 ** decimals;

      /*
|--------------------------------------------------------------------------
| CLAIM PAYMENT + RESERVE PRESALE ALLOCATION
|--------------------------------------------------------------------------
|
| Ліміт рахується так:
|
| DELIVERED + RESERVED + NEW PURCHASE <= PRESALE CAP
|
| delivered:
|   RCX, які вже реально продані.
|
| reserved:
|   RCX, які тимчасово зарезервовані покупками,
|   що зараз обробляються або потребують review.
|
*/

const presaleCapRaw =
  BigInt(config.presaleCapRcx) *
  rawMultiplier;

/*
|--------------------------------------------------------------------------
| ATOMIC CLAIM
|--------------------------------------------------------------------------
|
| pg_advisory_xact_lock серіалізує операції presale.
|
| Завдяки цьому дві одночасні покупки не можуть
| одночасно побачити один і той самий залишок.
|
*/

const claimed =
  await sql`
    WITH lock_presale AS (
      SELECT
        pg_advisory_xact_lock(927001)
    ),

    payment_available AS (
      SELECT 1
      FROM lock_presale
      WHERE NOT EXISTS (
        SELECT 1
        FROM purchases
        WHERE
          payment_signature =
            ${signature}
      )
    ),

    sold AS (
      SELECT
        COALESCE(
          SUM(rcx_raw_amount)
            FILTER (
              WHERE status = 'delivered'
            ),
          0
        )::numeric
          AS sold_raw

      FROM purchases

      CROSS JOIN lock_presale
    ),

    reserved AS (
      UPDATE sale_state

      SET
        reserved_rcx_raw =
          reserved_rcx_raw +
          ${rcxRawAmount.toString()},

        updated_at =
          NOW()

      FROM sold

      WHERE
        sale_state.id = 1

        AND EXISTS (
          SELECT 1
          FROM payment_available
        )

        AND
          sold.sold_raw +
          sale_state.reserved_rcx_raw +
          ${rcxRawAmount.toString()}
          <=
          ${presaleCapRaw.toString()}

      RETURNING
        sale_state.reserved_rcx_raw
    )

    INSERT INTO purchases (
      payment_signature,
      buyer_wallet,
      sol_lamports,
      rcx_raw_amount,
      status
    )

    SELECT
      ${signature},
      ${buyer.toBase58()},
      ${paidLamports},
      ${rcxRawAmount.toString()},
      'processing'

    FROM reserved

    ON CONFLICT (
      payment_signature
    )
    DO NOTHING

    RETURNING id
  `;

/*
|--------------------------------------------------------------------------
| CLAIM FAILED
|--------------------------------------------------------------------------
*/

if (claimed.length === 0) {
  /*
   * Перевіряємо, чи payment signature
   * вже існує.
   */

  const existingPurchase =
    await sql`
      SELECT
        id,
        status
      FROM purchases
      WHERE
        payment_signature =
          ${signature}
      LIMIT 1
    `;

  if (existingPurchase.length > 0) {
    return NextResponse.json(
      {
        ok: false,

        verified: true,

        delivered: false,

        alreadyProcessed: true,

        error:
          "This payment has already been processed.",
      },
      {
        status: 409,
      }
    );
  }

  /*
   * Якщо signature немає,
   * значить покупка не вмістилася
   * у presale allocation.
   */

  const [state] =
    await sql`
      SELECT
        reserved_rcx_raw::text
          AS reserved_rcx_raw
      FROM sale_state
      WHERE id = 1
      LIMIT 1
    `;

  const [sold] =
    await sql`
      SELECT
        COALESCE(
          SUM(rcx_raw_amount)
            FILTER (
              WHERE status = 'delivered'
            ),
          0
        )::text
          AS sold_raw

      FROM purchases
    `;

  const reservedRaw =
    BigInt(
      state?.reserved_rcx_raw ??
        "0"
    );

  const soldRaw =
    BigInt(
      sold?.sold_raw ??
        "0"
    );

  const usedRaw =
    soldRaw +
    reservedRaw;

  const remainingRaw =
    presaleCapRaw > usedRaw
      ? presaleCapRaw -
        usedRaw
      : 0n;

  const remainingRcx =
    Number(remainingRaw) /
    10 ** decimals;

  return NextResponse.json(
    {
      ok: false,

      verified: true,

      delivered: false,

      soldOut:
        remainingRaw === 0n,

      allocationExceeded:
        remainingRaw > 0n,

      error:
        remainingRaw === 0n
          ? "RCX presale is sold out."
          : "Purchase exceeds the remaining RCX presale allocation.",

      presale: {
        cap:
          config.presaleCapRcx,

        remaining:
          remainingRcx,
      },
    },
    {
      status: 409,
    }
  );
}

      /*
      |--------------------------------------------------------------------------
      | TOKEN ACCOUNTS
      |--------------------------------------------------------------------------
      */

      try {
        const saleTokenAccount =
          await getOrCreateAssociatedTokenAccount(
            connection,
            saleKeypair,
            mint,
            saleKeypair.publicKey
          );

        const buyerTokenAccount =
          await getOrCreateAssociatedTokenAccount(
            connection,
            saleKeypair,
            mint,
            buyer
          );

        /*
        |--------------------------------------------------------------------------
        | CHECK RCX BALANCE
        |--------------------------------------------------------------------------
        */

        const saleBalance =
          await connection.getTokenAccountBalance(
            saleTokenAccount.address
          );

        const available =
          BigInt(
            saleBalance.value.amount
          );

        if (
  available <
  rcxRawAmount
) {
  /*
  |--------------------------------------------------------------------------
  | DEFINITIVE DELIVERY FAILURE
  |--------------------------------------------------------------------------
  |
  | transferChecked ще НЕ викликався.
  |
  | Тому ми точно знаємо, що RCX покупцю
  | не були відправлені, і можемо безпечно:
  |
  | 1. перевести purchase processing -> failed;
  | 2. повернути його RCX із reserved allocation.
  |
  */

  await sql`
    WITH failed_purchase AS (
      UPDATE purchases

      SET
        status = 'failed',
        updated_at = NOW()

      WHERE
        payment_signature =
          ${signature}

        AND status =
          'processing'

      RETURNING
        rcx_raw_amount
    )

    UPDATE sale_state

    SET
      reserved_rcx_raw =
        GREATEST(
          0,
          reserved_rcx_raw -
            COALESCE(
              (
                SELECT
                  rcx_raw_amount
                FROM failed_purchase
                LIMIT 1
              ),
              0
            )
        ),

      updated_at =
        NOW()

    WHERE id = 1
  `;

  return NextResponse.json(
    {
      ok: false,

      verified: true,

      delivered: false,

      requiresReview: false,

      error:
        "Sale wallet does not have enough RCX.",
    },
    {
      status: 500,
    }
  );
}

        /*
        |--------------------------------------------------------------------------
        | SEND RCX
        |--------------------------------------------------------------------------
        */

        const rcxSignature =
          await transferChecked(
            connection,

            saleKeypair,

            saleTokenAccount.address,

            mint,

            buyerTokenAccount.address,

            saleKeypair,

            rcxRawAmount,

            decimals,

            [],

            {
              commitment:
                "confirmed",
            }
          );

        /*
        |--------------------------------------------------------------------------
        | MARK DELIVERED
        |--------------------------------------------------------------------------
        */

        await sql`
  WITH delivered AS (
    UPDATE purchases

    SET
      status = 'delivered',

      rcx_signature =
        ${rcxSignature},

      updated_at =
        NOW()

    WHERE
      payment_signature =
        ${signature}

      AND status =
        'processing'

    RETURNING
      rcx_raw_amount
  )

  UPDATE sale_state

  SET
    reserved_rcx_raw =
      GREATEST(
        0,
        reserved_rcx_raw -
          COALESCE(
            (
              SELECT
                rcx_raw_amount
              FROM delivered
              LIMIT 1
            ),
            0
          )
      ),

    updated_at =
      NOW()

  WHERE id = 1
`;

        return NextResponse.json({
          ok: true,

          verified:
            true,

          delivered:
            true,

          alreadyProcessed:
            false,

          paymentSignature:
            signature,

          rcxSignature,

          buyer:
            buyer.toBase58(),

          payment: {
            sol:
              paidLamports /
              LAMPORTS_PER_SOL,

            lamports:
              paidLamports,

            treasury:
              treasury.toBase58(),
          },

          purchase: {
            rcx:
              rcxDisplayAmount,

            rawAmount:
              rcxRawAmount.toString(),

            rate:
              saleSettings.rcxPerSol,

            decimals,
          },

          tokenAccounts: {
            source:
              saleTokenAccount.address.toBase58(),

            destination:
              buyerTokenAccount.address.toBase58(),
          },
        });
      } catch (deliveryError) {
        /*
         * ВАЖЛИВО:
         *
         * Тут НЕ видаляємо purchase.
         *
         * Ми не завжди можемо знати,
         * чи Solana встигла прийняти
         * transfer перед network error.
         *
         * Тому повторна автоматична
         * видача блокується.
         */

        console.error(
          "RCX DELIVERY ERROR:",
          deliveryError
        );

        await sql`
  WITH failed AS (
    UPDATE purchases

    SET
      status = 'failed',
      updated_at = NOW()

    WHERE
      payment_signature =
        ${signature}

      AND status =
        'processing'

    RETURNING
      rcx_raw_amount
  )

  UPDATE sale_state

  SET
    reserved_rcx_raw =
      GREATEST(
        0,
        reserved_rcx_raw -
          COALESCE(
            (
              SELECT
                rcx_raw_amount
              FROM failed
              LIMIT 1
            ),
            0
          )
      ),

    updated_at =
      NOW()

  WHERE id = 1
`;

        return NextResponse.json(
          {
            ok: false,

            verified:
              true,

            delivered:
              false,

            requiresReview:
              true,

            error:
              "SOL payment was verified, but RCX delivery could not be safely confirmed. Do not make another payment.",
          },
          {
            status: 500,
          }
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | UNKNOWN ACTION
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unknown action.",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "BUY API POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "Buy API request failed.",
      },
      {
        status: 500,
      }
    );
  }
}