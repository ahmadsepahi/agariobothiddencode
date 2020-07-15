module.exports = {
    // Кнопки и другие математические константы
    KEY_ESC: 27,
    KEY_ENTER: 13,
    KEY_FIREFOOD: 119,
    KEY_SPLIT: 32,
    KEY_LEFT: 37,
    KEY_UP: 38,
    KEY_RIGHT: 39,
    KEY_DOWN: 40,
    KEY_LEFT1: 65,
    KEY_UP1: 87,
    KEY_RIGHT1: 68,
    KEY_DOWN1: 83,
    borderDraw: false,
    spin: -Math.PI,
    enemySpin: -Math.PI,
    foodSides: 10,

    // Canvas
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    gameWidth: 0,
    gameHeight: 0,
    xoffset: -0,
    yoffset: -0,
    gameStart: false,
    disconnected: false,
    died: false,
    kicked: false,
    continuity: false,
    startPingTime: 0,
    toggleMassState: 1,
    backgroundColor: '#f2fbff',
    lineColor: '#000000',


    // For latency
    pingLatency: 1000000,
    cnt: 0,
    timeArray: {},
    code: 0,
    codeLen:0,
    surveyState:0,

};
