# Bets Game
Crypto bets game (Alchemy project)

# 1. Run Hardhat node
Open a terminal and run hardhat local node
> cd ./smartcontract
> npm install
> npx hardhat node

# 2. Compile and deploy smartcontract
1. Open a new terminal
> cd ./smartcontract

for local tests:
2. Run command:
> npx hardhat run scripts/deploy.js --network localhost 

for Goerli deploment:
2. Change "dot_env (exmple).txt" to ".env"
3. Fulfill parameters
4. Run command:
> npx hardhat run scripts/deploy.js --network goerli

Important:
- Copy deploymet address and paste it in ./web/src/utils/constant.js

# 3. Run Web
Open a new terminal and go to web directory
> cd ./web
> npm install
> npm start

# 4 Tests
Open a new terminal or do it over the one used to deploy the smartcontract
for local test change GOERLY constant in App.js to false;

## 4.1. (Optional) Run local test (other hardhat node instance)
> cd ./smartcontract
> npx hardhat test test/bets.js --network localhost

## 4.2. (Optional) Run local test over deployed contract (you can watch changes on the web)
> cd ./smartcontract
> npx hardhat run test/bets2.js --network localhost

# Notes:
- Recompiling smartcontract can affect JSON abi, if so, copy "/smartcontract/artifacts/contracts/Bets.sol/bets.json" to "/web/src/utils/bets.json"
- Redeploying smartcontract will affect deployment address, if so, copy smartcontact deployment address on ./web/src/utils/constant.js


 