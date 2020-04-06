import { Key } from './keyboard';
import { Cell } from './map';

export var RenderCharacters = {
    Wall: '\u{2588}',
    WallWithDarkShade: '\u{2593}',
    WallWithMediumShade: '\u{2592}',
    WallWithLightShade: '\u{2591}',
    Empty: ' ',
    Floor: '#',
    FloorWithDarkShade: 'x',
    FloorWithMediumShade: '~',
    FloorWithLightShade: '-',
    Boundary: '|'
};

export class A3 {
    constructor(terminal, keyboard, map, player) {
        this.terminal = terminal;
        this.keyboard = keyboard;
        this.map = map;
        this.player = player;
    }

    render(elapsed) {
        this._processKeyboard(elapsed);

        this._draw3dScene();

        this._drawMetaInfo(elapsed);
    }

    _draw3dScene() {
        let screenWidth = this.terminal.width;
        let screenHeight = this.terminal.height;
        let viewDepth = this.player.viewDepth;

        for (let x = 0; x < screenWidth; x++) {
            let ray = this._computeRay(x);

            let ceil = (screenHeight / 2) - screenHeight / ray.distance;
            let floor = screenHeight - ceil;

            let wallSymbol = RenderCharacters.Empty;

            if (ray.distance <= viewDepth / 3) {
                wallSymbol = RenderCharacters.Wall;
            }
            else if (ray.distance < viewDepth / 2) {
                wallSymbol = RenderCharacters.WallWithDarkShade;
            }
            else if (ray.distance < viewDepth / 1.5) {
                wallSymbol = RenderCharacters.WallWithMediumShade;
            }
            else if (ray.distance < viewDepth) {
                wallSymbol = RenderCharacters.WallWithLightShade;
            }

            if (ray.boundary) {
                wallSymbol = RenderCharacters.Boundary;
            }

            for (let y = 0; y < screenHeight; y++) {
                if (y <= ceil) {
                    this.terminal.put(RenderCharacters.Empty, y, x);
                }
                else if (y > ceil && y <= floor) {
                    this.terminal.put(wallSymbol, y, x);
                }
                else {
                    let b = 1.0 - (y - screenHeight / 2) / (screenHeight / 2);
                    let floorSymbol = RenderCharacters.Empty;

                    if (b < 0.25) {
                        floorSymbol = RenderCharacters.Floor;
                    }
                    else if (b < 0.5) {
                        floorSymbol = RenderCharacters.FloorWithDarkShade;
                    }
                    else if (b < 0.75) {
                        floorSymbol = RenderCharacters.FloorWithMediumShade;
                    }
                    else if (b < 0.9) {
                        floorSymbol = RenderCharacters.FloorWithLightShade;
                    }

                    this.terminal.put(floorSymbol, y, x);
                }
            }
        }
    }

    _computeRay(x) {
        let fov = this.player.fov;
        let playerX = this.player.x;
        let playerY = this.player.y;
        let rayAngle = this.player.viewAngle - (fov / 2) + (x / this.terminal.width) * fov;
        let xRayUnit = Math.sin(rayAngle);
        let yRayUnit = Math.cos(rayAngle);
        let rayLength = 0.0;
        let hit = false;
        let boundary = false;

        while (!hit && rayLength < this.player.viewDepth) {
            rayLength += 0.1;

            let testX = Math.floor(playerX + xRayUnit * rayLength);
            let testY = Math.floor(playerY + yRayUnit * rayLength);

            if (!this.map.inBound(testY, testX)) {
                hit = true;
                rayLength = this.player.viewDepth;
            }
            else if (this.map.at(testY, testX) == Cell.Wall) {
                hit = true;

                let boundaries = [];

                for (let dx = 0; dx < 2; dx++) {
                    for (let dy = 0; dy < 2; dy++) {
                        let vy = testY + dy - playerY;
                        let vx = testX + dx - playerX;
                        let distanceToBound = Math.sqrt(vy * vy + vx * vx);
                        let scalarMul = xRayUnit * vx / distanceToBound + yRayUnit * vy / distanceToBound;
                        boundaries.push({distance: distanceToBound, scalar: scalarMul});
                    }
                }

                boundaries.sort((a, b) => a.distance < b.distance);

                let maxBoundAngle = 0.005;
                boundary = Math.acos(boundaries[0].scalar) < maxBoundAngle
                           || Math.acos(boundaries[1].scalar) < maxBoundAngle
                           || Math.acos(boundaries[2].scalar) < maxBoundAngle;
            }
        }

        return {
            hit: hit,
            distance: rayLength,
            boundary: boundary
        };
    }

    _processKeyboard(elapsed) {
        if (this.keyboard.isPressed(Key.LeftArrow)) {
            this.player.viewAngle -= 0.003 * elapsed;
        }

        if (this.keyboard.isPressed(Key.RightArrow)) {
            this.player.viewAngle += 0.003 * elapsed;
        }

        if (this.keyboard.isPressed(Key.UpArrow)) {
            let dx = Math.sin(this.player.viewAngle) * 0.01 * elapsed;
            let dy = Math.cos(this.player.viewAngle) * 0.01 * elapsed;

            this.player.x += dx;
            this.player.y += dy;

            let intX = Math.floor(this.player.x);
            let intY = Math.floor(this.player.y);

            if ((!this.map.inBound(intY, intX)) || this.map.at(intY, intX) == Cell.Wall) {
                this.player.x -= dx;
                this.player.y -= dy;
            }
        }

        if (this.keyboard.isPressed(Key.DownArrow)) {
            let dx = Math.sin(this.player.viewAngle) * 0.01 * elapsed;
            let dy = Math.cos(this.player.viewAngle) * 0.01 * elapsed;

            this.player.x -= dx;
            this.player.y -= dy;

            let intX = Math.floor(this.player.x);
            let intY = Math.floor(this.player.y);

            if ((!this.map.inBound(intY, intX)) || this.map.at(intY, intX) == Cell.Wall) {
                this.player.x += dx;
                this.player.y += dy;
            }
        }
    }

    _drawMetaInfo(elapsed) {
        let fps = (1000 / elapsed).toFixed();
        let posString = 'Y=' + this.player.y.toFixed(2) + ' X=' + this.player.x.toFixed(2) + ' A=' + this.player.viewAngle.toFixed(2) + ' FPS=' + fps;
        this.terminal.putString(posString, 0, 0);

        for (let y = 0; y < this.map.height; y++) {
            for (let x = 0; x < this.map.width; x++) {
                this.terminal.put(this.map.at(y, x).symbol, y + 1, x);
            }
        }

        let intX = Math.floor(this.player.x);
        let intY = Math.floor(this.player.y);

        this.terminal.put('P', intY + 1, intX);
    }
}
