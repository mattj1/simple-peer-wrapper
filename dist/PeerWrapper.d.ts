import { EventEmitter } from "eventemitter3";
import PeerConnection from "./PeerConnection";
declare type PeerEvents = {
    open: (id: string) => void;
    connection: (PeerConnection: any) => void;
};
export default class PeerWrapper extends EventEmitter<PeerEvents> {
    peer: any;
    socket: any;
    peer_id: string;
    constructor(server_addr: any, peer_props?: any);
    private generatePeer;
    private generateConnection;
    private processOffer;
    Connect(dest_peer_id: string): PeerConnection;
}
export {};
