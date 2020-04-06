import jquery from 'jquery';

export var Key = {
    LeftArrow: 37,
    UpArrow: 38,
    RightArrow: 39,
    DownArrow: 40
}

export var KeyState = {
    Pressed: 0,
    Released: 1
}

export class Keyboard {
    constructor() {
        this.codeToState = {};

        jquery(document).keydown(e => this._onKeyDown(e));
        jquery(document).keyup(e => this._onKeyUp(e));
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
