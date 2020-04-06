export var Colors = {
    BLACK: {svalue: '#000000', value: 0},
    WHITE: {svalue: '#ffffff', value: 0xffffff},
    GREEN: {svalue: '#006400', value: 0x006400}
};


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
    Boundary: '|',
};


class FastTextDrawer {
    constructor(height, width, context, imageData, buf8, data, symbolHeight, symbolWidth, characterToSprite) {
        this.height = height;
        this.width = width;
        this.context = context;
        this.imageData = imageData;
        this.buf8 = buf8;
        this.data = data;
        this.symbolHeight = symbolHeight;
        this.symbolWidth = symbolWidth;
        this.characterToSprite = characterToSprite;
    }

    static create(context, height, width, symbolHeight, symbolWidth) {
        let characterToSprite = FastTextDrawer._getCharactersSprites(context, height, width, symbolHeight, symbolWidth);
        let imageData = context.getImageData(0, 0, width, height);
        let buf = new ArrayBuffer(imageData.data.length);
        let buf8 = new Uint8ClampedArray(buf);
        let data = new Uint32Array(buf);

        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                data[y * width + x] = (255 << 24);
            }
        }

        return new FastTextDrawer(height, width, context, imageData, buf8, data, symbolHeight, symbolWidth, characterToSprite);
    }

    static _getCharactersSprites(originalContext, height, width, symbolHeight, symbolWidth) {
        let fakeCanvas = document.createElement('canvas');
        fakeCanvas.width = width;
        fakeCanvas.height = height;
        let fakeContext = fakeCanvas.getContext('2d');
        fakeContext.font = originalContext.font;
        fakeContext.imageSmoothingEnabled = false;
        let characterToSprite = {};

        for(let i = 32; i < 127; i++) {
            let smb = String.fromCharCode(i);
            RenderCharacters[smb] = smb;
        }

        let entries = Object.entries(RenderCharacters);
        for (let i = 0; i < entries.length; i++) {
            let smb = entries[i][1];
            fakeContext.fillStyle = Colors.BLACK.svalue;
            fakeContext.fillRect(0, 0, symbolWidth, symbolHeight);
            fakeContext.fillStyle = Colors.WHITE.svalue;
            fakeContext.font = originalContext.font;
            fakeContext.textBaseline = 'top';
            fakeContext.fillText(smb, 0, 0);

            let imageData = fakeContext.getImageData(0, 0, symbolWidth, symbolHeight).data;
            let sprite = new Array(symbolWidth * symbolHeight);
            if (sprite.length != imageData.length / 4) {
                console.log(sprite.length, imageData.length / 4);
            }
            for (let i = 0; i < imageData.length / 4; i++) {
                sprite[i] = ((imageData[i * 4] & 0xFF) != 0) ? 1 : 0;
            }
            characterToSprite[smb] = sprite;
        }

        return characterToSprite;
    }

    putAt(smb, y, x, textColor, backgroundColor) {
        let sprite = this.characterToSprite[smb];
        if (sprite == undefined) {
            throw "Unknown character: " + smb;
        }

        let y0 = y * this.symbolHeight;
        let x0 = x * this.symbolWidth;

        for (let i = 0; i < this.symbolHeight; i++) {
            let i0 = i * this.symbolWidth;
            for (let j = 0; j < this.symbolWidth; j++) {
                if (sprite[i0 + j] == 1) {
                    this._writePixel(y0 + i, x0 + j, textColor.value);
                }
                else {
                    this._writePixel(y0 + i, x0 + j, backgroundColor.value);
                }
            }
        }
    }

    update() {
        this.imageData.data.set(this.buf8);
        this.context.putImageData(this.imageData, 0, 0);
    }

    _writePixel(y, x, r, g, b) {
        this.data[y * this.width + x] = (255 << 24) | (b << 16) | (g << 8) | r;
    }
};

export class TerminalScreen {
    // constructor(
    //     width,
    //     height,
    //     font,
    //     buffer,
    //     canvas,
    //     context,
    //     symbolWidth,
    //     symbolHeight) {
    //     this.width = width;
    //     this.height = height;
    //     this.font = font;
    //     this.buffer = buffer;
    //     this.canvas = canvas;
    //     this.context = context;
    //     this.symbolWidth = symbolWidth;
    //     this.symbolHeight = symbolHeight;
    // }
    constructor(width, height, drawer) {
        this.width = width;
        this.height = height;
        this.drawer = drawer;
    }

    static create(width, height, font, canvas_element_name) {
        let canvas = document.getElementById(canvas_element_name);
        if (!canvas.getContext) {
            throw "Cant get canvas";
        }

        let context = canvas.getContext('2d');

        context.font = font;
        context.imageSmoothingEnabled = false

        let symbolWidth = context.measureText('M').width;
        let symbolHeight = context.measureText('\u{2588}').width * 2 - 2;

        canvas.width = symbolWidth * width;
        canvas.height = symbolHeight * height;

        let drawer = FastTextDrawer.create(context, canvas.height, canvas.width, symbolHeight, symbolWidth);

        // let buffer = Array.from({length: width * height}, _ => ' ');

        // context.fillStyle = Colors.BLACK;
        // context.fillRect(0, 0, canvas.width, canvas.height);

        // return new TerminalScreen(width, height, font, buffer, canvas, context, symbolWidth, symbolHeight);
        return new TerminalScreen(width, height, drawer);
    }

    put(smb, y, x) {
        this.drawer.putAt(smb, y, x, Colors.GREEN, Colors.BLACK);
        // this.buffer[y * this.width + x] = smb;
    }

    putString(message, y, x) {
        for (let i = 0; i < message.length; i++) {
            this.put(message.charAt(i), y, x + i);
        }
    }

    update() {
        this.drawer.update();
        // this.context.fillStyle = Colors.BLACK;
        // this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // this.context.fillStyle = Colors.GREEN;
        // this.context.font = this.font;
        // this.context.textBaseline = 'top';

        // for (let y = 0; y < this.height; y++) {
        //     let line = this.buffer.slice(y * this.width, (y + 1) * this.width).join('');
        //     this.context.fillText(line, 0, y * this.symbolHeight);
        // }
    }
}