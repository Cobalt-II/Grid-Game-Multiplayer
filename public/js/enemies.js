import {socket} from "/js/socket.js";
export let enemies = [];

socket.on('enemy', function(data) {
    enemies = data;
});