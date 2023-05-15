import Historical from './components/Historical';
import Rules from './components/Rules';
import Bet from './components/Bet';
import Header from './components/Header';
import Footer from './components/Footer';
import Profile from './components/Profile';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {useState, useEffect} from 'react';

import { GOERLY, contractAddress } from './utils/constants';

// Web3
import { init, connect, bet, getPublicData, getProfile, getLastGameData, changeSigner, getChainId, betsContract } from './api/smartcontract';

function App(){

    const [metamaskActive, setMetamaskActive] = useState(true);
    const [connected, setConnected] = useState(false);   
    const [currentAccount, setCurrentAccount] = useState(null);
 
    const [gameId, setGameId] = useState(0);
    const [numBets, setNumBets] = useState(0);
    const [historical, setHistorical] = useState([]);

    // Profile
    const [currentBets, setCurrentBets] = useState([]);
    const [profile, setProfile] = useState([]);    

    useEffect(()=>{

        const metamask = init();
        if (metamask){
            setMetamaskActive(true); 
            getHistorical();  

            // Metamask events
            window.ethereum.on('accountsChanged', onAccountsChanged);   
            window.ethereum.on('chainChanged', onChainChanged);
            // SmartContract events
            betsContract.on('betEvent', onBetEvent);           
            betsContract.on('winnerEvent', onWinnerEvent);          
            betsContract.on('newGame', onNewGame);

            // Clear event listeners
            return (function clear(){
                console.log('clearactivity()');
                // Metamask Events
                window.ethereum.removeListener('accountsChanged', onAccountsChanged);  
                window.ethereum.removeListener('chainChanged', onChainChanged);
                // SmartContract events
                betsContract.off('betEvent', onBetEvent);  
                betsContract.off('winnerEvent', onWinnerEvent);
                betsContract.off('newGame', onNewGame);                
            });          

        }else{
            setMetamaskActive(false);    
        }  

    }, []);

    //--- eventos ---
    const onAccountsChanged = async (accounts)=>{
        //console.log('accountsChanged', accounts);  
        if(accounts.length>0){
            changeSigner(accounts[0]);
            await getHistorical();
            await getUserProfile();
            setConnected(true);
            setCurrentAccount(accounts[0]);                    
        }else{
            changeSigner(null);
            setConnected(false);
            setCurrentAccount(null);                     
        }                     
    }  
    
    const onChainChanged = async (chainId)=>{
        //console.log('chainChanged => ', parseInt(chainId));
        checkChainId(chainId);
    }

    const onBetEvent = async (user, gameId, userBets, totalBets, timestamp)=>{
        //console.log(`betEvent(user: %s, game: %s, userBets: %s, totalBets: %s, timestamp: %s)`, user, parseInt(Number(gameId)), userBets, parseInt(Number(totalBets)), timestamp);
        if(user !== currentAccount){
            await getHistorical(); 
        }
    }

    const onWinnerEvent = async (user, gameId, number, timestamp)=>{
        //console.log('winnerEvent => ', user, gameId, number, timestamp);
        await getHistorical();
        await getUserProfile();
    }

    const onNewGame = async (gameId, timestamp)=>{
        //console.log('newGame => ', gameId, timestamp);
        await getHistorical();
        await getUserProfile();
    }

    // UI
    function showToastMessage(message){
        toast.error(message, {
            position: toast.POSITION.TOP_CENTER
        });
    };    

    async function checkChain(){
        let chain = await getChainId();
        return checkChainId(chain);
    }

    function checkChainId(chainId){
        //console.log('chain: ', parseInt(chainId));
        if (((parseInt(chainId) !== 5) && (GOERLY === true)) || 
			((parseInt(chainId) !== 1337) && (GOERLY !== true))){

			if (GOERLY)	showToastMessage('Cadena incorrecta, seleccione GOERLI');
            else	showToastMessage('Cadena incorrecta, seleccione HARDHAT');
			
            setConnected(false);
            return false;
        }
        return true;
    }

    async function connectUser(){
        // Conectar si está desconectado
        if (!connected){
            const resp = await connect();
            if (resp.ok){
                let redCorrecta = await checkChain();
                if(!redCorrecta) return;

                if (gameId === 0){
                    await getHistorical();
                } 

                await getUserProfile();
                setConnected(true);
                setCurrentAccount(resp.walletAddress);                
            }else{
                showToastMessage(resp.msg);
            }     
            
        // desconectar usuario    
        }else{        
            setConnected(false);
            setCurrentAccount(null); 
        }
    }

    async function getHistorical(){
        const [game_id, lista, n_bets] = await getPublicData();
        setHistorical(lista);
        setGameId(game_id);  
        setNumBets(n_bets);       
    }

    async function getUserProfile(){
        let [currentBets, profile] = await getProfile();

        setCurrentBets(currentBets);
        setProfile(profile);              
    }

    async function updateBets(nueva){
        let valor = parseInt(nueva);
        //console.log(`updateBets(%s)`, valor);
        if (connected){
            // Si no está repetido
            if (!currentBets.includes(valor)){

                let redCorrecta = await checkChain();
                if(!redCorrecta) return;

                let [resultado, message] = await bet(valor);
                if (resultado){
                    setCurrentBets([...currentBets, valor]);
                    setNumBets(numBets+1); 
                }else{
                    showToastMessage('Error mandando apuesta');
                }
                
            // Si esta repetido (ya tiene ese número)
            }else{
                showToastMessage('Repeated bet: ¡we have saved you some money!');
            }
        }else{
            showToastMessage('Sorry, you are not connected');
        }
    } 

    function onCloseAlertMetamask(){
        setMetamaskActive(true);
    }        

    return (
        <div>
            <Header connectWallet={connectUser} estado={connected}/>
            <main>
                <Container className="p-3">
                    <ToastContainer />
                    { (!metamaskActive)?<Alert variant="danger" onClick={onCloseAlertMetamask}>Sorry, metamask not installed.</Alert>:'' }
                    <Row>
                        <Col sm={{ span: 12, order: 1 }} md={{ span: 4, order: 2 }}>
                            <Row className='text-center'>
                                <Bet setNewBet={updateBets} numBets={numBets} gameId={gameId}/>
                            </Row>
                            <Row className='text-center'>
                                {GOERLY && <a a target="_blank" href={"https://goerli.etherscan.io/address/" + contractAddress}>Watch on GoerliScan</a>}
                                <br />
                            </Row>
                            <Row>
                                <Rules />
                            </Row>
                        </Col>                           
                        <Col sm={{ span: 12, order: 2 }} md={{ span: 4, order: 1 }}>
                            <Historical data={historical}/>
                        </Col>
                        <Col sm={{ span: 12, order: 3 }} md={{ span: 4, order: 3 }}>                            
                            {connected && <Profile currentBets={currentBets} profile={profile} account={currentAccount} />}
                        </Col>             
                    </Row>
                </Container>
            </main>
            <Footer />
        </div>
    );
}

export default App;