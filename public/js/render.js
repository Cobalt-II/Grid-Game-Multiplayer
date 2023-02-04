import {jw} from "/js/map.js";
import {player, players, bar, font, clientCount} from "/js/config.js";
import {key} from "/js/controls.js";
import {enemies} from "/js/enemies.js";
import {socket} from "/js/socket.js";

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext("2d");

canvas.oncontextmenu = function(e) {
    e.preventDefault();
};

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

function update() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};

requestAnimationFrame(function draw() {
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        update();
    };

    ctx.fillStyle = localStorage.roomColors.split(',')[0];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let gridX = window.innerWidth / player.fov / 2;
    let gridY = window.innerHeight / player.fov / 2;
    ctx.fillStyle = localStorage.roomColors.split(',')[1];
    for (let count = -player.fov; count < player.fov; count++) {
        for (let coun = -player.fov; coun < player.fov; coun++) {
            let targ = player.x + count;
            let c = jw.grid[targ];
            let k;
            if (c) {
                k = jw.grid[targ][player.y + coun];
            } else {
                k = 0
            };
            if (!k) {
                k = 0
            };
            if (!k) {
                ctx.fillRect(window.innerWidth * (count - -player.fov) / (player.fov * 2), window.innerHeight * (coun - -player.fov) / (player.fov * 2), gridX, gridY)
            }
            for (let t in enemies) {
                if (enemies[t].pos[0] === player.x + count && enemies[t].pos[1] === player.y + coun) {
                    ctx.fillStyle = localStorage.roomColors.split(',')[enemies[t].color];
                    ctx.fillRect(window.innerWidth * (count - -player.fov) / (player.fov * 2), window.innerHeight * (coun - -player.fov) / (player.fov * 2), gridX, gridY);
                    ctx.fillStyle = ctx.fillStyle = localStorage.roomColors.split(',')[1];
                }
            }
            for (let t in players) {
                ctx.fillStyle = localStorage.roomColors.split(',')[4];
                if (players[t].x + players[t].px === player.x + count && players[t].y + players[t].py === player.y + coun && player.id !== players[t].id) {
                    ctx.fillRect(window.innerWidth / 2 - ((player.x - players[t].x) * gridX) + gridX * players[t].px, window.innerHeight / 2 - ((player.y - players[t].y) * gridY) + gridY * players[t].py, gridX, gridY);
                };
                
                ctx.fillRect(window.innerWidth / 2 + (player.px * gridX), window.innerHeight / 2 + (player.py * gridY), gridX, gridY);
                
                if (players[t].x === player.x + count && players[t].y === player.y + coun && player.id !== players[t].id) {
                    ctx.fillStyle = localStorage.roomColors.split(',')[3];
                    ctx.fillRect(window.innerWidth * (count - -player.fov) / (player.fov * 2), window.innerHeight * (coun - -player.fov) / (player.fov * 2), gridX, gridY);
                    ctx.font = `${font.size}px ${font.type}`;
                    ctx.fillStyle = localStorage.roomColors.split(',')[5];
                    ctx.fillText(players[t].name, window.innerWidth / 2 + (count * gridX), window.innerHeight / 2 + (coun * gridY) - gridY);
                }
                if (players[t].health < players[t].maxhealth && players[t].id !== player.id) {
                        ctx.fillStyle = localStorage.roomColors.split(',')[5];
                        ctx.fillRect(window.innerWidth / 2 - ((player.x - players[t].x) * gridX), window.innerHeight / 2 - ((player.y - players[t].y) * gridY) + bar.offset, gridX, bar.size[1]);
                        ctx.fillStyle = localStorage.roomColors.split(',')[6];
                        ctx.fillRect(window.innerWidth / 2 - ((player.x - players[t].x) * gridX), window.innerHeight / 2 - ((player.y - players[t].y) * gridY) + bar.offset, Math.max((players[t].health / players[t].maxhealth) * gridX, 0), bar.size[1]);
                };
                if(player.health < player.maxhealth) {
                    ctx.fillStyle = localStorage.roomColors.split(',')[5];
                    ctx.fillRect(window.innerWidth / 2, window.innerHeight / 2 + bar.offset, gridX, bar.size[1]);
                    ctx.fillStyle = localStorage.roomColors.split(',')[6];
                    ctx.fillRect(window.innerWidth / 2, window.innerHeight / 2 + bar.offset, Math.max((players[t].health / players[t].maxhealth) * gridX, 0), bar.size[1]);
                }
                ctx.fillStyle = localStorage.roomColors.split(',')[1];
            }
        }
    };

    if (player.dead) {
        document.removeEventListener('keyup', key);
        ctx.textAlign = 'center';
        ctx.fillStyle = localStorage.roomColors.split(',')[5];
        ctx.fillText(`You died`, window.innerWidth / 2, 200 + font.size);
        ctx.fillText(`Press enter to return to menu`, window.innerWidth / 2, 200 + font.size * 5);
        document.addEventListener('keydown', function(event) {
            if (event.code === 'Enter') {
                socket.disconnect();
                this.location.href = '/'
            };
        });
    } else {
        ctx.fillStyle = localStorage.roomColors.split(',')[2];
        ctx.fillRect(window.innerWidth / 2, window.innerHeight / 2, gridX, gridY);
        ctx.fillStyle = localStorage.roomColors.split(',')[5];
        ctx.font = `${font.size}px ${font.type}`;
        ctx.fillText(`Coords: (${player.x}, ${player.y})`, 0, font.size);
        ctx.fillText(`Clients: ${clientCount}`, 0, font.size * 2 + 10);
    };
    requestAnimationFrame(draw);
});