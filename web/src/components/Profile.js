import Table from 'react-bootstrap/Table';
import {useEffect, useState} from 'react';

function Profile({currentBets, profile, account}){

    const lista = profile.map((fila, index)=>{
        return(
            <tr key={index}>
                <td>{fila.id}</td>
                <td>{fila.cadena}</td>
            </tr>             
        );
    });

    return(
        <div>
            <h3>Profile</h3>
            <p className='pt-0 pb-1 mb-1'>{account}</p>

            <p className='pt-0 pb-1 mb-0'><b>Current game bets:</b></p>
            <p className='pt-0 mt-0'>{currentBets.length>0?currentBets.join(', '):'No bets yet...'}</p>
 
            <p className='pb-1 mb-1'><b>Previous Games</b></p>
            {profile.length<=0 && 'No historical data...'}
            {profile.length>0 &&
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Game</th>
                        <th>My Bets</th>
                    </tr>
                </thead>
                <tbody>
                    {[...lista]}
                </tbody>                
            </Table>}
        </div>
    );
}

export default Profile;