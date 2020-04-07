"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var controller_1 = require("./controller");
var map_1 = require("./map");
exports.RenderCharacters = {
    Wall: "\u2588",
    WallWithDarkShade: "\u2593",
    WallWithMediumShade: "\u2592",
    WallWithLightShade: "\u2591",
    Empty: ' ',
    Floor: '#',
    FloorWithDarkShade: 'x',
    FloorWithMediumShade: '~',
    FloorWithLightShade: '-',
    Boundary: '|'
};
var A3 = /** @class */ (function () {
    function A3(terminal, controller, map, player) {
        var _this = this;
        this.terminal = terminal;
        this.controller = controller;
        this.map = map;
        this.player = player;
        this.lastMousePosition = -1;
        controller.onMouseMove(function (e) { return _this._onMouseMove(e); });
    }
    A3.prototype.render = function (elapsed) {
        this._processKeyboard(elapsed);
        this._draw3dScene();
        this._drawMetaInfo(elapsed);
    };
    A3.prototype._onMouseMove = function (newX) {
        if (this.lastMousePosition < 0) {
            this.lastMousePosition = newX;
            return;
        }
        var mouseSensitivity = 25;
        if (newX === this.lastMousePosition) {
            if (newX === 0) {
                this._doLeftTurn(mouseSensitivity);
            }
            else {
                this._doRightTurn(mouseSensitivity);
            }
        }
        else {
            if (newX < this.lastMousePosition) {
                this._doLeftTurn(mouseSensitivity);
            }
            else {
                this._doRightTurn(mouseSensitivity);
            }
        }
        this.lastMousePosition = newX;
    };
    A3.prototype._doLeftTurn = function (elapsed) {
        this.player.viewAngle -= 0.003 * elapsed;
    };
    A3.prototype._doRightTurn = function (elapsed) {
        this.player.viewAngle += 0.003 * elapsed;
    };
    A3.prototype._draw3dScene = function () {
        var screenWidth = this.terminal.width;
        var screenHeight = this.terminal.height;
        var viewDepth = this.player.viewDepth;
        for (var x = 0; x < screenWidth; x++) {
            var ray = this._computeRay(x);
            var ceil = (screenHeight / 2) - screenHeight / (ray.distance * Math.cos(this.player.viewAngle - ray.angle));
            var floor = screenHeight - ceil;
            var wallSymbol = exports.RenderCharacters.Empty;
            if (ray.distance <= viewDepth / 3) {
                wallSymbol = exports.RenderCharacters.Wall;
            }
            else if (ray.distance < viewDepth / 2) {
                wallSymbol = exports.RenderCharacters.WallWithDarkShade;
            }
            else if (ray.distance < viewDepth / 1.5) {
                wallSymbol = exports.RenderCharacters.WallWithMediumShade;
            }
            else if (ray.distance < viewDepth) {
                wallSymbol = exports.RenderCharacters.WallWithLightShade;
            }
            if (ray.boundary) {
                wallSymbol = exports.RenderCharacters.Boundary;
            }
            for (var y = 0; y < screenHeight; y++) {
                if (y <= ceil) {
                    this.terminal.put(exports.RenderCharacters.Empty, y, x);
                }
                else if (y > ceil && y <= floor) {
                    this.terminal.put(wallSymbol, y, x);
                }
                else {
                    var b = 1.0 - (y - screenHeight / 2) / (screenHeight / 2);
                    var floorSymbol = exports.RenderCharacters.Empty;
                    if (b < 0.25) {
                        floorSymbol = exports.RenderCharacters.Floor;
                    }
                    else if (b < 0.5) {
                        floorSymbol = exports.RenderCharacters.FloorWithDarkShade;
                    }
                    else if (b < 0.75) {
                        floorSymbol = exports.RenderCharacters.FloorWithMediumShade;
                    }
                    else if (b < 0.9) {
                        floorSymbol = exports.RenderCharacters.FloorWithLightShade;
                    }
                    this.terminal.put(floorSymbol, y, x);
                }
            }
        }
    };
    A3.prototype._computeRay = function (x) {
        var fov = this.player.fov;
        var playerX = this.player.x;
        var playerY = this.player.y;
        var rayAngle = this.player.viewAngle - (fov / 2) + (x / this.terminal.width) * fov;
        var xRayUnit = Math.sin(rayAngle);
        var yRayUnit = Math.cos(rayAngle);
        var rayLength = 0.0;
        var hit = false;
        var boundary = false;
        while (!hit && rayLength < this.player.viewDepth) {
            rayLength += 0.01;
            var testX = Math.floor(playerX + xRayUnit * rayLength);
            var testY = Math.floor(playerY + yRayUnit * rayLength);
            if (!this.map.inBound(testY, testX)) {
                hit = true;
                rayLength = this.player.viewDepth;
            }
            else if (this.map.at(testY, testX) === map_1.Cell.Wall) {
                hit = true;
                var boundaries = [];
                for (var dx = 0; dx < 2; dx++) {
                    for (var dy = 0; dy < 2; dy++) {
                        var vy = testY + dy - playerY;
                        var vx = testX + dx - playerX;
                        var distanceToBound = Math.sqrt(vy * vy + vx * vx);
                        var scalarMul = xRayUnit * vx / distanceToBound + yRayUnit * vy / distanceToBound;
                        boundaries.push({ distance: distanceToBound, scalar: scalarMul });
                    }
                }
                boundaries.sort(function (a, b) { return a.distance - b.distance; });
                var maxBoundAngle = 0.005;
                boundary = Math.acos(boundaries[0].scalar) < maxBoundAngle
                    || Math.acos(boundaries[1].scalar) < maxBoundAngle
                    || Math.acos(boundaries[2].scalar) < maxBoundAngle;
            }
        }
        return {
            hit: hit,
            distance: rayLength,
            boundary: boundary,
            angle: rayAngle
        };
    };
    A3.prototype._processKeyboard = function (elapsed) {
        if (this.controller.isPressed(controller_1.Key.LeftArrow)) {
            this._doLeftTurn(elapsed);
        }
        if (this.controller.isPressed(controller_1.Key.RightArrow)) {
            this._doRightTurn(elapsed);
        }
        if (this.controller.isPressed(controller_1.Key.UpArrow) || this.controller.isPressed(controller_1.Key.W)) {
            var dx = Math.sin(this.player.viewAngle) * 0.005 * elapsed;
            var dy = Math.cos(this.player.viewAngle) * 0.005 * elapsed;
            this.player.x += dx;
            this.player.y += dy;
            var intX = Math.floor(this.player.x);
            var intY = Math.floor(this.player.y);
            if ((!this.map.inBound(intY, intX)) || this.map.at(intY, intX) === map_1.Cell.Wall) {
                this.player.x -= dx;
                this.player.y -= dy;
            }
        }
        if (this.controller.isPressed(controller_1.Key.DownArrow) || this.controller.isPressed(controller_1.Key.S)) {
            var dx = Math.sin(this.player.viewAngle) * 0.005 * elapsed;
            var dy = Math.cos(this.player.viewAngle) * 0.005 * elapsed;
            this.player.x -= dx;
            this.player.y -= dy;
            var intX = Math.floor(this.player.x);
            var intY = Math.floor(this.player.y);
            if ((!this.map.inBound(intY, intX)) || this.map.at(intY, intX) === map_1.Cell.Wall) {
                this.player.x += dx;
                this.player.y += dy;
            }
        }
        if (this.controller.isPressed(controller_1.Key.D)) {
            var dy = Math.sin(this.player.viewAngle) * 0.005 * elapsed;
            var dx = Math.cos(this.player.viewAngle) * 0.005 * elapsed;
            this.player.x += dx;
            this.player.y -= dy;
            var intX = Math.floor(this.player.x);
            var intY = Math.floor(this.player.y);
            if ((!this.map.inBound(intY, intX)) || this.map.at(intY, intX) === map_1.Cell.Wall) {
                this.player.x -= dx;
                this.player.y += dy;
            }
        }
        if (this.controller.isPressed(controller_1.Key.A)) {
            var dy = Math.sin(this.player.viewAngle) * 0.005 * elapsed;
            var dx = Math.cos(this.player.viewAngle) * 0.005 * elapsed;
            this.player.x -= dx;
            this.player.y += dy;
            var intX = Math.floor(this.player.x);
            var intY = Math.floor(this.player.y);
            if ((!this.map.inBound(intY, intX)) || this.map.at(intY, intX) === map_1.Cell.Wall) {
                this.player.x += dx;
                this.player.y -= dy;
            }
        }
    };
    A3.prototype._drawMetaInfo = function (elapsed) {
        var fps = (1000 / elapsed).toFixed();
        var posString = 'Y=' + this.player.y.toFixed(2) + ' X=' + this.player.x.toFixed(2) + ' A=' + this.player.viewAngle.toFixed(2) + ' FPS=' + fps;
        this.terminal.putString(posString, 0, 0);
        for (var y = 0; y < this.map.height; y++) {
            for (var x = 0; x < this.map.width; x++) {
                this.terminal.put(this.map.at(y, x).symbol, y + 1, x);
            }
        }
        var intX = Math.floor(this.player.x);
        var intY = Math.floor(this.player.y);
        this.terminal.put('P', intY + 1, intX);
    };
    return A3;
}());
exports.A3 = A3;
//# sourceMappingURL=a3.js.map