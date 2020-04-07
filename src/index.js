import jquery from 'jquery';
import { TerminalScreen } from './terminal';
import { Map, Cell } from './map';
import { Controller } from './controller';
import { Player } from './player';
import { A3 } from './a3';
import { Sprite } from "./sprite";

const lowResolution = {
    width: 80,
    height: 25
};

const mediumResolution = {
    width: 120,
    height: 80
};

const highResolution = {
    width: 240,
    height: 140
};

const ultraResolution = {
    width: 320,
    height: 240
};

const resolution = highResolution;
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
        "###############################",
        "#...@.....#...................#",
        "#..#..........#...............#",
        "#.........############........#",
        "#.........#..........#........#",
        "#.........#..........###......#",
        "#.........#..........#........#",
        "####......##########.#........#",
        "##...................#......###",
        "#........####........#........#",
        "#........#.@#........#........#",
        "#........#..#........###......#",
        "#####.####..####.....#........#",
        "#####.####..####.....#........#",
        "#....................#......###",
        "#.............@@.....#........#",
        "#####.####..####.....###......#",
        "#####.####..####.....#@.......#",
        "#....................#........#",
        "###############################"
    ]);
    let controller = new Controller();
    let terminal = TerminalScreen.create(resolution.width, resolution.height, textFont, 'canvas_element');
    let player = new Player();
    let wallSprite = await Sprite.load('wall', 32, 32);
    let skeletonSprite = await Sprite.load('skeleton', 60, 60);
    let a3 = new A3(terminal, controller, map, player, wallSprite, skeletonSprite   );

    setTimeout(() => runGame(a3), 0);
});
