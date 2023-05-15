const hre = require("hardhat");

async function bet(contract, number){
    let tx = await contract.bet(number, {value: ethers.utils.parseEther(PRICE)});   
    await tx.wait();
    console.log('-> ', number);
}

async function main() {

    const PRICE = "0.001";

    // We connect to the Contract using a Provider, so we will only
    // have read-only access to the Contract
    let Bets = await hre.ethers.getContractFactory("Bets");

    const contract = Bets.attach(
        "0x5FbDB2315678afecb367f032d93F642f64180aa3" // The deployed contract address
    );       

    // A Signer from a private key
    let [owner, account1, account2, account3] = await hre.ethers.getSigners();

    // Create a new instance of the Contract with a Signer, which allows
    // update methods
    let contractWithSigner = contract.connect(owner);

    contractWithSigner.on('betEvent', (user, gameId, userBets, totalBets, timestamp)=>{
        console.log(`betEvent(user: %s, game: %s, userBets: %s, totalBets: %s, timestamp: %s)`, user, parseInt(Number(gameId)), userBets, parseInt(Number(totalBets)), timestamp);
    })     

    for (let i=2; i<51; i++){
        let tx = await contractWithSigner.bet(i, {value: ethers.utils.parseEther(PRICE)});

        // The operation is NOT complete yet; we must wait until it is mined
        await tx.wait();        

        console.log(i);
    }

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

// npx hardhat run --network localhost test/events.js