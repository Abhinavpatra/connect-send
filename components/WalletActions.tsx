"use client";

import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";
import {
  ComputeBudgetProgram,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

type Props = {
  setNetwork: (val: "devnet" | "mainnet-beta") => void;
  currentNetwork: "devnet" | "mainnet-beta";
  onTransactionComplete: (signature: string) => void;
};

export default function WalletActions({ setNetwork, currentNetwork, onTransactionComplete }: Props) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, disconnect, connected } = useWallet();

  const [lamports, setLamports] = useState<number>(0);
  const [recipient, setRecipient] = useState<PublicKey | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [recipientInput, setRecipientInput] = useState<string>("");
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  useEffect(() => {
    setIsFormValid(!!publicKey && !!recipient && lamports > 0);
  }, [publicKey, recipient, lamports]);

  // Check connection health
  const checkConnection = async () => {
    try {
      const slot = await connection.getSlot();
      console.log("✅ Connection healthy, current slot:", slot);
      return true;
    } catch (error) {
      console.error("❌ Connection issue:", error);
      toast.error("Network connection problem");
      return false;
    }
  };

  // Enhanced confirmation with polling
  const confirmTransactionWithPolling = async (signature: string, maxRetries = 30) => {
    const startTime = Date.now();
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        const status = await connection.getSignatureStatus(signature);
        console.log(`🔍 Transaction status (attempt ${retries + 1}):`, status);
        
        if (status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized') {
          if (status.value.err) {
            throw new Error(`Transaction failed: ${JSON.stringify(status.value.err)}`);
          }
          console.log(`✅ Transaction confirmed after ${Date.now() - startTime}ms`);
          return true;
        }
        
        // If we get a null status after many attempts, check if transaction exists
        if (status.value === null && retries > 10) {
          const txInfo = await connection.getTransaction(signature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0
          });
          
          if (txInfo && !txInfo.meta?.err) {
            console.log(`✅ Transaction found and successful despite null status`);
            return true;
          }
        }
        
        // Wait before next check (exponential backoff)
        const delay = Math.min(1000 + (retries * 200), 3000);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
        
      } catch (error) {
        console.log(`⚠️ Status check error (attempt ${retries + 1}):`, error);
        retries++;
        
        if (retries >= maxRetries) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error("Transaction confirmation timeout after 30 attempts");
  };

  async function handleSend() {
    if (!publicKey || !recipient || !sendTransaction) {
      toast.error("Wallet not connected or recipient not set");
      return;
    }

    console.log("🚀 Starting transaction:", { 
      publicKey: publicKey.toString(), 
      recipient: recipient.toString(), 
      lamports,
      network: currentNetwork
    });

    setIsProcessing(true);
    
    try {
      // Check connection health first
      if (!(await checkConnection())) {
        return;
      }

      // Check balance
      const balance = await connection.getBalance(publicKey);
      console.log(`💰 Current balance: ${balance} lamports`);
      
      if (lamports > balance) {
        toast.error(`Insufficient funds. Balance: ${balance} lamports, Required: ${lamports} lamports`);
        return;
      }

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipient,
          lamports,
        })
      );

      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      console.log("📋 Transaction created with blockhash:", blockhash);

      // Add priority fee
      try {
        const priorityFee = await connection.getRecentPrioritizationFees();
        const maxPriorityFeePerCompute = priorityFee.length ? Math.max(...priorityFee.map(fee => fee.prioritizationFee)) : 1000;
        
        if (maxPriorityFeePerCompute > 0) {
          transaction.instructions.unshift(
            ComputeBudgetProgram.setComputeUnitPrice({ microLamports: maxPriorityFeePerCompute })
          );
          console.log("💸 Added priority fee:", maxPriorityFeePerCompute);
        }
      } catch (feeError) {
        console.warn("⚠️ Could not get priority fees, continuing without:", feeError);
      }

      // Send transaction
      console.log("📤 Sending transaction...");
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: "confirmed",
        maxRetries: 3,
      });

      console.log("📨 Transaction sent with signature:", signature);
      toast.loading("Transaction sent! Confirming...", { id: "tx-status" });

      // Confirm transaction with enhanced polling
      try {
        await confirmTransactionWithPolling(signature);
        
        console.log("🎉 Transaction confirmed successfully:", signature);
        toast.success("Transaction confirmed successfully!", { id: "tx-status" });
        
        // Success! Update UI
        onTransactionComplete(signature);
        setLamports(0);
        setRecipientInput("");
        setRecipient(null);
        
      } catch (confirmError) {
        console.warn("⚠️ Confirmation failed, checking transaction status manually:", confirmError);
        
        // Even if confirmation fails, check if transaction actually succeeded
        try {
          const txInfo = await connection.getTransaction(signature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0
          });
          
          if (txInfo && !txInfo.meta?.err) {
            console.log("✅ Transaction actually succeeded despite confirmation error");
            toast.success("Transaction completed successfully!", { id: "tx-status" });
            
            onTransactionComplete(signature);
            setLamports(0);
            setRecipientInput("");
            setRecipient(null);
          } else {
            throw new Error("Transaction failed or not found");
          }
        } catch (lookupError) {
          console.error("❌ Transaction lookup also failed:", lookupError);
          throw confirmError;
        }
      }

    } catch (error) {
      console.error("❌ Transaction error:", error);
      const errorMessage = error instanceof Error ? error.message : "Transaction failed";
      toast.error(errorMessage, { id: "tx-status", duration: 6000 });
    } finally {
      setIsProcessing(false);
      console.log("🏁 Transaction process completed");
    }
  }

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setRecipientInput(value);
    
    try {
      if (value !== "") {
        const pubkey = new PublicKey(value);
        setRecipient(pubkey);
        console.log("✅ Valid recipient address:", pubkey.toString());
      } else {
        setRecipient(null);
      }
    } catch (err) {
      setRecipient(null);
      if (value !== "") {
        toast.error("Invalid Public Key format", { id: "invalid-key" });
      }
    }
  };

  const handleNetworkChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedNetwork = e.target.value as "devnet" | "mainnet-beta";
    
    console.log("🔄 Switching network to:", selectedNetwork);
    
    if (connected) {
      toast.info("Network changed. Please reconnect your wallet.", { duration: 4000 });
    }
    
    setNetwork(selectedNetwork);
    
    // Clear form when switching networks
    setLamports(0);
    setRecipientInput("");
    setRecipient(null);
  };

  const handleLamportsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setLamports(value);
    
    if (value > 0) {
      const solAmount = (value / 1_000_000_000).toFixed(9);
      console.log(`💰 Amount set: ${value} lamports (${solAmount} SOL)`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } },
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 text-white">
      <AnimatePresence>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6 p-6 bg-gray-800 bg-opacity-50 border border-gray-700 backdrop-blur-sm rounded-xl"
        >
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-center">Wallet Connection</h2>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
              {connected && (
                <WalletDisconnectButton className="!bg-red-600 hover:!bg-red-700" />
              )}
            </div>
          </motion.div>

          {connected && (
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="text-center">
                <h2 className="mb-2 text-xl font-semibold">Send SOL</h2>
                <p className="text-sm text-gray-400">
                  Current Network: <span className="font-medium text-blue-400">{currentNetwork}</span>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Network Selection
                  </label>
                  <select
                    className="w-full p-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={currentNetwork}
                    onChange={handleNetworkChange}
                  >
                    <option value="devnet">Devnet (Testing)</option>
                    <option value="mainnet-beta">Mainnet (Live)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Recipient Public Key
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 text-white placeholder-gray-400 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={recipientInput}
                    onChange={handleRecipientChange}
                    placeholder="Enter recipient's public key (44 characters)"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Amount (Lamports)
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 text-white placeholder-gray-400 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={0}
                    step={1000000}
                    value={lamports || ""}
                    onChange={handleLamportsChange}
                    placeholder="Amount in Lamports (1 SOL = 1,000,000,000 Lamports)"
                  />
                  {lamports > 0 && (
                    <p className="mt-1 text-sm text-gray-400">
                      ≈ {(lamports / 1_000_000_000).toFixed(9)} SOL
                    </p>
                  )}
                </div>

                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    onClick={handleSend}
                    disabled={!isFormValid || isProcessing}
                    className={`w-full p-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                      !isFormValid || isProcessing
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 shadow-lg"
                    }`}
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing Transaction...
                      </span>
                    ) : (
                      "Send Transaction"
                    )}
                  </Button>
                </motion.div>

                {!isFormValid && (
                  <div className="space-y-1 text-sm text-gray-400">
                    <p>Please ensure:</p>
                    <ul className="ml-2 space-y-1 list-disc list-inside">
                      {!publicKey && <li>Wallet is connected</li>}
                      {!recipient && <li>Valid recipient address is entered</li>}
                      {lamports <= 0 && <li>Amount is greater than 0</li>}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <Toaster position="top-right" />
    </div>
  );
}