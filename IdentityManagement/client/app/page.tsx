"use client"

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { storeIdentityOnXRPL, getIdentityFromXRPL, xrplAddress, logIdentityActionOnXRPL } from './xrpl';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const contractAddress = require('../variables/address.json');
const abi = require('../variables/abi.json');

/**
 * The Home component manages user identity interactions, including fetching, submitting,
 * updating, verifying, and revoking identity on both a smart contract and XRPL.
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
     * Initializes the Ethereum provider, signer, and contract, then fetches the user's identity.
     */
    useEffect(() => {
        const init = async () => {
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum).provider;
                await provider.send("eth_requestAccounts", []);
                const signer = provider.getSigner();
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
    }, [account]);

    /**
     * Displays a toast notification.
     * @param {string} message - The message to display.
     * @param {string} [type="info"] - The type of notification ("info", "success", "error", etc.).
     */
    const notify = (message, type = "info") => {
        toast(message, { type });
    };

    /**
     * Fetches the user's identity from the smart contract and XRPL.
     * @param {string} account - The user's Ethereum account address.
     */
    const fetchIdentity = async (account) => {
        try {
            const identity = await contract.getIdentity(account);
            if (identity.exists) {
                setName(identity.name);
                setEmail(identity.email);
                setIdentity(identity);
                setIsIdentityFetched(true);
                notify("Identity fetched successfully", "success");
            } else {
                notify("No identity found on contract", "info");
            }

        } catch (error) {
            notify("Failed to fetch identity", "error");
        }
    };

    /**
     * Submits a new identity to the smart contract and XRPL.
     */
    const submitIdentity = async () => {
        try {
            await contract.addIdentity(name, email);
            notify("Identity added successfully", "success");
            fetchIdentity(account); // Refresh identity after submission
        } catch (error) {
            console.log(error);
            notify("Failed to add identity", "error");
        }
    };

    /**
     * Updates the user's identity on the smart contract and XRPL.
     */
    const updateIdentity = async () => {
        try {
            const update = await contract.updateIdentity(name, email);
            await update.wait();
            notify("Identity updated successfully", "success");
            fetchIdentity(account); // Refresh identity after update
        } catch (error) {
            notify("Failed to update identity", "error");
        }
    };

    /**
     * Verifies the user's identity on the smart contract and logs the action on XRPL.
     */
    const verifyIdentity = async () => {
        try {
            const verify = await contract.verifyIdentity();
            await verify.wait();
            notify("Identity verified successfully", "success");
            fetchIdentity(account); // Refresh identity after verification
        } catch (error) {
            console.log(error);
            notify("Failed to verify identity", "error");
        }
    };

    /**
     * Revokes the user's identity on the smart contract and logs the action on XRPL.
     */
    const revokeIdentity = async () => {
        try {
            const revoke = await contract.revokeIdentity();
            await revoke.wait();
            notify("Identity revoked successfully", "success");
            fetchIdentity(account); // Refresh identity after revoke
        } catch (error) {
            notify("Failed to revoke identity", "error");
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
                        <button className="btn btn-secondary">
                            XRPL Connected: {xrplAddress?.slice(0, 6)}...{xrplAddress?.slice(-4)}
                        </button>
                    </>                 
                ) : (
                    <button className="btn btn-primary" onClick={() => window.ethereum.request({ method: 'eth_requestAccounts' })}>
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
                    <button className="btn btn-success" onClick={verifyIdentity} disabled={!isIdentityFetched || (identity && identity.isVerified)}>Verify Identity</button>
                    <button className="btn btn-danger" onClick={revokeIdentity} disabled={!isIdentityFetched || (identity && !identity.exists)}>Revoke Identity</button>
                </div>
            </div>
        </div>
    );
}

export default Home;