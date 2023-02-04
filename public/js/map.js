import {socket} from "/js/socket.js";
import {key} from "/js/controls.js";

export let jw = {
    grid: [[]]
};

socket.on('map', function(data) {
   jw = data;
   document.addEventListener('keyup', key);
});




