import Container from 'react-bootstrap/Container';

function Rules(){
    return(
        <div className="p-3 mb-2 bg-success text-white">
        <h3>Rules:</h3>
        <Container>
            <ul>
                <li>Bet for a number (0 - 99) or many.</li>
                <li>The lowest not repeated number wins.</li>
                <li>Game open for 199 bets.</li>
                <li>Each bet 1 goerliEth.</li>
                <li>Winner gets 198 goerliEth.</li>
            </ul>
        </Container>
        </div>

    );
}

export default Rules;