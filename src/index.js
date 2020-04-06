import jquery from 'jquery';
import { TerminalScreen } from './terminal';
import { Map, Cell } from './map';
import { Keyboard } from './keyboard';
import { Player } from './player';
import { A3 } from './a3';


const screenWidth = 240;
const screenHeight = 80;
const textFont = '20px Courier New';

var previousTime = performance.now();

function runRendering(a3) {
    let currentTime = performance.now();
    let elapsed = currentTime - previousTime;
    previousTime = currentTime;
    a3.render(elapsed);
    a3.terminal.update();
    setTimeout(() => runRendering(a3), 0);
}


jquery(document).ready(function() {
    let map = Map.fromStrings([
        "######################",
        "#.........#..........#",
        "#..#..........#......#",
        "#.........############",
        "#.........#..........#",
        "#.........#..........#",
        "#.........#..........#",
        "####......##########.#",
        "##...................#",
        "#........####........#",
        "#........#..#........#",
        "#........#..#........#",
        "#####.####..####.....#",
        "#####.####..####.....#",
        "#....................#",
        "######################"
    ]);
    let keyboard = new Keyboard();
    let terminal = TerminalScreen.create(screenWidth, screenHeight, textFont, 'canvas_element');
    let player = new Player();
    let a3 = new A3(terminal, keyboard, map, player);

    setTimeout(() => runRendering(a3), 0);
});
