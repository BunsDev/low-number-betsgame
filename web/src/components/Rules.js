import Container from 'react-bootstrap/Container';

function Rules(){
    return(
        <div className="p-3 mb-2 bg-success text-white">
        <h3>Rules:</h3>
        <Container>
            <ul>
                <li>Bet for a number (0 - 99) or many.</li>
                <li>The lowest not repeated number wins.</li>
                <li>Game open for 200 bets.</li>
                <li>Each bet 0.001 goerliEth.</li>
                <li>Winner gets 0.2 goerliEth.</li>
            </ul>
        </Container>
        </div>

    );
}

export default Rules;