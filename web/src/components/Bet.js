import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {useState} from 'react';

function Bet({setNewBet, numBets, gameId}){

    const [bet, setBet] = useState('00');

    function handleKey(event){
        event.preventDefault(); 
        if ((event.keyCode>=48) && (event.keyCode<=57)){          
            let valor = bet.charAt(1) + event.key;
            setBet(valor);
        }
    }

    function handleClick(){
        //console.log('click');
        setNewBet(parseInt(bet).toString());
        setBet('00');
    }

    return(
        <div>
            <Form>
                <h3>Game {gameId}</h3>
                <Form.Group className="mb-3" controlId="formBet">
                    <Form.Label>Your bet:</Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder={bet}
                        style={{'height': '100px', 'fontSize': '90px', 'width': '130px'}} 
                        pattern="\d*" 
                        maxLength="2"
                        className='mx-auto'
                        onKeyDown={handleKey}
                    />
                    <Form.Text className="text-muted">
                    Enter a number: 0 - 99.
                    </Form.Text>
                </Form.Group>
                <Button variant="primary" type="button" style={{'width': '130px'}} onClick={handleClick}>Bet</Button>
                <div className='mt-3'>
                    <p className="m-1">Accumulated bets: {numBets}</p>
                    <p className="m-1">Pending bets: {200-numBets}</p>
                </div>
            </Form>
        </div>
    );
}

export default Bet;