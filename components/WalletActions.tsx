"use client";

import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton, WalletDisconnectButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

type Props = {
  setNetwork: (val: "devnet" | "mainnet-beta") => void;
  currentNetwork: "devnet" | "mainnet-beta";
};

export default function WalletActions({ setNetwork, currentNetwork }: Props) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [lamports, setLamports] = useState<number>(0);
  const [recipient, setRecipient] = useState<PublicKey | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [recipientInput, setRecipientInput] = useState<string>("");
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  useEffect(() => {
    setIsFormValid(!!publicKey && !!recipient && lamports > 0);
  }, [publicKey, recipient, lamports]);

  async function handleSend() {
    if (!publicKey || !recipient || !sendTransaction) {
      toast.error("Wallet not connected or recipient not set");
      return;
    }

    setIsProcessing(true);
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipient,
          lamports,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      
      toast.success("Transaction initiated!", { id: "transaction-pending" });
      
      await connection.confirmTransaction(signature, "confirmed");
      
      toast.success("Transaction successful!", {
        id: "transaction-confirmed", 
        icon: "(●'◡'●)"
      });
      
      console.log("Transaction details", signature);
      
      setLamports(0);
      setRecipientInput("");
      setRecipient(null);
    } catch (error) {
      console.error(error);
      toast.error("Transaction failed", { icon: "❌" });
    } finally {
      setIsProcessing(false);
    }
  }

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientInput(e.target.value);
    try {
      if (e.target.value.trim() !== "") {
        setRecipient(new PublicKey(e.target.value));
      } else {
        setRecipient(null);
      }
    } catch (err) {
      setRecipient(null);
      if (e.target.value.trim() !== "") {
        toast.error("Invalid Public Key", { id: "invalid-key" });
      }
    }
  };

  const handleNetworkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedNetwork = e.target.value as "devnet" | "mainnet-beta";
    setNetwork(selectedNetwork);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } }
  };

  const networkColors = {
    "devnet": "bg-emerald-500",
    "mainnet-beta": "bg-blue-500"
  };

  return (
    <div className="max-w-2xl mx-auto text-white space-y-4">
      <AnimatePresence>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <div>
            <WalletMultiButton />
          </div>

          <motion.div variants={itemVariants} className="text-center space-y-4">
            <h2 className="text-xl">Send SOL</h2>

            <input
              type="text"
              className="w-full p-3 rounded-lg text-black bg-gray-100 mb-4"
              value={recipientInput}
              onChange={handleRecipientChange}
              placeholder="Recipient Public Key"
            />

            <div className="flex justify-between mb-4">
              <input
                type="number"
                className="w-3/4 p-3 rounded-lg text-black bg-gray-100"
                min={1}
                step={10000}
                value={lamports}
                onChange={(e) => setLamports(Number(e.target.value))}
                placeholder="Amount in SOL"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center space-y-4">
            <select
              className="w-full p-3 rounded-lg bg-gray-100 text-black"
              value={currentNetwork}
              onChange={handleNetworkChange}
            >
              <option value="devnet">Devnet</option>
              <option value="mainnet-beta">Mainnet</option>
            </select>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="text-center space-y-4"
          >
            <Button
              onClick={handleSend}
              disabled={!isFormValid || isProcessing}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {isProcessing ? "Processing..." : "Send"}
            </Button>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <Toaster />
    </div>
  );
}
