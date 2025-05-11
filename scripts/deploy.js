const hre = require("hardhat");

async function main() {
  // Deploy UserProfiles
  const UserProfiles = await hre.ethers.getContractFactory("UserProfiles");
  const userProfiles = await UserProfiles.deploy();
  await userProfiles.waitForDeployment(); // Changed from deployed()
  console.log("UserProfiles deployed to:", await userProfiles.getAddress());

  // Deploy GymCoin
  const GymCoin = await hre.ethers.getContractFactory("GymCoin");
  const gymCoin = await GymCoin.deploy();
  await gymCoin.waitForDeployment();
  console.log("GymCoin deployed to:", await gymCoin.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});