import {Controller, Key} from './controller';
import {Cell, Map} from './map';
import {TerminalScreen} from './terminal';
import {Player} from './player';
import {Sprite} from "./sprite";

export var RenderCharacters = {
    Wall: '\u{2588}',
    WallWithDarkShade: '\u{2593}',
    WallWithMediumShade: '\u{2592}',
    WallWithLightShade: '\u{2591}',
    Empty: ' ',
    Floor: '\u{2588}',
    FloorWithDarkShade: 'x',
    FloorWithMediumShade: '~',
    FloorWithLightShade: '-',
    Boundary: '|',
    MediumShade: '\u{2592}',
    LightShade: '\u{2591}'
};

export class A3 {
    private readonly terminal: TerminalScreen;
    private readonly controller: Controller;
    private readonly map: Map;
    private readonly player: Player;
    private readonly wallSprite: Sprite;
    private lastMousePosition: number;

    constructor(
        terminal: TerminalScreen,
        controller: Controller,
        map: Map,
        player: Player,
        wallSprite: Sprite) {
        this.terminal = terminal;
        this.controller = controller;
        this.map = map;
        this.player = player;
        this.lastMousePosition = -1;
        this.wallSprite = wallSprite;
        controller.onMouseMove(e => this._onMouseMove(e));
    }

    public render(elapsed: number): void {
        this._processKeyboard(elapsed);

        this._draw3dScene();

        this._drawMetaInfo(elapsed);
    }

    private _onMouseMove(newX) {
        if (this.lastMousePosition < 0) {
            this.lastMousePosition = newX;
            return;
        }

        let mouseSensitivity = 25;

        if (newX === this.lastMousePosition) {
            if (newX === 0) {
                this._doLeftTurn(mouseSensitivity);
            } else {
                this._doRightTurn(mouseSensitivity);
            }
        } else {
            if (newX < this.lastMousePosition) {
                this._doLeftTurn(mouseSensitivity);
            } else {
                this._doRightTurn(mouseSensitivity);
            }
        }

        this.lastMousePosition = newX;
    }

    private _doLeftTurn(elapsed) {
        this.player.viewAngle -= 0.003 * elapsed;
    }

    private _doRightTurn(elapsed) {
        this.player.viewAngle += 0.003 * elapsed;
    }

    private _draw3dScene() {
        let screenWidth = this.terminal.width;
        let screenHeight = this.terminal.height;
        let viewDepth = this.player.viewDepth;

        for (let x = 0; x < screenWidth; x++) {
            let ray = this._computeRay(x);

            let ceilCord = (screenHeight / 2) - screenHeight / (ray.distance * Math.cos(this.player.viewAngle - ray.angle));
            let floorCord = screenHeight - ceilCord;

            for (let y = 0; y < screenHeight; y++) {
                if (y <= ceilCord) {
                    this.terminal.put(RenderCharacters.Empty, y, x);
                } else if (y > ceilCord && y <= floorCord) {
                    if (ray.distance < viewDepth) {
                        let sampleY = (y - ceilCord) / (floorCord - ceilCord);
                        let wallSymbol = this.wallSprite.sample(ray.sampleX, sampleY);
                        this.terminal.put(wallSymbol, y, x);
                    }
                    else {
                        this.terminal.put(RenderCharacters.LightShade, y, x);
                    }
                } else {
                    this.terminal.put(RenderCharacters.MediumShade, y, x);
                }
            }
        }
    }

