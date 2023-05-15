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

async function getChainId(){
    const network = await provider.send("eth_chainId");
    //console.log('network: ', network);
    return network;    
}

async function connect(){

    // Si MetaMask no está instalado
    if(window.ethereum == null){
        //console.log('MetaMask no está instalado');
        provider = ethers.providers.getDefaultProvider();
        return {ok: false, msg: 'MetaMask no está instalado'};
    // Si Metamak está intalado
    }else{
        try{
            provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            //console.log('connect() => ', accounts);

            signer = provider.getSigner(accounts[0]);
            let walletAddress = await signer.getAddress();
            betsContract = new ethers.Contract(contractAddress, contractAbi, signer);

            return {ok: true, walletAddress: walletAddress};

        }catch(err){
            console.log(err);
            return {ok: false, msg: 'Something went wrong, please, refresh the page.'};
        }

    }
}

async function bet(valor){    
    try{          
        const resultado = await betsContract.bet(valor, {value: ethers.utils.parseEther("0.001")});
        return [true, resultado];
    }catch(err){
        return [false, err];  
    } 
          
}    

async function getPublicData(){
    try{           
        const [result, id, n_bets] = await betsContract.getPublicData(); 
        let lista = [];
        if (result.length>0){
            lista = result.map((linea)=>{
                //console.log('linea: ', linea);
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
        
        const game_id = parseInt(Number(id));
        return [game_id, lista, n_bets];

    }catch(err){

        console.log(err); 
        return [0, [], 0];   
    }     
}

function changeSigner(walletAddress){
    //console.log('changeSigner() antes => ', walletAddress); 
    if (walletAddress !== null){
        signer = provider.getSigner(walletAddress); 
        betsContract = new ethers.Contract(contractAddress, contractAbi, signer);
    }else{
        signer = null;
        betsContract = new ethers.Contract(contractAddress, contractAbi, provider);
    }    
    //console.log('changeSigner() despues => ', walletAddress); 
}

async function getProfile(){
  
    //console.log('getProfile() => signer: ', signer); 
    if (signer === null){
        return [[], []];    
    }
        
    try{

        const [historico, gameId] = await betsContract.getProfile();
               
        let lista = [];
        let currentBets = '';
        if (historico.length>0){
            let id_old = 0;
            historico.forEach((dato)=>{
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

            if(lista[0].id === parseInt(Number(gameId))){
                // get current bets
                currentBets = lista[0].cadena.split(',').map(valor => parseInt(valor));
                // get historical bets
                lista = lista.slice(1);        
            }                    

        }
        //console.log('currentBets', currentBets, ', profile: ', lista);
        return [currentBets, lista];     

    }catch(err){
        console.log("error getProfile()", err);   
        return [[], []];
    }     
          
}

async function getLastGameData(){
    
    if (signer === null){
        betsContract = new ethers.Contract(contractAddress, contractAbi, provider); // signer
    }
        
    try{          
        const [gameId, n_bets] = await betsContract.getLastGameData();
        return [true, parseInt(Number(gameId)), n_bets];
    }catch(err){
        console.log('error getLastGameData(:', err);  
        return [false, 0, 0];  
    } 
          
} 

export { init, connect, bet, getPublicData, getProfile, getLastGameData, changeSigner, getChainId, betsContract };
