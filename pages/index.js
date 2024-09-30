import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import waterBillingAbi from '/workspace/Voting/artifacts/contracts/WaterBilling.sol/WaterBilling.json';  // Add your ABI here

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";  // Update with your contract address

export default function WaterBillingApp() {
  const [account, setAccount] = useState(null);
  const [waterBilling, setWaterBilling] = useState(null);
  const [usage, setUsage] = useState('');
  const [bill, setBill] = useState('0');
  const [networkName, setNetworkName] = useState('');
  const [error, setError] = useState('');
  const [usages, setUsages] = useState([]);  // State for storing recorded usages

  useEffect(() => {
    checkIfWalletIsConnected();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountChange);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await initializeContract();
        } else {
          setError("Please connect to MetaMask.");
        }
      } else {
        setError("Please install MetaMask.");
      }
    } catch (error) {
      setError("Failed to connect to MetaMask.");
    }
  };

  const handleAccountChange = async (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      await initializeContract();
    } else {
      setAccount(null);
      setWaterBilling(null);
    }
  };

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      await initializeContract();
    } catch (error) {
      setError("Failed to connect wallet.");
    }
  };

  const initializeContract = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, waterBillingAbi, signer);
      setWaterBilling(contract);

      const network = await provider.getNetwork();
      setNetworkName(network.name);
    } catch (error) {
      setError("");
    }
  };

  const recordUsage = async () => {
    if (!waterBilling) return;
    try {
      // Ensure MetaMask transaction happens when recording usage
      const tx = await waterBilling.recordUsage(account, ethers.BigNumber.from(usage));
      await tx.wait();  // Wait for the transaction to be mined
      alert("Usage recorded!");

      // Add the recorded usage to the list of usages and reset input
      setUsages([...usages, usage]);
      setUsage('');
    } catch (error) {
      setError("Failed to record usage. Make sure MetaMask is connected.");
    }
  };

  const calculateBill = async () => {
    if (!waterBilling) return;
    try {
      // Ensure MetaMask transaction happens when calculating the bill
      const tx = await waterBilling.calculateBill(account);
      await tx.wait();  // Wait for the transaction to be mined
      const billAmount = await waterBilling.bills(account);
      setBill(ethers.utils.formatEther(billAmount));
    } catch (error) {
      setError("Failed to calculate bill. Make sure MetaMask is connected.");
    }
  };

  const payBill = async () => {
    if (!waterBilling || bill === '0') return;
    try {
      // Ensure MetaMask transaction happens when paying the bill
      const tx = await waterBilling.payBill({ value: ethers.utils.parseEther(bill) });
      await tx.wait();  // Wait for the transaction to be mined
      alert("Bill paid successfully!");
      setBill('0');
    } catch (error) {
      setError("Failed to pay bill. Make sure MetaMask is connected.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Water Billing System</h1>
        {error && <p style={styles.error}>{error}</p>}
        {!account ? (
          <button style={styles.primaryBtn} onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <div>
            <p><strong>Connected to:</strong> {account}</p>
            <p><strong>Network:</strong> {networkName}</p>

            {/* Input Section */}
            <div style={styles.inputSection}>
              <input
                type="number"
                style={styles.inputField}
                placeholder="Enter water usage (in units)"
                value={usage}
                onChange={(e) => setUsage(e.target.value)}
              />
              <button style={styles.primaryBtn} onClick={recordUsage}>Record Usage</button>
            </div>

            {/* Display Recorded Usages */}
            <div style={styles.usageHistory}>
              <h3>Recorded Usages:</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Usage (units)</th>
                  </tr>
                </thead>
                <tbody>
                  {usages.length > 0 ? usages.map((u, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{u}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="2">No usage recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bill Section */}
            <div style={styles.billSection}>
              <button style={styles.primaryBtn} onClick={calculateBill}>Calculate Bill</button>
              <p><strong>Bill Amount:</strong> {bill} ETH</p>
            </div>

            <button style={styles.primaryBtn} onClick={payBill} disabled={bill === '0'}>Pay Bill</button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    backgroundColor: '#f4f4f9',
  },
  card: {
    background: '#fff',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
  },
  primaryBtn: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px',
  },
  inputSection: {
    marginBottom: '20px',
  },
  inputField: {
    padding: '10px',
    width: '100%',
    maxWidth: '300px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '16px',
    marginRight: '10px',
  },
  usageHistory: {
    marginTop: '20px',
    textAlign: 'left',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  billSection: {
    marginTop: '20px',
  },
  error: {
    color: 'red',
    marginBottom: '20px',
  },
};
