import PeerConnection from "../src/PeerConnection";

export default class ConnectionManager {
    connections: PeerConnection[] = [];

    constructor() {
    }

    AddConnection(conn: PeerConnection, isClient: boolean) {
        console.log("AddConnection: ", conn.remote_peer_id); //, " = ", conn);

        if (this.connections[conn.remote_peer_id] !== undefined) {
            console.log("AddConnection(): already connected to ", conn.peer);
            return;
        }

        this.connections[conn.remote_peer_id] = conn;

        conn.on('data', function (data) {
            console.log("got data", data);
            // let d = new Uint8Array(data.data);
            //
            // // console.log("PeerJS Received from", conn.peer, ":", d);
            //
            // // @ts-ignore
            // const arrayPointer = Module._malloc(d.byteLength);
            // // @ts-ignore
            // Module.HEAP8.set(d, arrayPointer);
            //
            // // if packet is meant for the host/server, source = 0
            // let source = isClient; //outgoingConn === conn ? 1 : 0;
            //
            // // @ts-ignore
            // Module.ccall('PeerJSNet_Packet', null, ['string', 'number', 'number', 'number'], [conn.peer, arrayPointer, d.byteLength, source]);
            // // @ts-ignore
            // Module._free(arrayPointer);
        });

        conn.on('error', () => {
            console.log("conn.on error: "); //, conn.remote_peer_id);
            this.connections[conn.remote_peer_id] = undefined;
        });

        conn.on('close', () => {
            console.log("conn.on close: "); //, conn.remote_peer_id);
            this.connections[conn.remote_peer_id] = undefined;
        });
    }
}
