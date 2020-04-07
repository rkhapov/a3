import jquery from 'jquery';
import { TerminalScreen } from './terminal';
import { Map, Cell } from './map';
import { Controller } from './controller';
import { Player } from './player';
import { A3 } from './a3';
import { Sprite } from "./sprite";


const screenWidth = 120;
const screenHeight = 80;
const textFont = '20px Courier New';

let previousTime = performance.now();

function runGame(a3) {
    let currentTime = performance.now();
    let elapsed = currentTime - previousTime;
    previousTime = currentTime;
    a3.render(elapsed);
    a3.terminal.update();
    setTimeout(() => runGame(a3), 0);
}


jquery(document).ready(async function() {
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
    let sprite = await Sprite.load('wall', 32, 32);

    console.log("'", sprite.sample(0.5, 0.5), "'");

    setTimeout(() => runGame(a3), 0);
});
