import React, { useState } from "react";
import { Wallet } from "ethers";
import { mnemonicToSeedSync } from "@scure/bip39";
import { HDKey } from "@scure/bip32";
import { Buffer } from "buffer"; 

export default function WalletGenerator() {
  const [mnemonic, setMnemonic] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [walletIndex, setWalletIndex] = useState(0);
  const [showPrivateKeys, setShowPrivateKeys] = useState({});

  const generateNewMnemonic = () => {
    const wallet = Wallet.createRandom();
    const phrase = wallet.mnemonic?.phrase;

    if (!phrase) {
      alert("Failed to generate mnemonic.");
      return;
    }

    setMnemonic(phrase);
    setWallets([]);
    setWalletIndex(0);
    addWallet(phrase, 0);
  };

const addWallet = (phrase, index) => {
  // 1️⃣ Create seed from mnemonic
  const seed = mnemonicToSeedSync(phrase);

  // 2️⃣ Create HDKey
  const hdKey = HDKey.fromMasterSeed(seed);

  // 3️⃣ Derive path
  const childKey = hdKey.derive(`m/44'/60'/0'/0/${index}`);

  if (!childKey.privateKey) {
    alert("Failed to derive private key");
    return;
  }

  // ✅ Convert Uint8Array to hex
  const privateKeyHex = `0x${Buffer.from(childKey.privateKey).toString("hex")}`;

  // 4️⃣ Create ethers Wallet
  const wallet = new Wallet(privateKeyHex);

  const newWallet = {
    index: index,
    address: wallet.address,
    privateKey: privateKeyHex,
  };

  setWallets((prev) => [...prev, newWallet]);
  setWalletIndex(index + 1);
};


  const handleAddWallet = () => {
    if (mnemonic) {
      addWallet(mnemonic, walletIndex);
    }
  };

  const togglePrivateKey = (index) => {
    setShowPrivateKeys((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">
        Simple ETH Wallet Generator
      </h1>

      <button
        onClick={generateNewMnemonic}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mb-4"
      >
        Generate New Secret Phrase
      </button>

      {mnemonic && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Secret Phrase:
            </label>
            <p className="break-words text-gray-900 dark:text-gray-100">
              {mnemonic}
            </p>
          </div>

          <button
            onClick={handleAddWallet}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded mb-4"
          >
            Add Wallet
          </button>

          <div className="space-y-4">
            {wallets.map((wallet) => (
              <div
                key={wallet.index}
                className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700"
              >
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Wallet #{wallet.index}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-200 break-words">
                  <span className="font-medium">Address:</span> {wallet.address}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-700 dark:text-gray-200 break-words">
                    <span className="font-medium">Private Key:</span>{" "}
                    {showPrivateKeys[wallet.index]
                      ? wallet.privateKey
                      : "••••••••••••••••••••"}
                  </p>
                  <button
                    onClick={() => togglePrivateKey(wallet.index)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {showPrivateKeys[wallet.index] ? "Hide" : "View"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
