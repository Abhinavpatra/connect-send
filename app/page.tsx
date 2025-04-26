"use client";

import { useEffect, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  BackpackWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";
import { motion } from "framer-motion";
import Head from "next/head";
import dynamic from "next/dynamic";

const WalletActions = dynamic(() => import("../components/WalletActions"), {
  ssr: false,
});

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [network, setNetwork] = useState<"devnet" | "mainnet-beta">("devnet");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const pageTitle = "Solana Wallet Interface | Send SOL Securely";
  const pageDescription =
    "A secure and user-friendly interface for Solana blockchain transactions. Connect your wallet, switch between Devnet and Mainnet, and send SOL with ease.";

  if (!isClient) return null;

  const endpoint =
    network === "mainnet-beta"
      ? "https://solana-mainnet.g.alchemy.com/v2/evy7U6UHvsxE1k-bFd2THsXEfI58v8Kq"
      : "https://solana-devnet.g.alchemy.com/v2/evy7U6UHvsxE1k-bFd2THsXEfI58v8Kq";

  const wallets = [
    new PhantomWalletAdapter({ network }),
    new BackpackWalletAdapter({ network }),
    //@ts-ignore
    new SolflareWalletAdapter({ network }),
    //@ts-ignore
    new TorusWalletAdapter({ network }),
  ];

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.6 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="Solana, Wallet, SOL, Cryptocurrency, Blockchain, Web3" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Head>

      <motion.main
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4"
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-screen">
            <motion.div
              animate={{
                rotate: 360,
                transition: { duration: 1.5, repeat: Infinity, ease: "linear" },
              }}
              className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full"
            />
          </div>
        ) : (
          <div className="container mx-auto">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center mb-10"
            >
              <h1 className="text-4xl font-bold text-white mb-2">
                Solana {network === "devnet" ? "Devnet" : "Mainnet"} Interface
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Connect your wallet, switch networks, and execute transactions securely on the Solana blockchain.
              </p>
            </motion.div>

            <ConnectionProvider endpoint={endpoint} key={network}>
              <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                  <WalletActions setNetwork={setNetwork} currentNetwork={network} />
                </WalletModalProvider>
              </WalletProvider>
            </ConnectionProvider>

            <motion.footer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-16 text-center text-gray-500 text-sm"
            >
              <p>
                This interface allows you to interact with the Solana {network} network.
                Please ensure you're using the correct network for your transactions.
              </p>
              <p className="mt-2">
                © {new Date().getFullYear()} Solana Wallet Interface · All transactions are executed on-chain
              </p>
            </motion.footer>
          </div>
        )}
      </motion.main>
    </>
  );
}
