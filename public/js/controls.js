import {player, getId} from "/js/config.js";
import {socket} from "/js/socket.js";

export function key (e) {
    switch (e.code) {
        case 'KeyW':
        case 'KeyS': 
        case 'KeyD':
        case 'KeyA':
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':   
        socket.emit('playermove', [e.code, getId()]);
            break;
        case 'KeyF':
            socket.emit('newCode', [player.x, player.y, player.id]);
            break;
      }
};