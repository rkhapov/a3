"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cell = {
    Wall: { index: 0, symbol: '#' },
    Empty: { index: 1, symbol: '.' }
};
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
            map[i] = Array.from(strings[i].split('').map(function (c) { return c === '#' ? exports.Cell.Wall : exports.Cell.Empty; }));
        }
        return new Map(map, height, width);
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