    private _computeRay(x) {
        let fov = this.player.fov;
        let playerX = this.player.x;
        let playerY = this.player.y;
        let rayAngle = this.player.viewAngle - (fov / 2) + (x / this.terminal.width) * fov;
        let xRayUnit = Math.sin(rayAngle);
        let yRayUnit = Math.cos(rayAngle);
        let rayLength = 0.0;
        let hit = false;
        let sampleX: number = 0;

        while (!hit && rayLength < this.player.viewDepth) {
            rayLength += 0.01;
            let currentX = playerX + xRayUnit * rayLength;
            let currentY = playerY + yRayUnit * rayLength;

            let testX = Math.floor(playerX + xRayUnit * rayLength);
            let testY = Math.floor(playerY + yRayUnit * rayLength);

            if (!this.map.inBound(testY, testX)) {
                hit = true;
                rayLength = this.player.viewDepth;
            } else if (this.map.at(testY, testX) === Cell.Wall) {
                hit = true;
                let blockMiddleX = testX + 0.5;
                let blockMiddleY = testY + 0.5;
                let angle = Math.atan2(currentY - blockMiddleY, currentX - blockMiddleX);
                let oneFourthOfPi = Math.PI * 0.25;
                let threeFourthOfPi = Math.PI * 0.75;

                if (angle > -oneFourthOfPi && angle < oneFourthOfPi) {
                    sampleX = currentY - testY;
                }
                else if (angle > oneFourthOfPi && angle < threeFourthOfPi) {
                    sampleX = currentX - testX;
                }
                else if (angle < -oneFourthOfPi && angle > -threeFourthOfPi) {
                    sampleX = currentX - testX;
                }
                else {
                    sampleX = currentY - testY;
                }
            }
        }

        return {
            hit: hit,
            distance: rayLength,
            angle: rayAngle,
            sampleX: sampleX
        };
    }

    _processKeyboard(elapsed) {
        if (this.controller.isPressed(Key.LeftArrow)) {
            this._doLeftTurn(elapsed);
        }

        if (this.controller.isPressed(Key.RightArrow)) {
            this._doRightTurn(elapsed);
        }

        if (this.controller.isPressed(Key.UpArrow) || this.controller.isPressed(Key.W)) {
            let dx = Math.sin(this.player.viewAngle) * 0.005 * elapsed;
            let dy = Math.cos(this.player.viewAngle) * 0.005 * elapsed;

            this.player.x += dx;
            this.player.y += dy;

            let intX = Math.floor(this.player.x);
            let intY = Math.floor(this.player.y);

            if ((!this.map.inBound(intY, intX)) || this.map.at(intY, intX) === Cell.Wall) {
                this.player.x -= dx;
                this.player.y -= dy;
            }
        }

        if (this.controller.isPressed(Key.DownArrow) || this.controller.isPressed(Key.S)) {
            let dx = Math.sin(this.player.viewAngle) * 0.005 * elapsed;
            let dy = Math.cos(this.player.viewAngle) * 0.005 * elapsed;

            this.player.x -= dx;
            this.player.y -= dy;

            let intX = Math.floor(this.player.x);
            let intY = Math.floor(this.player.y);

            if ((!this.map.inBound(intY, intX)) || this.map.at(intY, intX) === Cell.Wall) {
                this.player.x += dx;
                this.player.y += dy;
            }
        }

        if (this.controller.isPressed(Key.D)) {
            let dy = Math.sin(this.player.viewAngle) * 0.005 * elapsed;
            let dx = Math.cos(this.player.viewAngle) * 0.005 * elapsed;

            this.player.x += dx;
            this.player.y -= dy;

            let intX = Math.floor(this.player.x);
            let intY = Math.floor(this.player.y);

            if ((!this.map.inBound(intY, intX)) || this.map.at(intY, intX) === Cell.Wall) {
                this.player.x -= dx;
                this.player.y += dy;
            }
        }

        if (this.controller.isPressed(Key.A)) {
            let dy = Math.sin(this.player.viewAngle) * 0.005 * elapsed;
            let dx = Math.cos(this.player.viewAngle) * 0.005 * elapsed;

            this.player.x -= dx;
            this.player.y += dy;

            let intX = Math.floor(this.player.x);
            let intY = Math.floor(this.player.y);

            if ((!this.map.inBound(intY, intX)) || this.map.at(intY, intX) === Cell.Wall) {
                this.player.x += dx;
                this.player.y -= dy;
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
