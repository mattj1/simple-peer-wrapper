
const Peer = require("simple-peer");
const wrtc = require('wrtc');
import {EventEmitter} from "eventemitter3";
import {io} from "socket.io-client";
import PeerConnection from "./PeerConnection";

type PeerEvents = {
    open: (id: string) => void;
    connection: (PeerConnection) => void;
}


export default class PeerWrapper extends EventEmitter<PeerEvents> {
    peer: any;

    socket: any;
    peer_id: string;

    constructor(server_addr: any, peer_props: any = null) {
        super();
        this.socket = io(`${server_addr}`);

        this.socket.on("connect", () => {
            console.log("PeerWrapper > Connected to signalling server.");
        });

        this.socket.on('peer_id', (data) => {
            this.peer_id = data;

            console.log("PeerWrapper > Got peer_id:", data);

            this.emit('open', data);

            if (peer_props) {
                this.socket.emit("peer_props", peer_props);
            }
        });

        this.socket.on('offer', (message) => {
            console.log(`PeerWrapper > ${this.peer_id}: process offer...`);
            this.processOffer(this.socket, message);
        });

        this.socket.on('answer', (message) => {
            console.log(`PeerWrapper > ${this.peer_id}: process answer...`);
            this.peer.signal(message["answer"]);
        })
    }

    private generatePeer(opts) {
        var peer;

        opts.channelConfig = {
            ordered: false,
            maxRetransmits: 0
        };

        opts.iceServers = [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478?transport=udp' },
            {
                urls: "stun:openrelay.metered.ca:80",
            },
            {
                urls: "turn:openrelay.metered.ca:80",
                username: "openrelayproject",
                credential: "openrelayproject",
            },
            {
                urls: "turn:openrelay.metered.ca:443",
                username: "openrelayproject",
                credential: "openrelayproject",
            },
            {
                urls: "turn:openrelay.metered.ca:443?transport=tcp",
                username: "openrelayproject",
                credential: "openrelayproject",
            },
        ];

        if(typeof window != 'undefined') {
            //@ts-ignore
            peer = new SimplePeer(opts);
        } else {
            peer = new Peer(opts);
        }

        peer.on('error', err => console.log('error', err))
        return peer;
    }

    private generateConnection(peer, local_peer_id, remote_peer_id) {
        return new PeerConnection(peer, local_peer_id, remote_peer_id, (conn) => {
            this.emit('connection', conn);
        });
    }

    private processOffer(socket, message) {
        let peer = this.generatePeer({
            trickle: false,
            wrtc: wrtc
        });

        peer.signal(message['offer']);

        peer.on('signal', data => {
            console.log("processOffer: on signal");

            socket.emit("answer", {
                "peer_from": message['peer_to'],
                "peer_to": message['peer_from'],
                "answer": JSON.stringify(data)
            });
        });

        this.generateConnection(peer, message['peer_to'], message['peer_from'])
    }

    Connect(dest_peer_id: string): PeerConnection {
        this.peer = this.generatePeer({
            initiator: true,
            trickle: false,
            wrtc: wrtc
        });

        this.peer.on('signal', data => {
            console.log('PeerWrapper > Sending offer:', data); //JSON.stringify(data))
            if (data["type"] == "offer") {
                this.socket.emit("offer", {
                    "peer_from": this.peer_id,
                    "peer_to": dest_peer_id,
                    "offer": JSON.stringify(data)
                });
            }
        })

        return this.generateConnection(this.peer, this.peer_id, dest_peer_id);
    }
}
