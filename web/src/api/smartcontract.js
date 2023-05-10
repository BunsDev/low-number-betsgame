// Web3
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from '../utils/constants';

let provider = null;
let signer = null; 
let betsContract = null;

function init(){
    if (window.ethereum) {
        console.log('Ethereum support is available');
        if (window.ethereum.isMetaMask) {
          console.log('MetaMask is active');

          provider = new ethers.providers.Web3Provider(window.ethereum);
          betsContract = new ethers.Contract(contractAddress, contractAbi, provider);           
          return true;

        } else {
          console.log('MetaMask is not available');
        }
      } else {
        console.log('Ethereum support is not found');
      }
      return false;
}

async function connect(){

    // Si MetaMask no está instalado
    if(window.ethereum == null){
        alert('install MetaMask');
        console.log('MetaMask no está instalado');
        provider = ethers.providers.getDefaultProvider();
        return [false, null];
    // Si Metamak está intalado
    }else{
        try{
            provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            //console.log('connect() => ', accounts);

            signer = provider.getSigner(accounts[0]);
            let walletAddress = await signer.getAddress();
            //console.log('connect() => walletAddress: ', walletAddress);
            //console.log('connect() => signer: ', signer);

            betsContract = new ethers.Contract(contractAddress, contractAbi, signer);

            return [true, walletAddress];

        }catch(err){
            console.log(err);
            return [false, null];
        }

    }
}

async function bet(valor){
    console.log('prueba_evento');
    
    //betsContract = new ethers.Contract(contractAddress, contractAbi, provider); // signer
    try{          
        //const resultado = await betsContract.connect(signer).bet(valor, {value: ethers.utils.parseEther("1.0")});
        const resultado = await betsContract.bet(valor, {value: ethers.utils.parseEther("1.0")});
        console.log('resultado: ', resultado);
        return true;
    }catch(err){
        console.log('bet():', err);  
        return false;  
    } 
          
}    

async function getPublicData(){
    //provider = new ethers.providers.Web3Provider(window.ethereum);
    //betsContract = new ethers.Contract(contractAddress, contractAbi, provider); 
    try{           
        const [result, id, n_bets] = await betsContract.getPublicData(); 
        let lista = [];
        if (result.length>0){
            lista = result.map((linea)=>{
                const { gameId, date, winner, number } = linea;

                let yourDate = new Date(date.toNumber()*1000);

                return({
                    id: gameId.toNumber(), 
                    date: yourDate.toLocaleString("en-GB").substring(1, 10), 
                    winner, 
                    number
                });
            }); 
            
            lista.reverse();
        }  
        
        const gameId = parseInt(Number(id));
        return [gameId, lista, n_bets];

    }catch(err){

        console.log(err); 
        return [0, [], 0];   
    }     
}

function changeSigner(walletAddress){
    console.log('changeSigner() => ', walletAddress); 
    if (walletAddress !== null){
        signer = provider.getSigner(walletAddress); 
        betsContract = new ethers.Contract(contractAddress, contractAbi, signer);
        //console.log('signer address: ', await signer.getAddress());
    }else{
        signer = null;
        betsContract = new ethers.Contract(contractAddress, contractAbi, provider);
    }    
    console.log('changeSigner() => ', signer); 
}

async function getProfile(){
  
    //console.log('prueba');
    //console.log('provider: ' + provider);  
    console.log('getProfile() => signer: ', signer); 
    if (signer === null){
        return [[], []];    
    }
        
    //betsContract = new ethers.Contract(contractAddress, contractAbi, signer); // provider
    try{
        //const result = await betsContract.getBets();             
        const result = await betsContract.getBets(); // .connect(signer)        
        console.log('current bets:', result);

        const result2 = await betsContract.getProfile();
        //console.log('profile: ', result2);
               
        let lista = [];
        if (result2.length>0){
            let id_old = 0;
            result2.forEach((dato)=>{
                let id = parseInt(Number(dato[0]));
                let cadena = parseInt(Number(dato[1])).toString() + (dato[2]?' (winner)':'');
                if(id !== id_old){
                    id_old = id;
                    lista.push({id, cadena})
                }else{
                    lista[lista.length-1].cadena += ', ' + cadena;  
                }
            });

            lista = lista.reverse();
        }
        console.log('profile: ', lista);
        return [result, lista];     

    }catch(err){
        console.log(err);   
        return [[], []];
    }     
          
}


async function getLastGameData(){
    console.log('prueba_evento');
    
    if (signer === null){
        betsContract = new ethers.Contract(contractAddress, contractAbi, provider); // signer
    }
        
    try{
        //console.log('contract address: ' + betsContract.address);
        //console.log('contractAbi: ' + contractAbi);
        //console.log('signer: ' + provider);              
        const [gameId, n_bets] = await betsContract.getLastGameData();
        console.log(`getLastGameData() => gameId: %s, n_bets: %s`, gameId, n_bets);
        return [true, parseInt(Number(gameId)), n_bets];
    }catch(err){
        console.log('error prueba_evento():', err);  
        return [false, 0, 0];  
    } 
          
} 

export { init, connect, bet, getPublicData, getProfile, getLastGameData, changeSigner, betsContract };
