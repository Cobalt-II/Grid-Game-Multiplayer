const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 3000;
const map = require('./mapper.js');
const enemy = require('./enemydata.js');
let servercodes = [];
let id = 0;
let afkdc = 300;

function check(target, pos) {
    for (let count in target) {
        if (target[count].x === pos[0] && target[count].y === pos[1]) {
            return false;
        }
    }
    return true;
};

function getPos() {
    let options = [];
    for (let count = 0; count < map.grid.length; count++) {
        for (let coun = 0; coun < map.grid[0].length; coun++) {
            if (map.grid[count][coun]) {
                options.push([count, coun])
            };
        }
    }
    return options[Math.floor(Math.random() * options.length)];
};

// Not mine, took this off of Stack cuz I wanted to quickly test out a code system.
function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/GridGame.html');
});

io.on('connection', (socket) => {
    io.emit('clientCount', io.engine.clientsCount);
    id++;
    let o = getPos();
    enemy.players.push(new enemy.player(o[0], o[1], id));
    socket.emit('id', id);
    socket.emit('map', map);
    socket.on('map', data => {
        io.emit('map', data);
    });
    socket.on('code', data => {
        for (let count in servercodes) {
            if (servercodes[count][3] === data[0] && enemy.players[data[1]]) {
                enemy.players[data[1]].x = servercodes[count][0];
                enemy.players[data[1]].y = servercodes[count][1];
            }
        }
        if (enemy.players[data[1]]) {
        enemy.players[data[1]].name = data[2];
        }
    });
    socket.on('playermove', data => {
        switch (data[0]) {
            case 'KeyW':
                if (map.grid[enemy.players[data[1]].x][enemy.players[data[1]].y - 1] && check(enemy.players, [enemy.players[data[1]].x.x, enemy.players[data[1]].y - 1])) {
                    enemy.players[data[1]].y--;
                };
                break;
            case 'KeyS':
                if (map.grid[enemy.players[data[1]].x][enemy.players[data[1]].y + 1] && check(enemy.players, [enemy.players[data[1]].x, enemy.players[data[1]].y + 1])) {
                    enemy.players[data[1]].y++;
                };
                break;
            case 'KeyD':
                if (map.grid[enemy.players[data[1]].x + 1][enemy.players[data[1]].y] && check(enemy.players, [enemy.players[data[1]].x + 1, enemy.players[data[1]].y])) {
                    enemy.players[data[1]].x++;
                };
                break;
            case 'KeyA':
                if (map.grid[enemy.players[data[1]].x - 1][enemy.players[data[1]].y] && check(enemy.players, [enemy.players[data[1]].x - 1, enemy.players[data[1]].y])) {
                    enemy.players[data[1]].x--;
                }
            case 'ArrowUp':
                enemy.players[data[1]].py--;
                if (enemy.players[data[1]].py < -1) {
                    enemy.players[data[1]].py = -1
                };
                break;
            case 'ArrowDown':
                enemy.players[data[1]].py++;
                if (enemy.players[data[1]].py > 1) {
                    enemy.players[data[1]].py = 1
                };
                break;
            case 'ArrowLeft':
                enemy.players[data[1]].px--;
                if (enemy.players[data[1]].px < -1) {
                    enemy.players[data[1]].px = -1
                };
                break;
            case 'ArrowRight':
                enemy.players[data[1]].px++;
                if (enemy.players[data[1]].px > 1) {
                    enemy.players[data[1]].px = 1
                };
                break;
        }
    });
    socket.on('newCode', data => {
        for (let count in servercodes) {
            if (servercodes[count][2] === data[2]) {
                servercodes.splice(count, 1);
            }
        }
        servercodes.push(data);
        let k = makeid(16);
        servercodes[servercodes.length - 1].push(k);
        socket.emit('returnCode', k);
    });
    socket.on('disconnect', () => {
        io.emit('clientCount', io.engine.clientsCount);
    })
});

http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});

setInterval(() => {
    for (let count in enemy.players) {
        if (enemy.players[count].health < 0) {
            io.emit('dead', enemy.players[count].id);
            enemy.players.splice(count, 1);
        }

        if (enemy.players[count]) {
            if (!enemy.players[count].time) {
                enemy.players[count].time = Date.now();
                enemy.players[count].lastmoved = {
                    x: enemy.players[count].x,
                    y: enemy.players[count].y
                }
            }

            if (enemy.players[count].lastmoved.x !== enemy.players[count].x || enemy.players[count].lastmoved.y !== enemy.players[count].y) {
                enemy.players[count].time = Date.now();
                enemy.players[count].lastmoved = {
                    x: enemy.players[count].x,
                    y: enemy.players[count].y
                }
            }

            if ((Date.now() - enemy.players[count].time) / 1000 > afkdc) {
                io.emit('dead', enemy.players[count].id);
                enemy.players.splice(count, 1);
            }
        }
    };
    io.emit('enemy', enemy.enemies);
    io.emit('player', enemy.players);
});

