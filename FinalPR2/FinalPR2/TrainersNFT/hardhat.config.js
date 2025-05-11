require("@nomicfoundation/hardhat-toolbox");

const privateKey = "11d9fc2dce158bd4bedbb6455a3d45432b27e0a5f73650584e21717e484fb57c";
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {
    },
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/LlKF5p_kKaTv52DHgxgmWJuFiwkjqkRu",
      accounts: [privateKey]
    }
  }
};
