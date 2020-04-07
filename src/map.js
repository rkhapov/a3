"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cell = {
    Wall: { index: 0, symbol: '#' },
    Empty: { index: 1, symbol: '.' },
    Skeleton: { index: 2, symbol: '@' }
};
var MapObject = /** @class */ (function () {
    function MapObject(x, y) {
        this.x = x;
        this.y = y;
    }
    return MapObject;
}());
exports.MapObject = MapObject;
var Map = /** @class */ (function () {
    function Map(map, height, width) {
        this.map = map;
        this.height = height;
        this.width = width;
    }
    Map.fromStrings = function (strings) {
        var height = strings.length;
        var width = strings[0].length;
        var map = new Array(height);
        for (var i = 0; i < height; i++) {
            map[i] = Array.from(strings[i].split('').map(function (c) { return Map.getCellBySymbol(c); }));
        }
        return new Map(map, height, width);
    };
    Map.getCellBySymbol = function (smb) {
        switch (smb) {
            case '#': return exports.Cell.Wall;
            case '@': return exports.Cell.Skeleton;
            default: return exports.Cell.Empty;
        }
    };
    Map.prototype.getObjects = function () {
        var objects = new Array();
        for (var i = 0; i < this.height; i++) {
            for (var j = 0; j < this.width; j++) {
                if (this.map[i][j] === exports.Cell.Skeleton) {
                    objects.push(new MapObject(j + 0.5, i + 0.5));
                }
            }
        }
        return objects;
    };
    Map.prototype.inBound = function (y, x) {
        return y >= 0 && y < this.height && x >= 0 && x < this.width;
    };
    Map.prototype.at = function (y, x) {
        return this.map[y][x];
    };
    return Map;
}());
exports.Map = Map;
//# sourceMappingURL=map.js.map