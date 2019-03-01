import { Component, OnInit, ElementRef } from '@angular/core';
import { Ng2ImgToolsService } from 'ng2-img-tools';

@Component({
  selector: 'app-multiple-canvas',
  templateUrl: './multiple-canvas.component.html',
  styleUrls: ['./multiple-canvas.component.css']
})
export class MultipleCanvasComponent implements OnInit {

  elementosCanvas: Array<any>;

  constructor(private ng2ImgToolsService: Ng2ImgToolsService) { }

  ngOnInit() {
    this.elementosCanvas = new Array<ElementRef>();
  }

  readDataUrl(event) {
    // LIMPAR LISTA DE CANVAS
    let totalDeArquivos = event.target.files.length;
    let arquivos = new Array<File>();
    let arquivosRedimensionados = new Array<File>();

    for (let i = 0; i < totalDeArquivos; i++) {
      arquivos.push(event.target.files[i]);
    }

    this.ng2ImgToolsService.resize(arquivos, 800, 800, false).subscribe(response => {
      arquivosRedimensionados.push(response);
      if (arquivosRedimensionados.length === totalDeArquivos) {
        this.transformarArquivosParaImagensCanvas(arquivosRedimensionados);
      }
    }, error => {
      console.error(error);
    });


    /* 
        for (let i = 0; i < totalFiles; i++) {
          let file = event.target.files[i];
          let fileName = (file.name + '').split('.')[0];
    
          this.ng2ImgToolsService.resizeImage(file, 800, 800, false).subscribe(response => {
            elementos.push(response);
            if (elementos.length === totalFiles.length) {
              console.log('processar');
            }
          }, error => {
            console.error(error);
          });
    
    
          var canv = document.createElement('canvas');
          canv.id = fileName;
          elementos.push(canv);
    
        } */


  }

  transformarArquivosParaImagensCanvas(arquivos: Array<File>) {
    console.log(arquivos);
    this.elementosCanvas.length = 0;
    let elementosCanvas = new Array<any>();

    arquivos.forEach(arquivo => {
      let nomeArquivo = (arquivo.name + '').split('.')[0];
      var canv = document.createElement('canvas');
      canv.id = nomeArquivo;
      this.elementosCanvas.push(canv);
    });

    console.info(this.elementosCanvas);

  }

}
