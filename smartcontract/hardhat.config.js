require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      //url: "http://127.0.0.1:8545",
      chainId: 1337,
      gas: "auto",
      gasPrice: "auto",
      initialBaseFeePerGas: 0          
    },
    goerli: {
      url: process.env.ALCHEMY_GOERLI_URL,
      accounts: [process.env.GOERLI_PRIVATE_KEY]
    }    
  },  
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY
  }  
};


