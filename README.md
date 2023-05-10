# Bets Game
Crypto bets game (Alchemy project)

# 1. Run Hardhat node
Open a terminal and run hardhat local node
> cd ./smartcontract
> npm install
> npx hardhat node

# 2. Compile and deploy smartcontract
Open a new terminal
> cd ./smartcontract
> npx hardhat run scripts/deploy.js --network localhost

# 3. Run Web
Open a new terminal and go to web directory
> cd ./web
> npm Install
> npm start

# 4 Tests
Open a new terminal or do it over the one use to deploy the smartcontract
## 4.1. (Optional) Run independent test (other hardhat node instance)
> cd ./smartcontract
> npx hardhat test test/bets.js --network localhost

## 4.2. (Optional) Run test over deployed contract (you can watch changes on the web)
> cd ./smartcontract
> npx hardhat run test/bets2.js --network localhost

# Notes:
- Recompiling smartcontract can affect JSON abi, if so, copy "/smartcontract/artifacts/contracts/Bets.sol/bets.json" to "/web/src/utils/bets.json"
- Redeploying smartcontract will affect deployment address, if so, copy smartcontact deployment address on ./web/src/utils/constant.js


 