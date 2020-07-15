'use strict';

/*
 * Автор - Никита Кирилов
 * 
 * Описание - Данный модуль служит для создания нового игрока. В классе имеется конструктор для инициализации игрока со всеми необходимыми параметрами.
 */

var config = require('../../config.json');

/**
 * @description служит для создания нового игрока. В классе имеется конструктор для инициализации игрока со всеми необходимыми параметрами.
 */
class PlayerController {

    /**
     * @constructor Создает нового игрока.
     * @param {*} socketID идентификатор сокета. Служит для корректного подключения к серверу. Должен совпадать на клиенте и сервере.
     * @param {Object} position объект, содержащий координаты x и y.
     * @param {Number} radius радиус игрока.
     * @param {Number} massTotal масса игрока.
     * @param {Array} cells содержит информацию о других игроках.
     * @param {String} type тип игрока. Может быть "player" или "spectate".
     */
    constructor(socketID, position, radius, massTotal, cells, type) {
        this.id = socketID;
        this.x = position.x;
        this.y = position.y;

        this.w = config.defaultPlayerMass;
        this.h = config.defaultPlayerMass;

        this.cells = cells;
        this.massTotal = massTotal;

        this.hue = Math.round(Math.random() * 360);
        this.type = type;

        this.lastHeartbeat = new Date().getTime();
        this.target = {
            x: 0,
            y: 0
        }
        this.startTime= new Date().getTime();
        this.timeToGet= -1;
        this.userPing = -1;
        this.surveyState = -1;
        this.codeLen = -1;
        this.code = "";
        this.isSentToDB = false;

    }
}

module.exports = PlayerController;
