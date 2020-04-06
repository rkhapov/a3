export var Colors = {
    BLACK: '#000000',
    WHITE: '#ffffff',
    GREEN: '#006400'
};

// class FastTextDrawer {
//     constructor(height, width, context) {
//         this.context = context;
//     }

//     update() {

//     }
// };

export class TerminalScreen {
    constructor(
        width,
        height,
        font,
        buffer,
        canvas,
        context,
        symbolWidth,
        symbolHeight) {
        this.width = width;
        this.height = height;
        this.font = font;
        this.buffer = buffer;
        this.canvas = canvas;
        this.context = context;
        this.symbolWidth = symbolWidth;
        this.symbolHeight = symbolHeight;
    }

    static create(width, height, font, canvas_element_name) {
        let canvas = document.getElementById(canvas_element_name);
        if (!canvas.getContext) {
            throw "Cant get canvas";
        }

        let context = canvas.getContext('2d', { alpha: false });

        context.font = font;
        context.imageSmoothingEnabled= false

        let symbolWidth = context.measureText('M').width;
        let symbolHeight = context.measureText('\u{2588}').width * 2 - 2;

        canvas.width = symbolWidth * width;
        canvas.height = symbolHeight * height;

        let buffer = Array.from({length: width * height}, _ => ' ');

        context.fillStyle = Colors.BLACK;
        context.fillRect(0, 0, canvas.width, canvas.height);

        return new TerminalScreen(width, height, font, buffer, canvas, context, symbolWidth, symbolHeight);
    }

    clear() {
        for (let i = 0; i < this.height * this.width; i++) {
            this.buffer[i] = ' ';
        }
    }

    put(smb, y, x) {
        this.buffer[y * this.width + x] = smb;
    }

    putString(message, y, x) {
        for (let i = 0; i < message.length; i++) {
            this.put(message.charAt(i), y, x + i);
        }
    }

    update() {
        this.context.fillStyle = Colors.BLACK;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.fillStyle = Colors.GREEN;
        this.context.font = this.font;
        this.context.textBaseline = 'top';

        for (let y = 0; y < this.height; y++) {
            let line = this.buffer.slice(y * this.width, (y + 1) * this.width).join('');
            this.context.fillText(line, 0, y * this.symbolHeight);
        }
    }
}