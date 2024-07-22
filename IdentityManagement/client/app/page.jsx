"use client";

import React, { useState, useEffect } from 'react';
import { ethers } from "ethers";
import { utils, BrowserProvider } from "zksync-ethers";
import { ToastContainer, toast, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Provider, Wallet } from 'zksync-ethers';

const contractAddress = require('../variables/address.json');
const abi = require('../variables/abi.json');
const gaslessPaymasterAddress = '0x1F32E38E4f143cCe2ba5487e459A07A01b83c374'; // Replace with your paymaster contract address

// interface Identity {
//   name: string;
//   email: string;
//   user: string;
//   isVerified: boolean | null;
//   exists: boolean;
// }

/**
 * The Home component manages user identity interactions, including fetching, submitting,
 * updating, verifying, and revoking identity on both a smart contract and XRPL.
 * However, it utilizes a gasless paymaster contract to handle transaction fees.
 *
 * @component
 */
function Home() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [identity, setIdentity] = useState(null);
  const [isIdentityFetched, setIsIdentityFetched] = useState(false);

  /**
   * Initializes the Ethereum provider and contract, then fetches the user's identity.
   */
  useEffect(() => {
    const init = async () => {
      if (typeof window !== 'undefined') {
        const provider = new BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const zkProvider = new Provider("https://sepolia.era.zksync.dev")
        const signer = await provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer);
        setProvider(zkProvider);
        console.log(await zkProvider.getBalance(gaslessPaymasterAddress))
        setContract(contract);
        setAccount(await signer.getAddress());
        fetchIdentity(account);
      }
    };
    init();
  },[account]);

   /**

     * Displays a toast notification.

     * @param {string} message - The message to display.

     * @param {ToastOptions} [options] - The type of notification ("info", "success", "error", etc.).

     */

   const notify = (message, options = {}) => {

    toast(message, options);

};

  /**
   * Fetches the user's identity from the smart contract and XRPL.
   * @param {string} account - The user's Ethereum account address.
   */
  const fetchIdentity = async (account) => {
    try {

      if (!contract) return;
      const identity = await contract.getIdentity(account.toString());
      if (identity.exists) {
        setName(identity.name);
        setEmail(identity.email);
        setIdentity(identity);
        setIsIdentityFetched(true);
        notify("Identity fetched successfully", { type: "success" });
      } else {
        notify("No identity found on contract", { type: "info" });
      }
    } catch (error) {
      notify("Failed to fetch identity", { type: "error" });
    }
  };

  /**
   * Submits a new identity to the smart contract and XRPL using the paymaster.
   */
  const submitIdentity = async () => {
    try {
      if (!contract) return;

      // Get paymaster params
      const paymasterParams = utils.getPaymasterParams(gaslessPaymasterAddress, {
        type: "General",
        innerInput: new Uint8Array(),
      });

      const gasLimit = await contract.addIdentity.estimateGas(name,email,{
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams: paymasterParams,
        },
      });

      const transaction = await contract.addIdentity(name,email,{
        maxPriorityFeePerGas: 0n,
        maxFeePerGas: await provider.getGasPrice(),
        gasLimit,
        // Pass the paymaster params as custom data
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams,
        },
      });

      console.log(`Transaction hash: ${transaction.hash}`);

      await transaction.wait();

      notify("Identity added successfully", { type: "success" });
      fetchIdentity(account); // Refresh identity after submission
    } catch (error) {
      console.log(error);
      notify("Failed to add identity")
    }
}
      // ... (existing code)

  /**
   * Updates the user's identity on the smart contract and XRPL using the paymaster.
   */
  const updateIdentity = async () => {
    try {
      if (!contract) return;

      // Get paymaster params
      const paymasterParams = utils.getPaymasterParams(gaslessPaymasterAddress, {
        type: "General",
        innerInput: new Uint8Array(),
      });

      const gasLimit = await contract.updateIdentity.estimateGas(name,email,{
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams: paymasterParams,
        },
      });

      const transaction = await contract.updateIdentity(name,email,{
        maxPriorityFeePerGas: 0n,
        maxFeePerGas: await provider.getGasPrice(),
        gasLimit,
        // Pass the paymaster params as custom data
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams,
        },
      });

      console.log(`Transaction hash: ${transaction.hash}`);

      await transaction.wait();

      notify("Identity updated successfully", { type: "success" });
      fetchIdentity(account); // Refresh identity after submission
    } catch (error) {
      console.log(error);
      notify("Failed to update identity")
    }
  };

  /**
   * Verifies the user's identity on the smart contract and logs the action on XRPL using the paymaster.
   */
  const verifyIdentity = async () => {
    try {
      if (!contract) return;

      // Get paymaster params
      const paymasterParams = utils.getPaymasterParams(gaslessPaymasterAddress, {
        type: "General",
        innerInput: new Uint8Array(),
      });

      const gasLimit = await contract.verifyIdentity.estimateGas({
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams: paymasterParams,
        },
      });

      const transaction = await contract.verifyIdentity({
        maxPriorityFeePerGas: 0n,
        maxFeePerGas: await provider.getGasPrice(),
        gasLimit,
        // Pass the paymaster params as custom data
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams,
        },
      });

      console.log(`Transaction hash: ${transaction.hash}`);

      await transaction.wait();

      notify("Identity verified successfully", { type: "success" });
      fetchIdentity(account); // Refresh identity after verification
    } catch (error) {
      console.log(error);
      notify("Failed to verify identity")
    }
  };

  /**
   * Revokes the user's identity on the smart contract and logs the action on XRPL using the paymaster.
   */
  const revokeIdentity = async () => {
    try {
      if (!contract) return;

      // Get paymaster params
      const paymasterParams = utils.getPaymasterParams(gaslessPaymasterAddress, {
        type: "General",
        innerInput: new Uint8Array(),
      });

      const gasLimit = await contract.revokeIdentity.estimateGas({
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams: paymasterParams,
        },
      });

      const transaction = await contract.revokeIdentity({
        maxPriorityFeePerGas: 0n,
        maxFeePerGas: await provider.getGasPrice(),
        gasLimit,
        // Pass the paymaster params as custom data
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams,
        },
      });

      console.log(`Transaction hash: ${transaction.hash}`);

      await transaction.wait();

      notify("Identity revoked successfully", { type: "success" });
      fetchIdentity(account); // Refresh identity after revoke
    } catch (error) {
      console.log(error);
      notify("Failed to revoked identity")
    }
  };



    return (
        <div className="container mt-5">
            <ToastContainer />
            <header className="d-flex justify-content-between align-items-center mb-4">
                <h1>Identity Verification</h1>
                {account ? (
                    <>
                        <button className="btn btn-secondary">
                            Connected: {account.slice(0, 6)}...{account.slice(-4)}
                        </button>
                    </>                 
                ) : (                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                    <button className="btn btn-primary" onClick={() => window.ethereum?.request({ method: 'eth_requestAccounts' })}>
                        Connect Wallet
                    </button>
                )}
            </header>   
            <div className="card p-4">
                <div className="form-group">
                    <label>Name:</label>
                    <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                {identity && (
                    <div className="mt-3">
                        <div className="card">
                            <div className="card-header">
                                Identity Information
                            </div>
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item"><strong>User Address:</strong> {identity.user}</li>
                                <li className="list-group-item"><strong>Verified:</strong> {identity.isVerified ? "Yes" : "No"}</li>
                                <li className="list-group-item"><strong>Exists:</strong> {identity.exists ? "Yes" : "No"}</li>
                            </ul>
                        </div>
                    </div>
                )}
                <div className="d-flex justify-content-between mt-3">
                    <button className="btn btn-primary" onClick={submitIdentity} disabled={isIdentityFetched}>Submit Identity</button>
                    <button className="btn btn-warning" onClick={updateIdentity} disabled={!isIdentityFetched}>Update Identity</button>
                    <button className="btn btn-success" onClick={verifyIdentity} disabled={!isIdentityFetched || !!(identity && identity.isVerified)}>Verify Identity</button>
                    <button className="btn btn-danger" onClick={revokeIdentity} disabled={!isIdentityFetched || !!(identity && !identity.exists)}>Revoke Identity</button>
                </div>
            </div>
        </div>
    );
}

export default Home;
