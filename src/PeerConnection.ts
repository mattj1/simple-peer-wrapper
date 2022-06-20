import {EventEmitter} from "eventemitter3";

type PeerConnectionEvents = {
    open: () => void;
    error: (PeerConnection) => void;
    close: (PeerConnection) => void;
    data: (any) => void;
}

export default class PeerConnection extends EventEmitter<PeerConnectionEvents> {
    peer: any;

    private readonly _remote_peer_id: string;

    get remote_peer_id(): string {
        return this._remote_peer_id;
    }

    constructor(peer: any, local_peer_id, remote_peer_id, onConnect: (PeerConnection) => void) {
        super();

        this.peer = peer;

        this._remote_peer_id = remote_peer_id;

        let so = this;

        peer.on('connect', () => {
            console.log(`${local_peer_id} CONNECTED to remote: ${remote_peer_id}`);
            this.emit('open');

            onConnect(this);
        });

        peer.on('error', () => {
            so.emit('error', so);
        });

        peer.on('close', () => {
            console.log("peer.on close from", this.remote_peer_id)
            so.emit('close', so);
        });

        peer.on('data', (data) => {
            // console.log(`${local_peer_id}: data from: ${remote_peer_id}: ${data}`)
            this.emit('data', data);
        })
    }

    public Send(data: any) {
        this.peer.send(data);
    }

    public Close() {
        console.log("Closing connection to", this.remote_peer_id)
        this.peer.destroy();
    }
}
