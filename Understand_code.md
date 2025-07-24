for transactions
The fields you need to set are:
    recentBlockhash: fetched from the blockchain
    feePayer: your wallet

Then you sign the transaction with your wallet and send it to the blockchain.
THen optionally confirm the transaction.

```js
    await connection.confirmTransaction(signature, "confirmed");
```

Build the Transaction
```javascript
    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: publicKey,       // sender
            toPubkey: recipient,         // recipient
            lamports: amount,            // amount in lamports
        })
        );

```
 split WalletActions into a separate file (WalletActions.tsx) for 

1. Hydration Safety (Next.js "use client")
You’re using Next.js App Router.

Only client-side logic (like useWallet) should run with "use client".

Keeping it separate ensures clean server/client boundaries.



Parameters Used in SystemProgram.transfer
fromPubkey: The public key of the sender’s wallet (the wallet initiating the transfer).

toPubkey: The public key of the recipient’s wallet (the wallet receiving the lamports).

lamports: The amount of lamports to be transferred. 1 Sol = 1,000,000,000 lamports.

recentBlockhash: A recent blockhash to ensure the transaction is valid and not a replay attack.

feePayer: The wallet that will pay for the transaction fees, typically the sender.

Setting Up the Network
In Solana, transactions can be made on different networks, such as devnet or mainnet.

How to Set it to Devnet
In this example, the network is set to devnet (a test network), which is useful for testing without spending real tokens:

```tsx

const wallets = [
  new PhantomWalletAdapter({ network: "devnet" }),
  new SolflareWalletAdapter({ network: "devnet" }),
  new TorusWalletAdapter({ network: "devnet" }),
];
```
Here, network: "devnet" specifies that the transaction should be made on the devnet.

The devnet is a test network that mimics the Solana mainnet but doesn't use real funds. You can test your code here without worrying about spending actual Solana.

To connect to the devnet in Solana's wallet adapters, we use the following connection endpoint:
```tsx
<ConnectionProvider endpoint="https://api.devnet.solana.com">
```

return (
  <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <WalletActions />
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>
);
Once you switch to mainnet, transactions will be made using real funds. Be cautious and ensure that you have sufficient SOL in your wallet to pay for transaction fees.

How It Works
User Connection: The user connects their wallet (e.g., Phantom, Solflare, or Torus) using the WalletMultiButton component.

Transaction Initiation: The user enters the amount of lamports to send and the recipient's public key. Once the user clicks "Send Lamports," the transfer is initiated using the SystemProgram.transfer method.

Transaction Confirmation: The transaction is sent to the Solana network, confirmed, and a signature is returned to indicate the transaction was successful.


