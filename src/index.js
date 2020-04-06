import jquery from 'jquery';
import { TerminalScreen } from './terminal';
import { Map, Cell } from './map';
import { Controller } from './controller';
import { Player } from './player';
import { A3 } from './a3';


const screenWidth = 120;
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
    let controller = new Controller();
    let terminal = TerminalScreen.create(screenWidth, screenHeight, textFont, 'canvas_element');
    let player = new Player();
    let a3 = new A3(terminal, controller, map, player);

    setTimeout(() => runRendering(a3), 0);
});
