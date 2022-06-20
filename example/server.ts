import PeerWrapper from "../src/peer";
import PeerConnection from "../src/PeerConnection";
import ConnectionManager from "./ConnectionManager";

let connectionManager = new ConnectionManager();

console.log("starting server...")
let serverPeer = new PeerWrapper("ws://localhost:8082", {"is_host": true});

serverPeer.on('open', function (peer_id) {
    console.log("server peer open, id:", peer_id);
});

serverPeer.on('connection', function(conn: PeerConnection) {
    console.log("server.ts > Got connection", conn);
    connectionManager.AddConnection(conn, false);

    conn.Send("FOO");

    // conn.on('close', (conn) => {
    //     console.log("server: connection closed", conn.remote_peer_id);
    // })
});