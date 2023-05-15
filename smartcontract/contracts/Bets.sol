// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Bets{

    address payable owner;

    struct Winner{
        uint gameId;
        uint date;
        address winner;
        uint8 number;
    }

     // Game ID
    uint public gameId;   
    // user => [bets]
    mapping(address=>uint8[]) user_bets;
    // user => numero(0..99)=>usado(true, false)
    mapping(address=>mapping(uint8=>bool)) user_numero_usado;
    // number (0-99) => times chosen
    uint8[100] number_times;
    // users
    address[] users;
    // total bets
    uint8 public n_bets;

    // Historical winners
    Winner[] public historical;

    // Profile
    struct Apuesta{
        uint gameId;
        uint8 number;
        bool winner;
    }
    // usuario=>apuestas
    mapping(address=>Apuesta[]) profile;

    event betEvent(address user, uint gameId, uint8 userBets, uint8 totalBets, uint256 timestamp);
    event winnerEvent(address user, uint gameId, uint8 number, uint256 timestamp);
    event newGame(uint gameId, uint256 timestamp);
    
    constructor(){
        owner = payable(msg.sender);
        n_bets = 0;
        gameId = 1;
        resetNumbers();
    }

    function AddWinner(address _user, uint8 _number) private {
        historical.push(Winner(gameId, block.timestamp, _user, _number)); 
    }

    function resetNumbers() private {
        for(uint8 i=0; i<100; i++){
            number_times[i] = 0;    
        }
    }

    function resetBets() private {
        // reset user -> [bets]
        for(uint i=0; i<users.length; i++){

            // reset used numbers for user
            for(uint8 i2=0; i2<100; i2++){
                user_numero_usado[users[i]][i2] = false;
            }

            // delete user bets
            delete user_bets[users[i]];
        }
        // delete users
        delete users;
    }    

    function resetGame() private {
        gameId++;
        n_bets = 0;
        resetBets();
        resetNumbers();
    }

    // Returns the winner number (=index)
    function checkWinnerNumber() private view returns (int8) {
        
        uint8 i=0;
        bool encontrado = false;
        for (i=0; i<100; i++){
            if (number_times[i]==1){
                encontrado=true;
                break;
            }
        }

        if(!encontrado){
            return(-1);
        }

        return int8(i);
    }

    function checkWinnerUser(uint8 _number) private view returns (address) {
        bool encontrado = false;

        // check all users
        uint i_user=0;
        for(i_user=0; i_user<users.length; i_user++){
            // check bets of each user
            uint i_bet=0;
            for (i_bet=0; i_bet < user_bets[users[i_user]].length; i_bet++){
                if (user_bets[users[i_user]][i_bet] == _number){
                    encontrado = true;
                    break;
                }
            }

            if (encontrado){
                break;
            }
        }

        return users[i_user];
    }

    function checkEnd() private {
        if (n_bets >= 200){
            
            int8 winnerNumber = checkWinnerNumber();
            if(winnerNumber >= 0){

                address winnerUser = checkWinnerUser(uint8(winnerNumber));
                //console.log("winner: %s - number: %s", winnerUser, uint8(winnerNumber));
                emit winnerEvent(winnerUser, gameId, uint8(winnerNumber), block.timestamp);             

                // save winner in historical array
                historical.push(Winner(gameId, block.timestamp, winnerUser, uint8(winnerNumber)));

                // Marcar la apuesta ganadora en la billetera (perfil)
                for (uint i=0; i<=profile[winnerUser].length-1; i++){
                    if((profile[winnerUser][i].number == uint8(winnerNumber)) && (profile[winnerUser][i].gameId == gameId)){
                        profile[winnerUser][i].winner = true;
                        break;
                    }
                }
                
                // pay winner
                uint balance = address(this).balance;
                payable(winnerUser).transfer(balance); //(balance*8)/10);

                // pay owner
                //balance = address(this).balance;
                //payable(owner).transfer(balance);                

                // reset gane
                resetGame();
                emit newGame(gameId, block.timestamp); 
            }

        }    
    }

    function userExists(address _dir) public view returns (bool) {
        for (uint i = 0; i < users.length; i++) {
            if (users[i] == _dir) {
                return true;
            }
        }

        return false;
    }    

    function bet(uint8 _number) public payable {
        require(_number>=0 && _number<=99, 'Number must be between 0 and 99');
        require(msg.value==0.001 ether, '0.001 ETH is required');
        if (user_bets[msg.sender].length<=0){
            users.push(msg.sender);
        }

       // Check it is not a repeated number for that user
        require(!user_numero_usado[msg.sender][_number], 'Repeated number');
        user_numero_usado[msg.sender][_number] = true;

        user_bets[msg.sender].push(_number);
        profile[msg.sender].push( Apuesta(gameId, _number, false) );
        //console.log("%s betting for: %s - total bets: %s", msg.sender, _number, user_bets[msg.sender].length);

        number_times[_number]++;
        n_bets++;

        emit betEvent(msg.sender, gameId, uint8(user_bets[msg.sender].length), n_bets, block.timestamp);         

        checkEnd();
    }

    fallback () external {

    }     

    function getPublicData() public view returns (Winner[] memory, uint, uint8){
        return (historical, gameId, n_bets);
    }    

    function getBets() public view returns (uint8[] memory) {
        return (user_bets[msg.sender]);
    }

    function getProfile() public view returns(Apuesta[] memory, uint){
        return (profile[msg.sender], gameId);
    }

    function getLastGameData() public view returns(uint, uint8){
        return (gameId, n_bets);
    }

}