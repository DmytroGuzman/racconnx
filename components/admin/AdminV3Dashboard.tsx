"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import VisitorAnalytics from "@/components/admin/VisitorAnalytics";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

type Overview = {
  delivered: number;
  processing: number;
  failed: number;
  uniqueBuyers: number;
  solReceived: number;
  rcxSold: number;
};

type Health = {
  rpc: boolean;
  database: boolean;
  slot: number;

  saleWallet: {
    address: string;
    sol: number;
    rcx: number;
  };

  treasury: {
    address: string;
    sol: number;
  };

  token: {
    mint: string;
    decimals: number;
    supply: number;
  };
};

type Presale = {
  cap: number;
  sold: number;
  reserved: number;
  remaining: number;
  progress: number;
};

type Sale = {
  active: boolean;
  rcxPerSol: number;
  minPurchaseSol: number;
  maxPurchaseSol: number;
  presale: Presale;
};

type Day = {
  day: string;
  purchases: number;
  sol: number;
  rcx: number;
};

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const short = (value: string) =>
  `${value.slice(0, 5)}...${value.slice(-5)}`;

const formatRcx = (value: number) =>
  value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });

const formatSol = (value: number) =>
  value.toLocaleString("en-US", {
    maximumFractionDigits: 9,
  });

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function AdminV3Dashboard() {
  const router = useRouter();

  const [overview, setOverview] =
    useState<Overview | null>(null);

  const [health, setHealth] =
    useState<Health | null>(null);

  const [sale, setSale] =
    useState<Sale | null>(null);

  const [days, setDays] =
    useState<Day[]>([]);

  const [error, setError] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | LOAD DASHBOARD
  |--------------------------------------------------------------------------
  */

  const loadDashboard =
    useCallback(async () => {
      setRefreshing(true);
      setError("");

      Promise.all([
        fetch(
          "/api/admin/overview",
          {
            cache: "no-store",
          }
        ),

        fetch(
          "/api/admin/health",
          {
            cache: "no-store",
          }
        ),

        fetch(
          "/api/admin/sale",
          {
            cache: "no-store",
          }
        ),

        fetch(
          "/api/admin/chart",
          {
            cache: "no-store",
          }
        ),
      ])
        .then(
          async (responses) => {
            if (
              responses.some(
                (response) =>
                  response.status ===
                  401
              )
            ) {
              router.replace(
                "/admin/login"
              );

              return null;
            }

            const [
              overviewResponse,
              healthResponse,
              saleResponse,
              chartResponse,
            ] = await Promise.all(
              responses.map(
                (response) =>
                  response.json()
              )
            );

            if (
              !overviewResponse.ok
            ) {
              throw new Error(
                overviewResponse.error ??
                  "Overview failed"
              );
            }

            if (
              !healthResponse.ok
            ) {
              throw new Error(
                healthResponse.error ??
                  "Health failed"
              );
            }

            if (
              !saleResponse.ok
            ) {
              throw new Error(
                saleResponse.error ??
                  "Sale settings failed"
              );
            }

            if (
              !chartResponse.ok
            ) {
              throw new Error(
                chartResponse.error ??
                  "Chart failed"
              );
            }

            return [
              overviewResponse.stats,
              healthResponse.health,
              saleResponse.settings,
              chartResponse.days,
            ] as [
              Overview,
              Health,
              Sale,
              Day[],
            ];
          }
        )
        .then((data) => {
          if (!data) {
            return;
          }

          setOverview(data[0]);
          setHealth(data[1]);
          setSale(data[2]);
          setDays(data[3]);
        })
        .catch((err) => {
          setError(
            err instanceof Error
              ? err.message
              : "Dashboard error."
          );
        })
        .finally(() => {
          setRefreshing(false);
        });
    }, [router]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  /*
  |--------------------------------------------------------------------------
  | LOADING / ERROR
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <div className="p-8 text-red-400">
        Admin v3 error: {error}
      </div>
    );
  }

  if (
    !overview ||
    !health ||
    !sale
  ) {
    return (
      <div className="p-8 text-white/40">
        Завантаження Admin Panel
        v3...
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | VALUES
  |--------------------------------------------------------------------------
  */

  const presale =
    sale.presale;

  const presaleProgress =
    Math.min(
      100,
      Math.max(
        0,
        presale.progress
      )
    );

  const presaleCapacitySol =
    sale.rcxPerSol > 0
      ? presale.remaining /
        sale.rcxPerSol
      : 0;

  const protectedReserve =
    Math.max(
      0,
      health.saleWallet.rcx -
        presale.remaining
    );

  const maxPurchases =
    Math.max(
      1,
      ...days.map(
        (day) => day.purchases
      )
    );

  const cards = [
    [
      "SOL received",
      formatSol(
        overview.solReceived
      ),
    ],

    [
      "RCX sold",
      formatRcx(
        presale.sold
      ),
    ],

    [
      "Delivered",
      overview.delivered.toLocaleString(),
    ],

    [
      "Unique buyers",
      overview.uniqueBuyers.toLocaleString(),
    ],
  ];

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="px-6 py-10">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-green-400">
            RaccoonX CONTROL CENTER
          </p>

          <h1 className="mt-2 text-3xl font-black">
            Overview
          </h1>

          <p className="mt-2 text-white/40">
            Продажі, presale allocation
            та стан інфраструктури.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              void loadDashboard()
            }
            disabled={refreshing}
            className="
              rounded-xl
              border
              border-white/10
              px-4
              py-2
              text-xs
              font-bold
              text-white/60
              hover:bg-white/[0.05]
              disabled:opacity-40
            "
          >
            {refreshing
              ? "Refreshing..."
              : "↻ Refresh"}
          </button>

          <div
            className={`
              w-fit
              rounded-full
              border
              px-4
              py-2
              text-xs
              font-black
              ${
                sale.active
                  ? "border-green-400/20 bg-green-400/[0.06] text-green-400"
                  : "border-red-400/20 bg-red-400/[0.06] text-red-300"
              }
            `}
          >
            {sale.active
              ? "● SALE ACTIVE"
              : "● SALE PAUSED"}
          </div>
        </div>
      </div>

      {/* TOP STATS */}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(
          ([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-6"
            >
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/35">
                {label}
              </p>

              <p className="mt-3 text-3xl font-black">
                {value}
              </p>
            </div>
          )
        )}
      </div>

      {/* PRESALE */}

      <div className="mt-4 rounded-2xl border border-purple-400/20 bg-purple-400/[0.025] p-6">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-black">
              Presale Allocation
            </p>

            <p className="mt-1 text-xs text-white/30">
              Максимальна кількість RCX,
              яку backend дозволяє
              продати через presale.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs uppercase tracking-[0.14em] text-white/30">
              Progress
            </p>

            <p className="mt-1 text-2xl font-black text-purple-300">
              {presaleProgress.toLocaleString(
                "en-US",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                }
              )}
              %
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            label="Allocation"
            value={`${formatRcx(
              presale.cap
            )} RCX`}
          />

          <Metric
            label="Sold"
            value={`${formatRcx(
              presale.sold
            )} RCX`}
          />

          <Metric
            label="Reserved"
            value={`${formatRcx(
              presale.reserved
            )} RCX`}
          />

          <Metric
            label="Remaining"
            value={`${formatRcx(
              presale.remaining
            )} RCX`}
          />
        </div>

        {/* PROGRESS BAR */}

        <div className="mt-6">
          <div className="h-3 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-green-400 transition-all duration-500"
              style={{
                width: `${presaleProgress}%`,
              }}
            />
          </div>

          <div className="mt-3 flex flex-col justify-between gap-1 text-xs text-white/30 sm:flex-row">
            <span>
              {formatRcx(
                presale.sold
              )}{" "}
              RCX delivered
            </span>

            <span>
              {formatRcx(
                presale.remaining
              )}{" "}
              RCX remaining
            </span>
          </div>
        </div>
      </div>

      {/* WALLET + SUPPLY */}

      <div className="mt-4 grid gap-4 xl:grid-cols-3">

        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 xl:col-span-2">

          <div className="flex items-center justify-between">
            <div>
              <p className="font-black">
                Sale Wallet
              </p>

              <p className="mt-1 font-mono text-xs text-white/30">
                {short(
                  health.saleWallet
                    .address
                )}
              </p>
            </div>

            <a
              href={`https://solscan.io/account/${health.saleWallet.address}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-purple-400"
            >
              Solscan ↗
            </a>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <Metric
              label="SOL balance"
              value={formatSol(
                health.saleWallet.sol
              )}
            />

            <Metric
              label="Wallet RCX"
              value={formatRcx(
                health.saleWallet.rcx
              )}
            />

            <Metric
              label="Presale remaining"
              value={formatRcx(
                presale.remaining
              )}
            />

            <Metric
              label="Remaining capacity"
              value={`${presaleCapacitySol.toLocaleString(
                "en-US",
                {
                  maximumFractionDigits: 4,
                }
              )} SOL`}
            />
          </div>

          <p className="mt-5 text-xs leading-5 text-white/30">
            На Sale Wallet фізично
            знаходиться{" "}
            {formatRcx(
              health.saleWallet.rcx
            )}{" "}
            RCX. Через presale backend
            дозволяє продати максимум{" "}
            {formatRcx(
              presale.cap
            )}{" "}
            RCX.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">

          <p className="font-black">
            Token Supply
          </p>

          <p className="mt-1 text-xs text-white/30">
            Mint supply on Solana
          </p>

          <p className="mt-6 text-3xl font-black">
            {formatRcx(
              health.token.supply
            )}
          </p>

          <p className="mt-2 text-sm text-green-400">
            RCX
          </p>

          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="text-xs text-white/30">
              Protected / non-presale
              balance on Sale Wallet
            </p>

            <p className="mt-2 text-xl font-black text-white/70">
              {formatRcx(
                protectedReserve
              )}{" "}
              RCX
            </p>
          </div>
        </div>
      </div>

      {/* CHART + HEALTH */}

      <div className="mt-4 grid gap-4 xl:grid-cols-3">

        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 xl:col-span-2">

          <div>
            <p className="font-black">
              Purchases — last 14
              days
            </p>

            <p className="mt-1 text-xs text-white/30">
              Delivered purchases
              per day
            </p>
          </div>

          <div className="mt-8 flex h-52 items-end gap-2">
            {days.length === 0 ? (
              <div className="m-auto text-sm text-white/30">
                Ще немає даних для
                графіка.
              </div>
            ) : (
              days.map((day) => (
                <div
                  key={day.day}
                  className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="text-[10px] text-white/35">
                    {day.purchases}
                  </span>

                  <div
                    className="w-full max-w-12 rounded-t-md bg-gradient-to-t from-purple-500 to-green-400"
                    style={{
                      height: `${Math.max(
                        5,
                        (day.purchases /
                          maxPurchases) *
                          150
                      )}px`,
                    }}
                    title={`${day.purchases} purchases`}
                  />

                  <span className="max-w-full truncate text-[9px] text-white/25">
                    {new Date(
                      day.day
                    ).toLocaleDateString(
                      undefined,
                      {
                        day: "2-digit",
                        month: "2-digit",
                      }
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">

          <p className="font-black">
            Sale Health
          </p>

          <div className="mt-5 space-y-3">
            <HealthRow
              label="Solana RPC"
              ok={health.rpc}
            />

            <HealthRow
              label="Neon Database"
              ok={health.database}
            />

            <HealthRow
              label="Sale Wallet"
              ok={Boolean(
                health.saleWallet
                  .address
              )}
            />

            <HealthRow
              label="Treasury"
              ok={Boolean(
                health.treasury
                  .address
              )}
            />
          </div>

          <div className="mt-6 border-t border-white/10 pt-5 text-xs text-white/30">
            Solana slot:{" "}
            {health.slot.toLocaleString(
              "en-US"
            )}
          </div>
        </div>
      </div>

      {/* SECONDARY STATS */}

      <div className="mt-4 grid gap-4 sm:grid-cols-3">

        <MetricBox
          label="Processing"
          value={overview.processing.toLocaleString()}
        />

        <MetricBox
          label="Failed"
          value={overview.failed.toLocaleString()}
        />

        <MetricBox
          label="Treasury SOL"
          value={formatSol(
            health.treasury.sol
          )}
        />
      </div>

      <VisitorAnalytics />
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| SMALL COMPONENTS
|--------------------------------------------------------------------------
*/

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/20 p-4">
      <p className="text-xs text-white/30">
        {label}
      </p>

      <p className="mt-2 text-xl font-black">
        {value}
      </p>
    </div>
  );
}

function MetricBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/35">
        {label}
      </p>

      <p className="mt-3 text-2xl font-black">
        {value}
      </p>
    </div>
  );
}

function HealthRow({
  label,
  ok,
}: {
  label: string;
  ok: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3">

      <span className="text-sm text-white/55">
        {label}
      </span>

      <span
        className={
          ok
            ? "text-xs font-black text-green-400"
            : "text-xs font-black text-red-400"
        }
      >
        {ok
          ? "● ONLINE"
          : "● ERROR"}
      </span>
    </div>
  );
}