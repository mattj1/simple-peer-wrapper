import ConnectionManager from "./ConnectionManager";
import PeerWrapper from "../src/peer";

let connectionManager = new ConnectionManager();

function connectToHost(peer_id) {
    let outgoingConn = clientPeer.Connect(peer_id);
    outgoingConn.on('open', function () {
        console.log("outgoingConn.open...");
        connectionManager.AddConnection(outgoingConn, true);
    });
}

function connectToHostLoop() {
    clientPeer.socket.emit("debug_get_host_peer_id", 123);

}

let clientPeer = new PeerWrapper("ws://localhost:8082");
clientPeer.socket.on("debug_host_peer_id", (message) => {
    if (message) {
        console.log("client got host peer id: ", message);
        connectToHost(message);
    } else {
        console.log("null?")
        setTimeout(function() {
            connectToHostLoop();
        }, 500);
    }
});
clientPeer.on('open', function (peer_id) {
    console.log("Client: got peer id", peer_id);

    connectToHostLoop();
})