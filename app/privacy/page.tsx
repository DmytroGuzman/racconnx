import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | RACCOONX",
  description: "Privacy Policy for RACCOONX.",
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>

          <p className="mt-4 text-sm text-white/35">
            Last updated: September 2026
          </p>
        </div>

        <div className="mt-12 space-y-10 text-sm leading-7 text-white/55 sm:text-base">
          <Section title="1. Overview">
            This Privacy Policy explains how information may be collected,
            processed, and stored when you access or interact with the RACCOONX
            website and RCX token sale.
          </Section>

          <Section title="2. Information We May Process">
            Depending on how you use the website, RACCOONX may process
            technical information required for security and analytics, wallet
            addresses used in token purchases, blockchain transaction
            signatures, transaction amounts, purchase status, and related
            operational records.
          </Section>

          <Section title="3. Blockchain Information">
            Public blockchain networks such as Solana are transparent by
            design. Wallet addresses and blockchain transactions may be
            publicly visible and permanently recorded independently of
            RACCOONX.
          </Section>

          <Section title="4. Analytics and Security">
            We may process limited technical information to understand website
            usage, measure visitor activity, prevent abuse, enforce rate
            limits, diagnose errors, and maintain the security and reliability
            of the service.
          </Section>

          <Section title="5. Wallet Connections">
            Connecting a supported wallet allows the website to interact with
            the public wallet address exposed by the wallet provider. RACCOONX
            does not need your seed phrase or private key and you should never
            provide them to anyone claiming to represent RACCOONX.
          </Section>

          <Section title="6. How Information Is Used">
            Information may be used to process and verify token purchases,
            deliver RCX, prevent duplicate or fraudulent transactions, provide
            website functionality, maintain security, troubleshoot technical
            issues, and understand aggregate website activity.
          </Section>

          <Section title="7. Service Providers">
            RACCOONX may rely on infrastructure and service providers for
            hosting, databases, blockchain connectivity, wallet interaction,
            and other technical functionality. Such providers may process
            limited information as necessary to provide their services.
          </Section>

          <Section title="8. Data Retention">
            Operational and transaction records may be retained where
            reasonably necessary for security, fraud prevention, transaction
            verification, dispute handling, technical operations, or legal
            obligations. Information recorded on a public blockchain cannot
            generally be deleted by RACCOONX.
          </Section>

          <Section title="9. Security">
            Reasonable technical measures are used to protect systems and
            information under our control. However, no website, database,
            blockchain network, wallet, or online service can be guaranteed to
            be completely secure.
          </Section>

          <Section title="10. Changes to This Policy">
            This Privacy Policy may be updated as the project, website,
            technology, or applicable requirements evolve. The current version
            will be made available on this page.
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