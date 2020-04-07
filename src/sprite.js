"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sprite = /** @class */ (function () {
    function Sprite(text, width, height) {
        this.text = text;
        this.width = width;
        this.height = height;
    }
    Sprite.load = function (name, width, height) {
        return fetch('build/sprites/' + name + '.txt')
            .then(function (response) { return response.text(); })
            .then(function (text) {
            var stripped = text.replace(/(\r\n|\n|\r)/gm, '');
            return new Sprite(stripped, width, height);
        });
    };
    Sprite.prototype.sample = function (x, y) {
        var pixelX = Math.floor(x * this.width);
        var pixelY = Math.floor(y * this.height);
        return this.text[pixelY * this.width + pixelX];
    };
    return Sprite;
}());
exports.Sprite = Sprite;
//# sourceMappingURL=sprite.js.map