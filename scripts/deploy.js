// Import the Hardhat Runtime Environment
const ethers = require("ethers");
const hre = require("hardhat");

async function main() {
  // Specify the constructor parameters
  const initialRatePerUnit = ethers.utils.parseUnits("0.01", "ether").toString(); // Example: 0.01 ETH per unit
  const initialFreeUnits = 100; // Example: 100 free units

  // Get the contract to deploy
  const WaterBilling = await hre.ethers.getContractFactory("WaterBilling");

  // Deploy the contract with the initial parameters
  const waterBilling = await WaterBilling.deploy(initialRatePerUnit, initialFreeUnits);

  await waterBilling.deployed();

  // Log the address of the deployed contract
  console.log(`WaterBilling contract deployed to ${waterBilling.address}`);
}

// Execute the deployment script and handle any errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
