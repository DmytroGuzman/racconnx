import Link from "next/link";

export const metadata = {
  title: "Terms of Use | RACCOONX",
  description: "Terms of Use for the RACCOONX website and RCX ecosystem.",
};

export default function TermsPage() {
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
          <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-400">
            Legal
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Terms of Use
          </h1>

          <p className="mt-4 text-sm text-white/35">
            Last updated: September 2026
          </p>
        </div>

        <div className="mt-12 space-y-10 text-sm leading-7 text-white/55 sm:text-base">
          <Section title="1. Acceptance of Terms">
            By accessing or using the RACCOONX website, purchasing or
            interacting with RCX, or using any related RACCOONX services, you
            acknowledge that you have read, understood, and agree to these
            Terms of Use.
          </Section>

          <Section title="2. Eligibility">
            You are responsible for ensuring that your access to and use of
            RACCOONX and RCX is lawful in your jurisdiction. You must not use
            the website or purchase RCX where doing so would violate applicable
            laws, regulations, sanctions, or other legal restrictions.
          </Section>

          <Section title="3. RCX Token">
            RCX is a blockchain-based crypto token operating on the Solana
            network. RCX is not represented as a bank deposit, security,
            guaranteed investment, or guaranteed store of value. Holding RCX
            does not by itself provide ownership, equity, voting rights, profit
            rights, or a claim against RACCOONX unless expressly stated
            otherwise.
          </Section>

          <Section title="4. Token Purchases">
            Before approving a transaction, you are responsible for checking
            the wallet address, token amount, SOL amount, network, and all other
            transaction information. Blockchain transactions may be
            irreversible once submitted or confirmed.
          </Section>

          <Section title="5. Wallets and Security">
            You are solely responsible for the security of your wallet, private
            keys, seed phrases, devices, and credentials. RACCOONX will never
            require your wallet seed phrase or private key to complete a normal
            token purchase.
          </Section>

          <Section title="6. Blockchain and Third-Party Services">
            RACCOONX relies on third-party technologies and services including
            the Solana network, wallet software, RPC infrastructure and other
            blockchain services. RACCOONX cannot guarantee the continuous
            availability, performance, security, or operation of third-party
            systems.
          </Section>

          <Section title="7. Availability and Maintenance">
            The website, token sale, or individual features may be modified,
            paused, restricted, or temporarily unavailable for maintenance,
            security, technical, operational, or legal reasons.
          </Section>

          <Section title="8. Prohibited Use">
            You may not use RACCOONX for unlawful activity, fraud, abuse,
            interference with the website or infrastructure, attempts to bypass
            security measures, automated attacks, or activity that violates
            applicable laws or third-party rights.
          </Section>

          <Section title="9. No Financial Advice">
            Information provided by RACCOONX is for general informational
            purposes only. Nothing on the website constitutes investment,
            financial, legal, tax, or other professional advice.
          </Section>

          <Section title="10. No Guarantee">
            RACCOONX makes no guarantee regarding the future value, market
            price, liquidity, adoption, availability, profitability, or
            performance of RCX.
          </Section>

          <Section title="11. Limitation of Liability">
            To the maximum extent permitted by applicable law, RACCOONX and its
            contributors are not responsible for losses arising from market
            movements, wallet compromise, user error, blockchain failures,
            third-party services, incompatible software, network congestion,
            transaction fees, or other risks inherent to crypto assets and
            decentralized networks.
          </Section>

          <Section title="12. Changes to These Terms">
            These Terms may be updated as RACCOONX develops or as legal,
            technical, or operational requirements change. The current version
            will be published on this page.
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