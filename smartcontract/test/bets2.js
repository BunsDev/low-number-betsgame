const hre = require("hardhat");

async function main() {

  [owner, account1, account2, account3] = await hre.ethers.getSigners();

  const Bets = await hre.ethers.getContractFactory("Bets");
  const bets = Bets.attach(
    "0x5FbDB2315678afecb367f032d93F642f64180aa3" // The deployed contract address
  );

  console.log("Live Address:\t" + bets.address);

  const [a, b] = await bets.connect(account3).getLastGameData();
  const a2 = parseInt(Number(a));

  console.log(a2, b);  

  // owner: 3 bets
  await bets.bet(53, {value: ethers.utils.parseEther("1.0")});
  await bets.bet(54, {value: ethers.utils.parseEther("1.0")});
  await bets.bet(55, {value: ethers.utils.parseEther("1.0")});  

  // owner bets for: 0...10, 12...50  (se salta el 11)    
  let i=0;
  for(i=0; i<51; i++){
    if (i!=11){
        await bets.bet(i, {value: ethers.utils.parseEther("1.0")});  
    }
  }

  // account 1 bets for: 50...99
  for(i=50; i<100; i++){
    await bets.connect(account1).bet(i, {value: ethers.utils.parseEther("1.0")});  
  }

  // account 2 bets for: 0...49 => 11 winner  
  for(i=0; i<50; i++){      
      await bets.connect(account2).bet(i, {value: ethers.utils.parseEther("1.0")});          
  }
  
  // account 3 bets for: 12...61
  for(i=12; i<62; i++){
    await bets.connect(account3).bet(i, {value: ethers.utils.parseEther("1.0")});  
  }   

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// Run test:
// npx hardhat run test/bets2.js --network localhost
