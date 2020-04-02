import jquery from 'jquery';
import {TerminalScreen} from './terminal';

class Man {
    constructor() {
        this.x = 0;
        this.y = 0;
    }

    moveLeft() {
        this.x = (this.x - 1 + screenWidth) % screenWidth;
    }

    moveRight() {
        this.x = (this.x + 1 + screenWidth) % screenWidth;
    }

    moveUp() {
        this.y = (this.y - 1 + screenHeight) % screenHeight;
    }

    moveDown() {
        this.y = (this.y + 1 + screenHeight) % screenHeight;
    }
}

const screenWidth = 80;
const screenHeight = 25;
const textFont = '20px Courier New';
const block = '\u{2591}';
const man = new Man();

function onKeyDown(e, terminal) {
    switch (e.keyCode) {
        case 37:
            man.moveLeft();
            break;
        case 38:
            man.moveUp();
            break;
        case 39:
            man.moveRight();
            break;
        case 40:
            man.moveDown();
            break;
    }

    terminal.clear();
    terminal.put(block, man.x, man.y);
    terminal.update();
}

jquery(document).ready(function() {
    let terminal = TerminalScreen.create(screenWidth, screenHeight, textFont, 'canvas_element');

    jquery(document).keydown((e) => onKeyDown(e, terminal));
});
