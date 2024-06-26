import { useState, useEffect } from "react";
import { ethers } from "ethers";
import waterBillingAbi from "../artifacts/contracts/WaterBilling.sol/WaterBilling.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [waterBilling, setWaterBilling] = useState(undefined);
  const [usage, setUsage] = useState(0);
  const [bill, setBill] = useState(0);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Update this to your contract address
  const waterBillingABI = waterBillingAbi.abi;

  useEffect(() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }
  }, []);

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    try {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      getWaterBillingContract();
    } catch (error) {
      console.error("Error connecting to MetaMask", error);
    }
  };

  const getWaterBillingContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, waterBillingABI, signer);

    setWaterBilling(contract);
  };

  const recordUsage = async () => {
    if (waterBilling) {
      const tx = await waterBilling.recordUsage(account, usage);
      await tx.wait();
      alert("Usage recorded");
    }
  };

  const calculateBill = async () => {
    if (waterBilling) {
      const billAmount = await waterBilling.calculateBill(account);
      setBill(ethers.utils.formatEther(billAmount));
    }
  };

  return (
    <main className="container">
      <header>
        <h1>Water Billing System</h1>
      </header>
      {account ? (
        <div>
          <p>Your Account: {account}</p>
          <div>
            <h3>Record Water Usage</h3>
            <input
              type="number"
              placeholder="Usage in units"
              value={usage}
              onChange={(e) => setUsage(Number(e.target.value))}
            />
            <button onClick={recordUsage}>Record Usage</button>
          </div>
          <div>
            <h3>Calculate Bill</h3>
            <button onClick={calculateBill}>Calculate Bill</button>
            <p>Your Bill: {bill} ETH</p>
          </div>
        </div>
      ) : (
        <button onClick={connectAccount}>Connect MetaMask Wallet</button>
      )}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
