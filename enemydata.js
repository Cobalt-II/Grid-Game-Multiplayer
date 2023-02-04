const map = require('./mapper.js');
let id = 0;
let enemies = [];
let players = [];
let weapondamage = 1;

class player {
    constructor(x, y, id) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.health = 100;
        this.fov = 5;
        this.px = 0;
        this.py = 0;
        this.maxhealth = this.health;
    }
};

let enemyData = {
    max: 100,
    types: ['base'],
    radius: 10,
    health: 100,
    speed: 0.5,
    spawn: 10,
    damage: 1
};

class enemy {
    constructor(pos, health, speed, id, type, color) {
        this.pos = pos;
        this.health = health;
        this.speed = speed;
        this.id = id;
        this.type = type;
        this.maxhealth = health;
        this.color = color;
    }
};

function checkPos(pos, k) {
    for (let c in k) {
        if (pos[0] === k[c].pos[0] && pos[1] === k[c].pos[1]) {
            return 1;
        }
    }
    return 0;
};

function getPos() {
    let options = [];
    for (let count in map.grid) {
        for (let coun in map.grid) {
            if (map.grid[count][coun]) {
                for (let o in players) {
                    if (Math.hypot(players[o].x - count, players[o].y - coun) > enemyData.radius) {
                        options.push([count, coun]);
                    }
                }
            }
        }
    }
    return options[Math.floor(Math.random() * options.length)]
};

function pushEnemy(pos, health, speed, type, color) {
    enemies.push(new enemy(pos, health, speed, id, type, color));
    id++;
};

setInterval(() => {
    for (let coun in enemies) {
        for (let k in players) {
            if (players[k].x + players[k].px === enemies[coun].pos[0] && players[k].y + players[k].py === enemies[coun].pos[1]) {
                enemies[coun].health -= weapondamage;
            };
            if (players[k].x === enemies[coun].pos[0] && players[k].y === enemies[coun].pos[1]) {
                players[k].health -= enemyData.damage;
            }
        };

        if (enemies[coun].health < 1) {
            enemies.splice(coun, 1);
        };
        if (enemies[coun]) {
            if (!enemies[coun].intervalLocked) {
                let k = enemies[coun].id;
                setInterval(() => {
                    for (let count in enemies) {
                        if (enemies[count].id === k) {
                            switch (enemies[count].type) {
                                case 'base':
                                    if (players.length) {
                                        let pick = players.reduce((dist1, dist2) => Math.hypot(dist1.x - enemies[count].pos[0], dist1.y - enemies[count].pos[1]) < Math.hypot(dist2.x - enemies[count].pos[0], dist2.y - enemies[count].pos[1]) ? dist1 : dist2);
                                        if (pick[0]) {
                                            pick = pick[0]
                                        };
                                        if (enemies[count].pos[0] < pick.x && !checkPos([enemies[count].pos[0] + 1, enemies[count].pos[1]], enemies)) {
                                            enemies[count].pos[0]++
                                        };
                                        if (enemies[count].pos[0] > pick.x && !checkPos([enemies[count].pos[0] - 1, enemies[count].pos[1]], enemies)) {
                                            enemies[count].pos[0]--
                                        };
                                        if (enemies[count].pos[1] < pick.y && !checkPos([enemies[count].pos[0], enemies[count].pos[1] + 1], enemies)) {
                                            enemies[count].pos[1]++
                                        };
                                        if (enemies[count].pos[1] > pick.y && !checkPos([enemies[count].pos[0], enemies[count].pos[1] - 1], enemies)) {
                                            enemies[count].pos[1]--
                                        };
                                    }
                                    break;
                            }
                        }
                    }
                }, enemyData.speed * 1000);
                enemies[coun].intervalLocked = 1;
            }
        }
    }
});

setInterval(() => {
    if (enemies.length < enemyData.max) {
        let o = getPos();
        if (players.length) {
            pushEnemy([o[0], o[1]], enemyData.health, enemyData.speed, enemyData.types[Math.floor(Math.random() * enemyData.types.length)], 7);
        }
    }
}, enemyData.spawn * 1000);

module.exports = {enemies, players, player};