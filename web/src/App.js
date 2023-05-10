import Historical from './components/Historical';
import Rules from './components/Rules';
import Bet from './components/Bet';
import Header from './components/Header';
import Footer from './components/Footer';
import Profile from './components/Profile';

//import Breadcrumb from 'react-bootstrap/Breadcrumb'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
//import Button from 'react-bootstrap/Button';
//import ListGroup from 'react-bootstrap/ListGroup';
//import Navbar from 'react-bootstrap/Navbar';
import Alert from 'react-bootstrap/Alert';

import {useState, useEffect} from 'react';

// Web3
import { init, connect, bet, getPublicData, getProfile, getLastGameData, changeSigner, betsContract } from './api/smartcontract';

function App(){

    const [connected, setConnected] = useState(false);
    const [repetido, setRepetido] = useState(false);
    const [metamaskActive, setMetamaskActive] = useState(true);

    const [error, setError] = useState(false);   
    const [numBets, setNumBets] = useState(0);	
	const [currentAccount, setCurrentAccount] = useState(null);
    const [historical, setHistorical] = useState([]);
    const [gameId, setGameId] = useState(0);

    // Profile
    const [currentBets, setCurrentBets] = useState([]);
    const [profile, setProfile] = useState([]);    

    useEffect(()=>{
        console.log('useEffect()');
        console.log('useEffect connected: ', connected);

        const metamask = init();
        if (metamask){
            setMetamaskActive(true); 
            getHistorical();  
            
            window.ethereum.on('accountsChanged', async (accounts)=>{
                console.log('accountsChanged', accounts);  
                if(accounts.length>0){
                    changeSigner(accounts[0]);
                    await getUserProfile();
                    setConnected(true);
                    setCurrentAccount(accounts[0]);                    
                }else{
                    changeSigner(null);
                    setConnected(false);
                    setCurrentAccount(null);                     
                }       
                
                setError(false);
                setRepetido(false);                 
            });                   
            
            betsContract.on('betEvent', async (user, gameId, userBets, totalBets, timestamp)=>{
                console.log('betEvent => ', user, gameId, userBets, totalBets, timestamp);
                await getHistorical();              
            });
            
            betsContract.on('winnerEvent', async (user, gameId, number, timestamp)=>{
                console.log('winnerEvent => ', user, gameId, number, timestamp);
                await getHistorical();
                await getUserProfile();
          
            });
            
            betsContract.on('newGame', async (gameId, timestamp)=>{
                console.log('newGame => ', gameId, timestamp);
                await getHistorical();
                await getUserProfile();
            });
                        

        }else{
            setMetamaskActive(false);    
        }  

    }, []);

    async function connectUser(){
        // Conectar si está desconectado
        if (!connected){
            const [conectado, walletAddress] = await connect();
            if (conectado){
                await getUserProfile();
                setConnected(true);
                setCurrentAccount(walletAddress);                
            }     
            
        // desconectar usuario    
        }else{        
            setConnected(false);
            setCurrentAccount(null); 
        }

        setError(false);
        setRepetido(false);        
         
    }

    async function getHistorical(){
        const [gameId, lista, n_bets] = await getPublicData();
        console.log(`getHistorical() => gameId: %s, n_bets: %s, lista: `, gameId, n_bets, lista);
        setHistorical(lista);
        setGameId(gameId);  
        setNumBets(n_bets);      
    }

    async function getUserProfile(){
        let [currentBets, profile] = await getProfile();
        console.log('getUserProfile(): ', profile);

        // Si el último juego es el actual en curso no lo meto en el "profile" porque está en "currentBets"
        if(profile.length>0){
            if(profile[0].id === gameId){
                profile = profile.slice(1);
            }        
        }
        setCurrentBets(currentBets);
        setProfile(profile);              
    }

    async function updateBets(nueva){
        console.log(nueva);
        let valor = parseInt(nueva);
        console.log('valor: ', valor);
        if (connected){
            // Si no está repetido
            if (!currentBets.includes(valor)){

                let test = await bet(valor);
                console.log('test: ', test);
                if (test){
                    setCurrentBets([...currentBets, valor]);
                    setNumBets(numBets+1);
                    setRepetido(false);    
                }else{
                    console.log('error mandando apuesta');
                }
                
            // Si esta repetido (ya tiene ese número)
            }else{
                setRepetido(true);
            }
        }else{
            setError(true);
        }
    }

    function onCloseError(){
        setError(false);
    }

    function onCloseRepetido(){
        setRepetido(false);
    }

    function onCloseAlertMetamask(){
        setMetamaskActive(true);
    }    

    return (
        <div>
            <Header connectWallet={connectUser} estado={connected}/>
            <main>
                <Container className="p-3">
                    { ( metamaskActive && error)?<Alert variant="danger" onClick={onCloseError}>Please, connect your wallet</Alert>:'' }
                    { repetido?<Alert variant="danger" onClick={onCloseRepetido}>Sorry, repeated bet.</Alert>:'' }
                    { (!metamaskActive)?<Alert variant="danger" onClick={onCloseAlertMetamask}>Sorry, metamask not installed.</Alert>:'' }
                    <Row>
                        <Col>
                            <Historical data={historical}/>
                        </Col>
                        <Col>
                            <Row className='text-center'>
                                <Bet setNewBet={updateBets} numBets={numBets} gameId={gameId}/>
                            </Row>
                            <Row>
                                <br />
                            </Row>
                            <Row>
                                <Rules />
                            </Row>
                        </Col>       
                        <Col>                            
                            {connected && <Profile currentBets={currentBets} profile={profile} gameId={gameId} account={currentAccount} />}
                        </Col>             
                    </Row>
                </Container>
            </main>
            <Footer />
        </div>
    );
}

export default App;