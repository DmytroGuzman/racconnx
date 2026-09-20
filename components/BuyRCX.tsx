"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

import { T, useLanguage } from "./i18n/LanguageProvider";

const TREASURY_WALLET =
  "A6oE9jf3pS1zeXt1KXVDedq3SK6KTeqp4dhjhVLZioPw";

type PhantomProvider = {
  isPhantom?: boolean;

  publicKey?: {
    toString(): string;
  };

  connect(): Promise<{
    publicKey: {
      toString(): string;
    };
  }>;

  disconnect(): Promise<void>;

  signAndSendTransaction(transaction: Transaction): Promise<{
    signature: string;
  }>;
};


type BuyConfig = {
  saleActive: boolean;
  rate: {
    rcxPerSol: number;
  };
  limits: {
    minPurchaseSol: number;
    maxPurchaseSol: number;
  };
};

type VerifyResponse = {
  ok: boolean;
  verified?: boolean;
  delivered?: boolean;

  paymentSignature?: string;
  rcxSignature?: string;

  purchase?: {
    rcx: number;
    rate: number;
    decimals: number;
  };

  error?: string;
};

declare global {
  interface Window {
    phantom?: {
      solana?: PhantomProvider;
    };
  }
}

export default function BuyRCX() {
  const { t } = useLanguage();
  const [solAmount, setSolAmount] =
    useState("0.001");

  const [wallet, setWallet] =
    useState("");

  const [error, setError] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [isBuying, setIsBuying] =
    useState(false);

  const [
    paymentSignature,
    setPaymentSignature,
  ] = useState("");

  const [
    rcxSignature,
    setRcxSignature,
  ] = useState("");

  const [delivered, setDelivered] =
    useState(false);

  const [buyConfig, setBuyConfig] =
    useState<BuyConfig | null>(null);

  const [configLoading, setConfigLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadConfig = async () => {
      try {
        const response = await fetch("/api/buy", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (
          !response.ok ||
          !data.ok ||
          !data.rate ||
          !data.limits
        ) {
          throw new Error(
            data.error ?? "Failed to load sale settings."
          );
        }

        if (!cancelled) {
          setBuyConfig({
            saleActive: Boolean(data.saleActive),
            rate: {
              rcxPerSol: Number(data.rate.rcxPerSol),
            },
            limits: {
              minPurchaseSol: Number(data.limits.minPurchaseSol),
              maxPurchaseSol: Number(data.limits.maxPurchaseSol),
            },
          });
        }
      } catch (err) {
        console.error("BUY CONFIG ERROR:", err);

        if (!cancelled) {
          setError("Failed to load sale settings.");
        }
      } finally {
        if (!cancelled) {
          setConfigLoading(false);
        }
      }
    };

    loadConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | CALCULATOR
  |--------------------------------------------------------------------------
  */

  const rcxAmount = useMemo(() => {
    const sol = Number(solAmount);

    if (
      !Number.isFinite(sol) ||
      sol <= 0
    ) {
      return 0;
    }

    if (!buyConfig) {
      return 0;
    }

    return sol * buyConfig.rate.rcxPerSol;
  }, [solAmount, buyConfig]);

  /*
  |--------------------------------------------------------------------------
  | CONNECT WALLET
  |--------------------------------------------------------------------------
  */

  const connectWallet = async () => {
    setError("");
    setStatus("");
    setPaymentSignature("");
    setRcxSignature("");
    setDelivered(false);

    try {
      const provider =
        window.phantom?.solana;

      if (!provider?.isPhantom) {
        window.open(
          "https://phantom.com/",
          "_blank",
          "noopener,noreferrer"
        );

        return;
      }

      const response =
        await provider.connect();

      setWallet(
        response.publicKey.toString()
      );
    } catch (err) {
      console.error(
        "CONNECT ERROR:",
        err
      );

      setError(
        "Failed to connect Phantom."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DISCONNECT
  |--------------------------------------------------------------------------
  */

  const disconnectWallet =
    async () => {
      try {
        await window.phantom?.solana?.disconnect();
      } catch (err) {
        console.error(
          "DISCONNECT ERROR:",
          err
        );
      } finally {
        setWallet("");
        setError("");
        setStatus("");
        setPaymentSignature("");
        setRcxSignature("");
        setDelivered(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | BUY RCX
  |--------------------------------------------------------------------------
  */

  const buyRCX = async () => {
    setError("");
    setStatus("");
    setPaymentSignature("");
    setRcxSignature("");
    setDelivered(false);

    const amount =
      Number(solAmount);

    /*
     * Validate amount
     */

    if (!buyConfig) {
      setError("Sale settings are still loading.");
      return;
    }

    if (!buyConfig.saleActive) {
      setError("RCX sale is currently paused.");
      return;
    }

    if (
      !Number.isFinite(amount) ||
      amount < buyConfig.limits.minPurchaseSol ||
      amount > buyConfig.limits.maxPurchaseSol
    ) {
      setError(
        `Purchase must be between ${buyConfig.limits.minPurchaseSol} and ${buyConfig.limits.maxPurchaseSol} SOL.`
      );

      return;
    }

    const provider =
      window.phantom?.solana;

    if (
      !provider?.isPhantom ||
      !provider.publicKey
    ) {
      setError(
        "Connect Phantom first."
      );

      return;
    }

    try {
      setIsBuying(true);

      /*
       * Buyer wallet
       */

      const buyerAddress =
        provider.publicKey.toString();

      const buyer =
        new PublicKey(
          buyerAddress
        );

      /*
       * Treasury
       */

      const treasury =
        new PublicKey(
          TREASURY_WALLET
        );

      /*
      |--------------------------------------------------------------------------
      | 1. GET BLOCKHASH
      |--------------------------------------------------------------------------
      */

      setStatus(
        "Preparing transaction..."
      );

      const blockhashResponse =
        await fetch(
          "/api/buy",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              action:
                "blockhash",
            }),
          }
        );

      const blockhashData =
        await blockhashResponse.json();

      if (
        !blockhashResponse.ok ||
        !blockhashData.ok
      ) {
        throw new Error(
          blockhashData.error ??
            "Failed to prepare transaction."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | 2. CREATE SOL PAYMENT
      |--------------------------------------------------------------------------
      */

      const lamports =
        Math.round(
          amount *
            LAMPORTS_PER_SOL
        );

      if (
        !Number.isSafeInteger(
          lamports
        ) ||
        lamports <= 0
      ) {
        throw new Error(
          "Invalid SOL amount."
        );
      }

      const transaction =
        new Transaction().add(
          SystemProgram.transfer({
            fromPubkey:
              buyer,

            toPubkey:
              treasury,

            lamports,
          })
        );

      transaction.recentBlockhash =
        blockhashData.blockhash;

      transaction.feePayer =
        buyer;

      /*
      |--------------------------------------------------------------------------
      | 3. PHANTOM
      |--------------------------------------------------------------------------
      */

      setStatus(
        "Confirm payment in Phantom..."
      );

      const result =
        await provider.signAndSendTransaction(
          transaction
        );

      /*
       * SOL transaction has now
       * been submitted.
       */

      setPaymentSignature(
        result.signature
      );

      /*
      |--------------------------------------------------------------------------
      | 4. VERIFY PAYMENT
      |--------------------------------------------------------------------------
      */

      setStatus(
        "Verifying SOL payment..."
      );

      const verifyResponse =
        await fetch(
          "/api/buy",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              action:
                "verify",

              signature:
                result.signature,

              buyer:
                buyerAddress,

              solAmount:
                amount,
            }),
          }
        );

      const verifyData: VerifyResponse =
        await verifyResponse.json();

      if (
        !verifyResponse.ok ||
        !verifyData.ok
      ) {
        throw new Error(
          verifyData.error ??
            "Payment verification failed."
        );
      }

      /*
       * Payment must be verified.
       */

      if (
        !verifyData.verified
      ) {
        throw new Error(
          "Payment could not be verified."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | 5. RCX DELIVERY
      |--------------------------------------------------------------------------
      |
      | Backend already performs
      | the RCX transfer during
      | action = verify.
      |
      */

      if (
        !verifyData.delivered ||
        !verifyData.rcxSignature
      ) {
        throw new Error(
          "Payment was verified, but RCX delivery was not confirmed."
        );
      }

      setRcxSignature(
        verifyData.rcxSignature
      );

      setDelivered(true);

      setStatus(
        `${(
          verifyData.purchase?.rcx ??
          rcxAmount
        ).toLocaleString(
          "en-US"
        )} RCX delivered ✓`
      );
    } catch (err) {
      console.error(
        "BUY ERROR:",
        err
      );

      if (
        err instanceof Error
      ) {
        const message =
          err.message.toLowerCase();

        if (
          message.includes(
            "user rejected"
          ) ||
          message.includes(
            "rejected the request"
          ) ||
          message.includes(
            "cancelled"
          )
        ) {
          setError(
            "Transaction cancelled."
          );
        } else if (
          message.includes(
            "insufficient"
          )
        ) {
          setError(
            "Not enough SOL to complete the transaction."
          );
        } else {
          setError(
            err.message
          );
        }
      } else {
        setError(
          "Transaction failed. Please try again."
        );
      }

      setStatus("");
    } finally {
      setIsBuying(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SHORT WALLET
  |--------------------------------------------------------------------------
  */

  const shortWallet =
    wallet
      ? `${wallet.slice(
          0,
          4
        )}...${wallet.slice(
          -4
        )}`
      : "";

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <section
      id="buy"
      className="relative overflow-hidden px-6 py-32 lg:py-40"
    >
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.7,
          }}
          className="text-center"
        >
          <div className="section-label justify-center"><T>BUY RACCOONX</T></div>

          <h2 className="section-title">
            <span className="gradient-text"><T>Get RCX</T></span>
          </h2>

          <p className="section-description"><T>Enter the amount of SOL to calculate how much RCX you will receive.</T></p>
        </motion.div>

        {/* BUY CARD */}

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.7,
            delay: 0.1,
          }}
          className="
            relative
            mx-auto
            mt-16
            max-w-xl
            overflow-hidden
            rounded-[32px]
            border
            border-white/[0.08]
            bg-[#090C13]/80
            p-6
            shadow-2xl
            backdrop-blur-xl
            sm:p-8
          "
        >

          {/* GLOWS */}

          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-purple-500/10 blur-[80px]" />

          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-green-400/10 blur-[80px]" />

          <div className="relative">

            {/* YOU PAY */}

            <div className="mb-3 flex items-center justify-between">

              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/35"><T>You pay</T></span>

              <span className="text-xs text-white/25"><T>SOL</T></span>

            </div>

            <div className="flex items-center rounded-2xl border border-white/[0.08] bg-black/30 px-5">

              <input
                type="number"
                min={buyConfig?.limits.minPurchaseSol ?? 0.001}
                step="0.001"
                value={solAmount}
                disabled={
                  isBuying ||
                  configLoading ||
                  !buyConfig?.saleActive
                }
                onChange={(
                  event
                ) => {
                  setSolAmount(
                    event.target.value
                  );

                  setError("");
                  setStatus("");
                  setPaymentSignature(
                    ""
                  );
                  setRcxSignature(
                    ""
                  );
                  setDelivered(
                    false
                  );
                }}
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  py-5
                  text-2xl
                  font-black
                  text-white
                  outline-none
                "
              />

              <span className="ml-4 font-['Orbitron'] text-sm font-bold text-purple-400"><T>SOL</T></span>

            </div>

            {/* ARROW */}

            <div className="my-4 flex justify-center">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/50">
                ↓
              </div>

            </div>

            {/* YOU RECEIVE */}

            <div className="mb-3 flex items-center justify-between">

              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/35"><T>You receive</T></span>

              <span className="text-xs text-white/25"><T>RCX</T></span>

            </div>

            <div className="flex items-center rounded-2xl border border-white/[0.08] bg-black/30 px-5">

              <div className="min-w-0 flex-1 overflow-hidden py-5 text-2xl font-black text-white">

                {rcxAmount.toLocaleString(
                  "en-US",
                  {
                    maximumFractionDigits:
                      9,
                  }
                )}

              </div>

              <span className="ml-4 font-['Orbitron'] text-sm font-bold text-green-400"><T>RCX</T></span>

            </div>

            {/* RATE */}

            <div className="mt-5 flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-4 text-sm">

              <span className="text-white/35"><T>Rate</T></span>

              <span className="font-bold text-white/70">
                1 SOL ={" "}
                {buyConfig
                  ? buyConfig.rate.rcxPerSol.toLocaleString("en-US")
                  : "—"}{" "}
                RCX
              </span>

            </div>

            {/* WALLET */}

            {wallet && (
              <div className="mt-3 flex items-center justify-between rounded-xl border border-green-400/10 bg-green-400/[0.03] px-4 py-3">

                <div>

                  <p className="text-xs text-white/30"><T>Connected wallet</T></p>

                  <p className="mt-1 font-['Orbitron'] text-sm text-green-400">
                    {shortWallet}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    disconnectWallet
                  }
                  disabled={
                    isBuying
                  }
                  className="text-xs font-bold text-white/30 transition hover:text-white disabled:cursor-not-allowed"
                ><T>Disconnect</T></button>

              </div>
            )}

            {/* SUCCESS */}

            {delivered &&
              status && (
                <div className="mt-4 rounded-xl border border-green-400/20 bg-green-400/[0.05] px-4 py-4 text-center">

                  <p className="text-sm font-black text-green-400">
                    {t(status)}
                  </p>

                  <p className="mt-1 text-xs text-white/30"><T>Purchase completed successfully.</T></p>

                </div>
              )}

            {/* PROCESSING */}

            {!delivered &&
              status && (
                <div className="mt-4 rounded-xl border border-purple-400/20 bg-purple-400/[0.05] px-4 py-4 text-center">

                  <p className="text-sm font-bold text-purple-300">
                    {t(status)}
                  </p>

                </div>
              )}

            {/* ERROR */}

            {error && (
              <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/[0.05] px-4 py-4 text-center">

                <p className="text-sm text-red-400">
                  {t(error)}
                </p>

              </div>
            )}

            {/* TRANSACTIONS */}

            {(paymentSignature ||
              rcxSignature) && (
              <div className="mt-4 grid gap-2">

                {paymentSignature && (
                  <a
                    href={`https://solscan.io/tx/${paymentSignature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      flex
                      items-center
                      justify-between
                      rounded-xl
                      border
                      border-white/[0.06]
                      bg-white/[0.02]
                      px-4
                      py-3
                      text-xs
                      text-white/40
                      transition
                      hover:border-white/[0.12]
                      hover:text-white
                    "
                  >
                    <span><T>SOL Payment</T></span>

                    <span><T>View on Solscan ↗</T></span>
                  </a>
                )}

                {rcxSignature && (
                  <a
                    href={`https://solscan.io/tx/${rcxSignature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      flex
                      items-center
                      justify-between
                      rounded-xl
                      border
                      border-green-400/10
                      bg-green-400/[0.025]
                      px-4
                      py-3
                      text-xs
                      text-green-400/60
                      transition
                      hover:border-green-400/20
                      hover:text-green-400
                    "
                  >
                    <span><T>RCX Delivery</T></span>

                    <span><T>View on Solscan ↗</T></span>
                  </a>
                )}

              </div>
            )}

            {/* BUTTON */}

            {!configLoading && buyConfig && !buyConfig.saleActive ? (
              <button
                type="button"
                disabled
                className="
                  mt-6
                  w-full
                  cursor-not-allowed
                  rounded-xl
                  border
                  border-red-400/15
                  bg-red-400/[0.06]
                  px-6
                  py-4
                  font-black
                  text-red-300/60
                "
              >
                <T>Sale Paused</T>
              </button>
            ) : !wallet ? (
              <button
                type="button"
                onClick={connectWallet}
                disabled={configLoading || !buyConfig}
                className="
                  mt-6
                  w-full
                  rounded-xl
                  bg-gradient-to-r
                  from-purple-500
                  to-green-400
                  px-6
                  py-4
                  font-black
                  text-black
                  transition
                  duration-300
                  hover:scale-[1.01]
                  hover:shadow-[0_0_35px_rgba(153,69,255,.3)]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  disabled:hover:scale-100
                "
              >
                {configLoading ? t("Loading sale...") : t("Connect Phantom")}
              </button>
            ) : (
              <button
                type="button"
                onClick={buyRCX}
                disabled={
                  isBuying ||
                  configLoading ||
                  !buyConfig ||
                  !buyConfig.saleActive ||
                  rcxAmount <= 0 ||
                  Number(solAmount) < buyConfig.limits.minPurchaseSol ||
                  Number(solAmount) > buyConfig.limits.maxPurchaseSol
                }
                className="
                  mt-6
                  w-full
                  rounded-xl
                  bg-gradient-to-r
                  from-purple-500
                  to-green-400
                  px-6
                  py-4
                  font-black
                  text-black
                  transition
                  duration-300
                  hover:scale-[1.01]
                  hover:shadow-[0_0_35px_rgba(153,69,255,.3)]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  disabled:hover:scale-100
                "
              >
                {isBuying
                  ? t("Processing...")
                  : t(`Buy ${rcxAmount.toLocaleString("en-US")} RCX`)}
              </button>
            )}

            <p className="mt-4 text-center text-xs text-white/20">
              {buyConfig
                ? t(`Purchase limits: ${buyConfig.limits.minPurchaseSol}–${buyConfig.limits.maxPurchaseSol} SOL`)
                : t("Loading purchase limits...")}
            </p>

          </div>
        </motion.div>
      </div>
    </section>
  );
}