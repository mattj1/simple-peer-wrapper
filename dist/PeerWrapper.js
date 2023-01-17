"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Peer = require("simple-peer");
var wrtc = require('wrtc');
var eventemitter3_1 = require("eventemitter3");
var socket_io_client_1 = require("socket.io-client");
var PeerConnection_1 = require("./PeerConnection");
var PeerWrapper = /** @class */ (function (_super) {
    __extends(PeerWrapper, _super);
    function PeerWrapper(server_addr, peer_props) {
        if (peer_props === void 0) { peer_props = null; }
        var _this = _super.call(this) || this;
        _this.socket = (0, socket_io_client_1.io)("".concat(server_addr));
        _this.socket.on("connect", function () {
            console.log("PeerWrapper > Connected to signalling server.");
        });
        _this.socket.on('peer_id', function (data) {
            _this.peer_id = data;
            console.log("PeerWrapper > Got peer_id:", data);
            _this.emit('open', data);
            if (peer_props) {
                _this.socket.emit("peer_props", peer_props);
            }
        });
        _this.socket.on('offer', function (message) {
            console.log("PeerWrapper > ".concat(_this.peer_id, ": process offer..."));
            _this.processOffer(_this.socket, message);
        });
        _this.socket.on('answer', function (message) {
            console.log("PeerWrapper > ".concat(_this.peer_id, ": process answer..."));
            _this.peer.signal(message["answer"]);
        });
        return _this;
    }
    PeerWrapper.prototype.generatePeer = function (opts) {
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
        if (typeof window != 'undefined') {
            //@ts-ignore
            peer = new SimplePeer(opts);
        }
        else {
            peer = new Peer(opts);
        }
        peer.on('error', function (err) { return console.log('error', err); });
        return peer;
    };
    PeerWrapper.prototype.generateConnection = function (peer, local_peer_id, remote_peer_id) {
        var _this = this;
        return new PeerConnection_1.default(peer, local_peer_id, remote_peer_id, function (conn) {
            _this.emit('connection', conn);
        });
    };
    PeerWrapper.prototype.processOffer = function (socket, message) {
        var peer = this.generatePeer({
            trickle: false,
            wrtc: wrtc
        });
        peer.signal(message['offer']);
        peer.on('signal', function (data) {
            console.log("processOffer: on signal");
            socket.emit("answer", {
                "peer_from": message['peer_to'],
                "peer_to": message['peer_from'],
                "answer": JSON.stringify(data)
            });
        });
        this.generateConnection(peer, message['peer_to'], message['peer_from']);
    };
    PeerWrapper.prototype.Connect = function (dest_peer_id) {
        var _this = this;
        this.peer = this.generatePeer({
            initiator: true,
            trickle: false,
            wrtc: wrtc
        });
        this.peer.on('signal', function (data) {
            console.log('PeerWrapper > Sending offer:', data); //JSON.stringify(data))
            if (data["type"] == "offer") {
                _this.socket.emit("offer", {
                    "peer_from": _this.peer_id,
                    "peer_to": dest_peer_id,
                    "offer": JSON.stringify(data)
                });
            }
        });
        return this.generateConnection(this.peer, this.peer_id, dest_peer_id);
    };
    return PeerWrapper;
}(eventemitter3_1.EventEmitter));
exports.default = PeerWrapper;
//# sourceMappingURL=PeerWrapper.js.map