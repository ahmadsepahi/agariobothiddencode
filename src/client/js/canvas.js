var global = require('./global');
//Рубан Анна
class Canvas {
    constructor(params) {
        this.directionLock = false;
        this.target = global.target;
        this.reenviar = true;
        this.socket = global.socket;
        this.directions = [];
        var self = this;

        this.cv = document.getElementById('cvs');
        this.cv.width = global.screenWidth;
        this.cv.height = global.screenHeight;
      
        this.cv.addEventListener('keypress', this.keyInput, false);
        this.cv.addEventListener('keyup', function(event) {
            self.reenviar = true;
            self.directionUp(event);
        }, false);
        this.cv.addEventListener('keydown', this.directionDown, false);
        this.cv.parent = self;
        global.canvas = this;
    }

    // Функция, вызываемая при нажатии клавиши, меняющая направление.
    directionDown(event) {
    	var key = event.which || event.keyCode;
        var self = this.parent; 
    	if (self.directional(key)) {
    		self.directionLock = true;
    		if (self.newDirection(key, self.directions, true)) {
    			self.updateTarget(self.directions);
    			self.socket.emit('heartbeat', self.target);
    		}
    	}
    }

    //  Функция, вызываемая при отпускании клавиши, меняющая направление.
    directionUp(event) {
    	var key = event.which || event.keyCode;
    	if (this.directional(key)) { 
    		if (this.newDirection(key, this.directions, false)) {
    			this.updateTarget(this.directions);
    			if (this.directions.length === 0) this.directionLock = false;
    			this.socket.emit('heartbeat', this.target);
    		}
    	}
    }

    // Обновляет массив направлений, включая информацию о новом направлении.
    newDirection(direction, list, isAddition) {
    	var result = false;
    	var found = false;
    	for (var i = 0, len = list.length; i < len; i++) {
    		if (list[i] == direction) {
    			found = true;
    			if (!isAddition) {
    				result = true;
    				
    				list.splice(i, 1);
    			}
    			break;
    		}
    	}
    	// Добавляет направление.
    	if (isAddition && found === false) {
    		result = true;
    		list.push(direction);
    	}

    	return result;
    }

    // Обновляет цель в соответствии с указаниями в массиве направлений.
    updateTarget(list) {
    	this.target = { x : 0, y: 0 };
    	var directionHorizontal = 0;
    	var directionVertical = 0;
    	for (var i = 0, len = list.length; i < len; i++) {
    		if (directionHorizontal === 0) {
    			if (list[i] == global.KEY_LEFT || list[i] == global.KEY_LEFT1 ) directionHorizontal -= Number.MAX_VALUE;
    			else if (list[i] == global.KEY_RIGHT || list[i] == global.KEY_RIGHT1) directionHorizontal += Number.MAX_VALUE;
    		}
    		if (directionVertical === 0) {
    			if (list[i] == global.KEY_UP || list[i] == global.KEY_UP1) directionVertical -= Number.MAX_VALUE;
    			else if (list[i] == global.KEY_DOWN || list[i] == global.KEY_DOWN1) directionVertical += Number.MAX_VALUE;
    		}
		}
    	this.target.x += directionHorizontal;
    	this.target.y += directionVertical;
        global.target = this.target;
    }

    directional(key) {
    	return this.horizontal(key) || this.vertical(key);
    }

    horizontal(key) {
    	return key == global.KEY_LEFT || key == global.KEY_RIGHT || global.KEY_LEFT1 || key == global.KEY_RIGHT1 ;
    }

    vertical(key) {
    	return key == global.KEY_DOWN || key == global.KEY_UP || global.KEY_DOWN1 || key == global.KEY_UP1;
    }


   
}

module.exports = Canvas;
