"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

type Purchase = {
  id: number;
  paymentSignature: string;
  buyerWallet: string;
  sol: number;
  rcx: number;
  status: string;
  rcxSignature: string | null;
  createdAt: string;
  updatedAt: string;
};

const short = (value: string) =>
  `${value.slice(0, 7)}...${value.slice(-7)}`;

export default function ManualReview() {
  const router = useRouter();

  const [rows, setRows] =
    useState<Purchase[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [workingId, setWorkingId] =
    useState<number | null>(null);

  const [signatures, setSignatures] =
    useState<Record<number, string>>({});

  const load =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await fetch(
            "/api/admin/purchases?mode=review&limit=500",
            {
              cache: "no-store",
            }
          );

        if (response.status === 401) {
          router.replace(
            "/admin/login"
          );

          return;
        }

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.ok
        ) {
          throw new Error(
            data.error ??
              "Не вдалося завантажити чергу."
          );
        }

        setRows(
          data.purchases
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Помилка завантаження."
        );
      } finally {
        setLoading(false);
      }
    }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function review(
    row: Purchase,
    action:
      | "mark_delivered"
      | "release"
  ) {
    setError("");

    if (
      action ===
      "mark_delivered"
    ) {
      const signature =
        (
          signatures[row.id] ??
          row.rcxSignature ??
          ""
        ).trim();

      if (!signature) {
        setError(
          `Для покупки #${row.id} введи signature транзакції доставки RCX.`
        );

        return;
      }

      const confirmed =
        window.confirm(
          `Покупка #${row.id}\n\n` +
            `${row.sol} SOL → ${row.rcx} RCX\n\n` +
            "Ти перевірив транзакцію в Solscan і впевнений, що RCX були доставлені цьому покупцю?\n\n" +
            "Після підтвердження покупка стане DELIVERED, а reservation буде звільнено."
        );

      if (!confirmed) {
        return;
      }

      await sendReviewAction(
        row,
        action,
        signature
      );

      return;
    }

    const confirmed =
      window.confirm(
        `УВАГА\n\n` +
          `Покупка #${row.id}\n` +
          `${row.sol} SOL → ${row.rcx} RCX\n\n` +
          "Ти перевірив Solscan і впевнений, що RCX НЕ були доставлені?\n\n" +
          "Reservation буде звільнено, а покупка отримає статус CANCELLED.\n\n" +
          "Ця дія НЕ відправляє RCX покупцю."
      );

    if (!confirmed) {
      return;
    }

    await sendReviewAction(
      row,
      action
    );
  }

  async function sendReviewAction(
    row: Purchase,
    action:
      | "mark_delivered"
      | "release",
    rcxSignature?: string
  ) {
    setWorkingId(
      row.id
    );

    setError("");

    try {
      const response =
        await fetch(
          "/api/admin/review",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                purchaseId:
                  row.id,

                action,

                rcxSignature:
                  rcxSignature ??
                  null,
              }),
          }
        );

      if (
        response.status === 401
      ) {
        router.replace(
          "/admin/login"
        );

        return;
      }

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.ok
      ) {
        throw new Error(
          data.error ??
            "Не вдалося виконати дію."
        );
      }

      await load();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Помилка виконання дії."
      );
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-300">
            Attention queue
          </p>

          <h1 className="mt-2 text-2xl font-black sm:text-3xl">
            Manual Review
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-5 text-white/40 sm:text-base">
            Тут знаходяться покупки зі статусом
            processing або failed. Перед будь-якою
            дією обов'язково перевір payment,
            delivery та гаманець покупця в Solscan.
          </p>
        </div>

        <button
          onClick={() =>
            void load()
          }
          disabled={
            loading ||
            workingId !== null
          }
          className="self-start rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white/70 hover:bg-white/[0.05] disabled:opacity-40 md:self-auto"
        >
          {loading
            ? "Refreshing..."
            : "↻ Refresh"}
        </button>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.05] p-4 text-sm text-red-300 sm:mt-6">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:mt-8 sm:gap-4">
        {rows.map((row) => {
          const working =
            workingId ===
            row.id;

          return (
            <div
              key={row.id}
              className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
            >
              <div className="flex flex-col justify-between gap-4 xl:flex-row xl:gap-6">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white/30">
                      #{row.id}
                    </span>

                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase sm:text-[11px] ${
                        row.status ===
                        "processing"
                          ? "border-yellow-400/20 bg-yellow-400/[0.07] text-yellow-300"
                          : "border-red-400/20 bg-red-400/[0.07] text-red-300"
                      }`}
                    >
                      {row.status}
                    </span>
                  </div>

                  <p className="mt-3 break-all font-mono text-sm sm:mt-4">
                    {short(
                      row.buyerWallet
                    )}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="min-w-0 rounded-xl bg-black/20 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-white/30">
                        SOL
                      </p>

                      <p className="mt-1 break-words text-lg font-black">
                        {row.sol.toLocaleString(
                          "en-US",
                          {
                            maximumFractionDigits:
                              9,
                          }
                        )}
                      </p>
                    </div>

                    <div className="min-w-0 rounded-xl bg-black/20 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-white/30">
                        RCX
                      </p>

                      <p className="mt-1 break-words text-lg font-black">
                        {row.rcx.toLocaleString(
                          "en-US"
                        )}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-[11px] leading-5 text-white/25 sm:text-xs">
                    Created:{" "}
                    {new Date(
                      row.createdAt
                    ).toLocaleString()}
                    <br className="sm:hidden" />
                    <span className="hidden sm:inline">
                      {" · "}
                    </span>
                    Updated:{" "}
                    {new Date(
                      row.updatedAt
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 xl:flex xl:flex-wrap xl:content-start">
                  <a
                    href={`https://solscan.io/tx/${row.paymentSignature}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-purple-400/20 bg-purple-400/[0.06] px-2 py-3 text-center text-[11px] font-bold text-purple-300 sm:px-4 sm:text-xs"
                  >
                    Payment ↗
                  </a>

                  {row.rcxSignature ? (
                    <a
                      href={`https://solscan.io/tx/${row.rcxSignature}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-green-400/20 bg-green-400/[0.06] px-2 py-3 text-center text-[11px] font-bold text-green-300 sm:px-4 sm:text-xs"
                    >
                      Delivery ↗
                    </a>
                  ) : (
                    <div className="rounded-xl border border-white/[0.06] px-2 py-3 text-center text-[11px] font-bold text-white/20 sm:px-4 sm:text-xs">
                      No delivery
                    </div>
                  )}

                  <a
                    href={`https://solscan.io/account/${row.buyerWallet}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-white/10 px-2 py-3 text-center text-[11px] font-bold text-white/55 sm:px-4 sm:text-xs"
                  >
                    Wallet ↗
                  </a>
                </div>
              </div>

              <div className="mt-5 border-t border-white/[0.07] pt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-white/35">
                  Manual resolution
                </p>

                <div className="mt-3 grid gap-3 xl:grid-cols-[1fr_auto_auto]">
                  <input
                    type="text"
                    value={
                      signatures[
                        row.id
                      ] ??
                      row.rcxSignature ??
                      ""
                    }
                    onChange={(event) =>
                      setSignatures(
                        (
                          current
                        ) => ({
                          ...current,

                          [row.id]:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="RCX delivery transaction signature"
                    disabled={working}
                    className="min-w-0 rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-xs text-white outline-none placeholder:text-white/20 focus:border-green-400/30 disabled:opacity-40"
                  />

                  <button
                    type="button"
                    disabled={working}
                    onClick={() =>
                      void review(
                        row,
                        "mark_delivered"
                      )
                    }
                    className="rounded-xl border border-green-400/20 bg-green-400/[0.07] px-5 py-3 text-xs font-black text-green-300 hover:bg-green-400/[0.12] disabled:opacity-40"
                  >
                    {working
                      ? "Processing..."
                      : "✓ Mark Delivered"}
                  </button>

                  <button
                    type="button"
                    disabled={working}
                    onClick={() =>
                      void review(
                        row,
                        "release"
                      )
                    }
                    className="rounded-xl border border-red-400/20 bg-red-400/[0.05] px-5 py-3 text-xs font-black text-red-300 hover:bg-red-400/[0.1] disabled:opacity-40"
                  >
                    Release Reservation
                  </button>
                </div>

                <p className="mt-3 text-[11px] leading-5 text-white/25 sm:text-xs">
                  Mark Delivered використовуй тільки
                  після підтвердження фактичної доставки
                  RCX. Release Reservation — тільки якщо
                  ти впевнений, що RCX покупцю не були
                  доставлені.
                </p>
              </div>
            </div>
          );
        })}

        {!loading &&
          rows.length === 0 && (
            <div className="rounded-2xl border border-green-400/15 bg-green-400/[0.04] p-6 text-center text-sm text-green-300 sm:p-10">
              Черга порожня — processing/failed
              покупок немає.
            </div>
          )}
      </div>
    </div>
  );
}
