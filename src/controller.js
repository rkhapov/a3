import jquery from 'jquery';

export var Key = {
    LeftArrow: 37,
    UpArrow: 38,
    RightArrow: 39,
    DownArrow: 40,
    W: 87,
    S: 83,
    A: 65,
    D: 68
}

export var KeyState = {
    Pressed: 0,
    Released: 1
}

export class Controller {
    constructor() {
        this.codeToState = {};
        jquery(document).keydown(e => this._onKeyDown(e));
        jquery(document).keyup(e => this._onKeyUp(e));
        this.lastMouseCords = [];
        jquery(document).mousemove(e => this._onMouseMove(e));
        this.mouseHandler = null;
    }

    onMouseMove(handler) {
        if (this.mouseHandler == null) {
            this.mouseHandler = handler;
        }
    }

    _onMouseMove(e) {
        let x = e.clientX;
        if (this.lastMouseCords.length + 1 > 5) {
            this.lastMouseCords.shift();
        }

        this.lastMouseCords.push(x);
        let average = this.lastMouseCords.reduce((a, b) => a + b, 0) / this.lastMouseCords.length || 0;

        if (this.mouseHandler != null) {
            this.mouseHandler(average);
        }
    }

    getState(code) {
        if (this.codeToState[code] == undefined) {
            this.codeToState[code] = KeyState.Released;
        }

        return this.codeToState[code];
    }

    isPressed(code) {
        return this.codeToState[code] === KeyState.Pressed;
    }

    _onKeyDown(e) {
        this.codeToState[e.keyCode] = KeyState.Pressed;
    }

    _onKeyUp(e) {
        this.codeToState[e.keyCode] = KeyState.Released;
    }
}
