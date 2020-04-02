export class TerminalScreen {
    constructor(width, height, font, buffer, canvas, context, symbolWidth, symbolHeight) {
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

        let context = canvas.getContext('2d');
        
        context.font = font;

        let symbolWidth = context.measureText('M').width;
        let symbolHeight = context.measureText('\u{2588}').width * 2;

        canvas.width = symbolWidth * width;
        canvas.height = symbolHeight * height;

        let buffer = Array.from({length: width * height}, _ => ' ');

        context.fillStyle = '#000000';
        context.fillRect(0, 0, canvas.width, canvas.height);

        return new TerminalScreen(width, height, font, buffer, canvas, context, symbolWidth, symbolHeight);
    }

    clear() {
        for (let i = 0; i < this.height * this.width; i++) {
            this.buffer[i] = ' ';
        }        
    }

    put(smb, x, y) {
        this.buffer[y * this.width + x] = smb;
    }

    putString(message, x, y) {
        for (let i = 0; i < message.length; i++) {
            this.put(message.charAt(i), x + i, y);
        }
    }

    update() {
        this.context.fillStyle = '#000000';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.fillStyle = "#ffffff";
        this.context.font = this.font;
        this.context.textBaseline = 'top';

        for (let y = 0; y < this.height; y++) {
            let line = this.buffer.slice(y * this.width, (y + 1) * this.width).join('');
            this.context.fillText(line, 0, y * this.symbolHeight);
        }
    }
}