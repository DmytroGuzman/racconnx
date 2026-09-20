import Link from "next/link";

export const metadata = {
  title: "Risk Disclaimer | RACCOONX",
  description: "Important risk information regarding RCX and RACCOONX.",
};

export default function RiskPage() {
  return (
    <main className="min-h-screen bg-[#030407] px-6 py-20 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="text-sm font-bold text-purple-400 transition hover:text-purple-300"
        >
          ← Back to RACCOONX
        </Link>

        <div className="mt-10">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-red-400">
            Important
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Risk Disclaimer
          </h1>

          <p className="mt-4 text-sm text-white/35">
            Last updated: September 2026
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-6">
          <p className="font-bold leading-7 text-red-200/80">
            Crypto assets involve significant risk. You should never purchase
            RCX with funds you cannot afford to lose.
          </p>
        </div>

        <div className="mt-12 space-y-10 text-sm leading-7 text-white/55 sm:text-base">
          <Section title="1. High-Risk Crypto Asset">
            RCX is a crypto asset and may experience substantial price
            volatility. Its value may increase, decrease significantly, or
            potentially fall to zero.
          </Section>

          <Section title="2. No Guaranteed Return">
            Purchasing or holding RCX does not guarantee any return, profit,
            income, appreciation, liquidity, or future market value.
          </Section>

          <Section title="3. Liquidity Risk">
            There is no guarantee that sufficient liquidity or an active market
            for RCX will exist or continue to exist. You may be unable to sell
            or exchange RCX at a desired price or at all.
          </Section>

          <Section title="4. Market Risk">
            Crypto markets can be highly volatile and may be affected by
            speculation, market sentiment, liquidity, regulation, technical
            events, broader economic conditions, and factors outside the
            control of RACCOONX.
          </Section>

          <Section title="5. Blockchain Risk">
            RCX operates using blockchain infrastructure. Transactions may be
            affected by congestion, outages, software defects, protocol
            changes, forks, validator issues, network fees, or other technical
            events.
          </Section>

          <Section title="6. Wallet and Custody Risk">
            Loss or compromise of private keys, seed phrases, wallet access, or
            devices may result in permanent loss of crypto assets. Users are
            responsible for securing their own wallets and credentials.
          </Section>

          <Section title="7. Irreversible Transactions">
            Blockchain transactions may be irreversible. Transactions sent to
            an incorrect address, on an incorrect network, or with incorrect
            parameters may not be recoverable.
          </Section>

          <Section title="8. Regulatory Risk">
            Laws and regulations concerning crypto assets may change. New
            restrictions, taxation rules, classifications, or other regulatory
            actions may affect RCX, its availability, or your ability to use,
            transfer, purchase, or sell it.
          </Section>

          <Section title="9. Technical and Smart-Contract Risk">
            Blockchain tokens and supporting software may contain unknown
            defects, vulnerabilities, incompatibilities, or other technical
            risks despite testing and security measures.
          </Section>

          <Section title="10. Third-Party Risk">
            Wallet providers, exchanges, RPC providers, blockchain
            infrastructure, hosting providers and other third parties operate
            independently from RACCOONX. Their failures or actions may affect
            your ability to interact with RCX.
          </Section>

          <Section title="11. No Financial Advice">
            RACCOONX content does not constitute investment, financial, legal,
            tax, or professional advice. You are responsible for evaluating
            your own circumstances and obtaining independent professional
            advice where appropriate.
          </Section>

          <Section title="12. Your Responsibility">
            By purchasing or using RCX, you acknowledge the risks associated
            with crypto assets and blockchain technology and accept
            responsibility for your own decisions and transactions.
          </Section>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-black text-white">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}