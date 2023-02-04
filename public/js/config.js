import {socket} from "/js/socket.js";
    
    export let clientCount = 0;

    export let mini = {
    x: 0,
    y: 0,
    size: window.innerWidth / 6.825
    };
    
    export let bar = {
    x: 0,
    y: window.innerHeight - 20,
    size: [200, 20],
    offset: 150
    };
    
    export let font = {
    size: 20,
    type: "Arial"
    };

    export let player = {
        name: localStorage.name,
        dead: 0
    };
    
    export let players = [];
    
    export function getId() {
        for (let count in players) {
            if (players[count].id === player.id) {
                return count;
            }
        }
        return 't';
    };
    
    socket.on('player', function(data) {
        players = data;
        if(players[getId()]) {
        player = players[getId()];
        }
    });

    socket.on('dead', function(data) {
        if(player.id === data) {
        player.dead = 1;
        }
    });

    socket.on('clientCount', function(data) {
        clientCount = data; 
    });

    socket.on('returnCode', function (data) {
    navigator.clipboard.writeText(data);
    });

    socket.on('id', function(data) {
        player.id = data;
        setTimeout(() => {
            socket.emit('code', [localStorage.spawnCode, getId(), localStorage.name]); 
        })
     });

    

