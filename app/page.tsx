"use client";

import { useEffect, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  // BackpackWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";
import { motion } from "framer-motion";
import Head from "next/head";
import dynamic from "next/dynamic";
import { Toaster, toast } from "react-hot-toast";

const WalletActions = dynamic(() => import("../components/WalletActions"), {
  ssr: false,
});

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [network, setNetwork] = useState<"devnet" | "mainnet-beta">("devnet");
  const [isLoading, setIsLoading] = useState(true);
  const [lastSignature, setLastSignature] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleTransactionComplete = (signature: string) => {
    console.log("🎉 Transaction completed successfully:", signature);
    setLastSignature(signature);
    toast.success("Transaction completed! Signature at the bottom.");
  };

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
    // new BackpackWalletAdapter({ network }),
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
        className="min-h-screen px-4 py-12 bg-gradient-to-b from-gray-900 to-black"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-screen">
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
              className="mb-10 text-center"
            >
              <h1 className="mb-2 text-4xl font-bold text-white">
                Solana {network === "devnet" ? "Devnet" : "Mainnet"} Interface
              </h1>
              <p className="max-w-2xl mx-auto text-gray-400">
                Connect your wallet, switch networks, and execute transactions securely on the Solana blockchain.
              </p>
            </motion.div>

            <ConnectionProvider endpoint={endpoint} key={network}>
              <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                  <WalletActions 
                    setNetwork={setNetwork} 
                    currentNetwork={network} 
                    onTransactionComplete={handleTransactionComplete} 
                  />
                </WalletModalProvider>
              </WalletProvider>
            </ConnectionProvider>

            <motion.footer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-16 text-sm text-center text-gray-500"
            >
              <p>
                This interface allows you to interact with the Solana {network} network.
                Please ensure you're using the correct network for your transactions.
              </p>
              <p className="mt-2">
                © {new Date().getFullYear()} Solana Wallet Interface · All transactions are executed on-chain
              </p>
              {lastSignature && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="p-4 mt-6 text-white bg-gray-800 border border-gray-700 rounded-lg"
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-medium text-gray-300">Last Transaction Signature</h3>
                    <div className="text-sm break-all">
                      <span className="text-gray-400">Signature: </span>
                      <a
  href={`https://explorer.solana.com/tx/${lastSignature}${network === 'devnet' ? '?cluster=devnet' : ''}`}
  target="_blank"
  rel="noopener noreferrer"
  className="text-blue-400 transition-colors hover:text-blue-300"
>
  {lastSignature}
</a>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.footer>
            <Toaster position="top-right" />
          </div>
        )}
      </motion.main>
    </>
  );
}