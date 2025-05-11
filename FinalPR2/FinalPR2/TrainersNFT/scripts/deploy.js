const hre = require("hardhat");

async function main() {
  // Deploy Auction
  const Auction = await hre.ethers.getContractFactory("Auction");
  const auction = await Auction.deploy();
  await auction.waitForDeployment(); // Changed from deployed()
  console.log("Auction deployed to:", await auction.getAddress());

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});