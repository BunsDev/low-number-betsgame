const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  const { ethers } = require("hardhat");
  
  describe("This is our main testing scope", function () {

    let bets, owner,  account1, account2, account3;
    let ownerBalance;

    before("deploy the contract instance first", async function (){

      // Contracts are deployed using the first signer/account by default
      [owner, account1, account2, account3] = await ethers.getSigners();
  
      const Bets = await ethers.getContractFactory("Bets");
      bets = await Bets.deploy();

    });
  
    it("Should get gamdId=1 y n_bets=0", async function () {
  
      const [a, b] = await bets.getLastGameData();
      const a2 = parseInt(Number(a));

      ownerBalance = await ethers.provider.getBalance(owner.address);
      ownerBalance = Number(ethers.utils.formatEther(ownerBalance));      

      expect([a2, b]).to.eql([1, 0]);
    });

    it("Should get gamdId=4 y n_bets=6 - owner & account1", async function () {

      // owner: 3 bets
      await bets.bet(51, {value: ethers.utils.parseEther("1.0")});
      await bets.bet(52, {value: ethers.utils.parseEther("1.0")});
      await bets.bet(53, {value: ethers.utils.parseEther("1.0")});

      // account1: 3 bets
      await bets.connect(account1).bet(13, {value: ethers.utils.parseEther("1.0")});
      await bets.connect(account1).bet(14, {value: ethers.utils.parseEther("1.0")});
      await bets.connect(account1).bet(15, {value: ethers.utils.parseEther("1.0")});        

      const [a, b] = await bets.getLastGameData();
      const a2 = parseInt(Number(a));

      expect([a2, b]).to.eql([1, 6]);
    });  

    it("Should get winner ", async function () {

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

      const [historical, game, n_bets] = await bets.getPublicData();

      const gameId = parseInt(Number(game));
      const winner = historical[historical.length-1].winner;
      const number = historical[historical.length-1].number;

      expect([winner, gameId, number, n_bets]).to.eql([account2.address, 2, 11, 6]);
    }).timeout(50000);      

    it("Check winner balance ", async function () {
      const balance = await ethers.provider.getBalance(account2.address);
      const balanceInEth = Number(ethers.utils.formatEther(balance));
      //console.log(balanceInEth);

      // 10.000 originales - 50 apuestas + 200 ganancia - 1 gas
      const balanceFinal = (10000-50+200-1); //*8/10;
      expect(balanceInEth).greaterThan(balanceFinal);
    });  

    /*
    it("Check owner balance ", async function () {
      const balance = await ethers.provider.getBalance(owner.address);
      const balanceInEth = Number(ethers.utils.formatEther(balance));
      //console.log(balanceInEth);

      // originales - 3 apuestas - 50 apuestas + 20 beneficio - 1 gas
      const balanceFinal = ownerBalance - 54 + 20;
      expect(balanceInEth).greaterThan(balanceFinal);
    });
    */        

  });

  // Run test:
  // npx hardhat test test/bets.js --network localhost