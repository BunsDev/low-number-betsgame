import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

function Header({estado, connectWallet}){

    return(
        <header>
            <Navbar bg="dark" variant="dark">
                <Container>
                <Navbar.Brand href="#home">
                    <img
                    alt=""
                    src="/logo192.png"
                    width="30"
                    height="30"
                    className="d-inline-block align-top"
                    />{' '}
                    Bet The Lowest
                </Navbar.Brand>
                <Button variant={estado?"success":"primary"} onClick={connectWallet}>{estado?'Disconnect Wallet':'Connect Wallet'}</Button>
                </Container>
            </Navbar>
        </header>        
    );
}

export default Header;