"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton, WalletDisconnectButton } from "@solana/wallet-adapter-react-ui";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { toast, Toaster } from "react-hot-toast";

type Props = {
  setNetwork: (val: "devnet" | "mainnet-beta") => void;
  currentNetwork: "devnet" | "mainnet-beta";
};

export default function WalletActions({ setNetwork, currentNetwork }: Props) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [lamports, setLamports] = useState<number>(0);
  const [recipient, setRecipient] = useState<PublicKey | null>(null);

  async function handleSend()  {
    if (!publicKey || !recipient || !sendTransaction) {
      toast.error("Wallet not connected or recipient not set");
      return;
    }

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
      await connection.confirmTransaction(signature, "confirmed");
      toast.success("Transaction successful!");
      console.log("Transaction details", signature);
    } catch (error) {
      console.error(error);
      toast.error("Transaction failed");
    }
  };

  return (
    <div className="p-4">
      <Toaster position="top-right" />

      <div className="flex gap-4 mb-4">
        <WalletMultiButton />
        <WalletDisconnectButton />
        <button
          onClick={() =>
            setNetwork(currentNetwork === "devnet" ? "mainnet-beta" : "devnet")
          }
          className="px-4 py-2 text-white bg-purple-600 rounded hover:bg-purple-500"
        >
          Switch to {currentNetwork === "devnet" ? "Mainnet" : "Devnet"}
        </button>
      </div>

      <input
        type="number"
        step={1000}
        placeholder="Lamports"
        value={lamports}
        onChange={(e) => setLamports(Number(e.target.value))}
        className="max-w-2xl p-4 m-4 text-black border-2 bg-slate-300"
      />
    <div className="relative w-full">
          <input
            type="text"
            placeholder="public key of recepient"
            required
            onChange={(e)=>{
                try {
                    setRecipient(new PublicKey(e.target.value));
                  } catch (err) {
                    toast.error("Invalid PublicKey");
                  }
            }}
            className="text-white text-[1.2rem] bg-transparent w-full px-4 py-3 border-b-[3px] border-transparent focus:outline-none shadow-md focus:border-none peer"
          />
          <span
            className="absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r from-[#FF6464] via-[#FFBF59] to-[#47C9FF] transition-all duration-1000 ease-[cubic-bezier(0.42,0,0.58,1)] peer-focus:w-full"
          ></span>
        </div> 
      

      <button
        onClick={handleSend}
        className="px-4 py-2 mt-4 text-white bg-blue-600 rounded hover:bg-blue-500"
      >
        Send Lamports
      </button>
      
    </div>
  );
}
