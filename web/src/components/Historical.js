import Table from 'react-bootstrap/Table';

function Historical({data}){

    // Rellena las columnas de datos
    let list = [];
    if (data.length>0){
        list = data.map((data, idx)=>{
            return(<tr key={idx}>
                <td>{data.id}</td>
                <td>{data.date}</td>
                <td><a target="_blank" href={"https://goerli.etherscan.io/address/" + data.winner}>{data.winner.substring(1, 9)}..{data.winner.substring(34, 42)}</a></td>
                <td>{data.number}</td>
            </tr>);
        });
    }

    // Crea una tabla si hay datos
    let tabla = <div><h3>Historical Winners</h3><p>Not yet... :(</p></div>;
    if (list.length>0){
        tabla = (
            <div>
                <h3>Historical Winners</h3>
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th>Game</th>
                        <th>Date</th>
                        <th>Wallet</th>
                        <th>Winner</th>
                    </tr>
                    </thead>
                    <tbody>
                        {[...list]}
                    </tbody>
                </Table>
            </div>          
        );
    }

    return tabla;
}

export default Historical;