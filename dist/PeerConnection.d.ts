import { EventEmitter } from "eventemitter3";
declare type PeerConnectionEvents = {
    open: () => void;
    error: (PeerConnection: any) => void;
    close: (PeerConnection: any) => void;
    data: (any: any) => void;
};
export default class PeerConnection extends EventEmitter<PeerConnectionEvents> {
    peer: any;
    private readonly _remote_peer_id;
    get remote_peer_id(): string;
    constructor(peer: any, local_peer_id: any, remote_peer_id: any, onConnect: (PeerConnection: any) => void);
    Send(data: any): void;
    Close(): void;
}
export {};
