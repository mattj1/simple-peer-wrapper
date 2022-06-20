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
var eventemitter3_1 = require("eventemitter3");
var PeerConnection = /** @class */ (function (_super) {
    __extends(PeerConnection, _super);
    function PeerConnection(peer, local_peer_id, remote_peer_id, onConnect) {
        var _this = _super.call(this) || this;
        _this.peer = peer;
        _this._remote_peer_id = remote_peer_id;
        var so = _this;
        peer.on('connect', function () {
            console.log("".concat(local_peer_id, " CONNECTED to remote: ").concat(remote_peer_id));
            _this.emit('open');
            onConnect(_this);
        });
        peer.on('error', function () {
            so.emit('error', so);
        });
        peer.on('close', function () {
            console.log("peer.on close from", _this.remote_peer_id);
            so.emit('close', so);
        });
        peer.on('data', function (data) {
            // console.log(`${local_peer_id}: data from: ${remote_peer_id}: ${data}`)
            _this.emit('data', data);
        });
        return _this;
    }
    Object.defineProperty(PeerConnection.prototype, "remote_peer_id", {
        get: function () {
            return this._remote_peer_id;
        },
        enumerable: false,
        configurable: true
    });
    PeerConnection.prototype.Send = function (data) {
        this.peer.send(data);
    };
    PeerConnection.prototype.Close = function () {
        console.log("Closing connection to", this.remote_peer_id);
        this.peer.destroy();
    };
    return PeerConnection;
}(eventemitter3_1.EventEmitter));
exports.default = PeerConnection;
//# sourceMappingURL=PeerConnection.js.map