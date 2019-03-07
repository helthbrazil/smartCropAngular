export class ArquivoImagem {
    nome: string;
    dataURL: string;
    dataURLMiniatura: string;

    constructor(nome: string, dataURL: string, dataURLMiniatura: string) {
        this.nome = nome;
        this.dataURL = dataURL;
        this.dataURLMiniatura = dataURLMiniatura;
    }
}