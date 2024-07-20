"use client";

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ToastContainer, toast, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const contractAddress = require('../variables/address.json');
const abi = require('../variables/abi.json');

interface Identity {
    name: string;
    email: string;
    user: string;
    isVerified: boolean | null;
    exists: boolean;
}

/**
 * The Home component manages user identity interactions, including fetching, submitting,
 * updating, verifying, and revoking identity on both a smart contract and XRPL.
 *
 * @component
 */
function Home() {
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [account, setAccount] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [identity, setIdentity] = useState<Identity | null>(null);
    const [isIdentityFetched, setIsIdentityFetched] = useState<boolean>(false);

    /**
     * Initializes the Ethereum provider, signer, and contract, then fetches the user's identity.
     */
    useEffect(() => {
        const init = async () => {
            if (typeof window !== 'undefined') {
                const provider = new ethers.BrowserProvider((window as any).ethereum);
                await provider.send("eth_requestAccounts", []);
                const signer = await provider.getSigner();
                const contract = new ethers.Contract(contractAddress, abi, signer);
                setProvider(provider);
                setSigner(signer);
                setContract(contract);
                const account = await signer.getAddress();
                setAccount(account);
                fetchIdentity(account);
            }
        };
        init();
    }, [account,isIdentityFetched]
);

    /**
     * Displays a toast notification.
     * @param {string} message - The message to display.
     * @param {ToastOptions} [options] - The type of notification ("info", "success", "error", etc.).
     */
    const notify = (message: string, options: ToastOptions = {}) => {
        toast(message, options);
    };

    /**
     * Fetches the user's identity from the smart contract and XRPL.
     * @param {string} account - The user's Ethereum account address.
     */
    const fetchIdentity = async (account: string) => {
        try {
            if (!contract) return;
            const identity = await contract.getIdentity(account);
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
     * Submits a new identity to the smart contract and XRPL.
     */
    const submitIdentity = async () => {
        try {
            if (!contract) return;
            const transaction = await contract.addIdentity(name, email);
            await transaction.wait();
            notify("Identity added successfully", { type: "success" });
            fetchIdentity(account); // Refresh identity after submission
        } catch (error) {
            console.log(error);
            notify("Failed to add identity", { type: "error" });
        }
    };

    /**
     * Updates the user's identity on the smart contract and XRPL.
     */
    const updateIdentity = async () => {
        try {
            if (!contract) return;
            const transaction = await contract.updateIdentity(name, email);
            await transaction.wait();
            notify("Identity updated successfully", { type: "success" });
            fetchIdentity(account); // Refresh identity after update
        } catch (error) {
            notify("Failed to update identity", { type: "error" });
        }
    };

    /**
     * Verifies the user's identity on the smart contract and logs the action on XRPL.
     */
    const verifyIdentity = async () => {
        try {
            if (!contract) return;
            const transaction = await contract.verifyIdentity();
            await transaction.wait();
            notify("Identity verified successfully", { type: "success" });
            fetchIdentity(account); // Refresh identity after verification
        } catch (error) {
            console.log(error);
            notify("Failed to verify identity", { type: "error" });
        }
    };

    /**
     * Revokes the user's identity on the smart contract and logs the action on XRPL.
     */
    const revokeIdentity = async () => {
        try {
            if (!contract) return;
            const transaction = await contract.revokeIdentity();
            await transaction.wait();
            notify("Identity revoked successfully", { type: "success" });
            fetchIdentity(account); // Refresh identity after revoke
        } catch (error) {
            notify("Failed to revoke identity", { type: "error" });
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
                    <button className="btn btn-primary" onClick={() => (window as any).ethereum?.request({ method: 'eth_requestAccounts' })}>
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
