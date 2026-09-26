import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    name: "RaccoonX",
    symbol: "RCX",
    network: "Solana",
    website: "https://www.raccoonx.xyz",
    projectWallet: "27u67F7pogx1yZ5w7GPXAMkMPtyPWZwWcWvzq5erM6kP",
  });
}
