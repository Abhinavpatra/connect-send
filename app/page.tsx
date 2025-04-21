"use client";

import { useEffect, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
} from "@solana/wallet-adapter-react-ui";

import {
  BackpackWalletAdapter,
  BackpackWalletName,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import '@solana/wallet-adapter-react-ui/styles.css';


import dynamic from "next/dynamic";
const WalletActions = dynamic(() => import("../components/WalletActions"), { ssr: false });

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [network, setNetwork] = useState<"devnet" | "mainnet-beta">("devnet");

  useEffect(() => setIsClient(true), []);
  if (!isClient) return null;

  const endpoint =
    network === "mainnet-beta"
      ? "https://api.mainnet-beta.solana.com"
      : "https://api.devnet.solana.com";

  const wallets = [
    new PhantomWalletAdapter({ network }),
    new BackpackWalletAdapter({network}),
  ];

  return (
    <ConnectionProvider endpoint={endpoint} key={network}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletActions setNetwork={setNetwork} currentNetwork={network} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
