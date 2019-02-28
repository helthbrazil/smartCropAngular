export class ImagemCrop {
    width: number;
    height: number;
    x: number;
    y: number;
    alturaImagemOriginal: number;
    larguraImagemOriginal: number;

    constructor(width: number, height: number, x: number, y: number) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
    }
}