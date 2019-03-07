import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ImagemCrop } from '../models/imagemCrop';

@Injectable({
  providedIn: 'root'
})
export class ResizeServiceService {

  file: File;
  imageData: any;
  maxWidth: number;

  constructor() {
  }

  cortarImagem(item: any, imagemCropPrincipal: ImagemCrop, imagemCropMiniatura: ImagemCrop): Observable<any> {
    return new Observable<any>(observer => {
      let imageSrc = item.canvas.toDataURL();
      var canvasPrincipal = document.createElement('canvas');
      var canvasMiniatura = document.createElement('canvas');

      canvasPrincipal.style.display = 'none';
      canvasMiniatura.style.display = 'none';

      var ctxPrincipal = canvasPrincipal.getContext('2d');
      var ctxMiniatura = canvasMiniatura.getContext('2d');
      var _this = this;

      var img = new Image();
      img.onload = function () {
        canvasPrincipal.width = imagemCropPrincipal.width;
        canvasPrincipal.height = imagemCropPrincipal.height;

        canvasMiniatura.width = imagemCropMiniatura.width;
        canvasMiniatura.height = imagemCropMiniatura.height;

        ctxPrincipal.drawImage(img, imagemCropPrincipal.x, imagemCropPrincipal.y, imagemCropPrincipal.width,
          imagemCropPrincipal.height, 0, 0, imagemCropPrincipal.width, imagemCropPrincipal.height);
        ctxMiniatura.drawImage(img, imagemCropMiniatura.x, imagemCropMiniatura.y, imagemCropMiniatura.width,
          imagemCropMiniatura.height, 0, 0, imagemCropMiniatura.width, imagemCropMiniatura.height);

        observer.next({
          imagemPrincipal: canvasPrincipal.toDataURL(),
          imagemMiniatura: canvasMiniatura.toDataURL()
        });
        observer.complete();
      };
      img.src = imageSrc;
    });

  }

  redimensionar(maxSize, arquivo: any): Observable<any> {
    let _this = this;
    return new Observable<any>(observer => {
      if (arquivo) {

        var reader = new FileReader();
        // Set the image once loaded into file reader
        reader.onload = function (e: any) {
          var _URL = window.URL;
          var imagem = new Image();
          let fileName = (arquivo.name + '').split('.')[0];

          imagem.onload = function () {

            var canvas = document.createElement("canvas");
            canvas.id = fileName;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(imagem, 0, 0);

            var MAX_WIDTH = maxSize;
            var MAX_HEIGHT = maxSize;
            var width = imagem.width;
            var height = imagem.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(imagem, 0, 0, width, height);
            let dataurl = canvas.toDataURL(arquivo.type);


            // ATUALIZAR ARQUIVO ORIGINAL
            let arquivoRedimensionado = _this.dataURItoBlob(dataurl);
            canvas.style.display = "none";
            document.body.appendChild(canvas);
            observer.next({
              canvas: canvas,
              dataurl: dataurl,
              originalWidth: width,
              originalHeight: height,
              arquivoOriginal: arquivoRedimensionado
            });
            observer.complete();
          };
          imagem.src = _URL.createObjectURL(arquivo);
        }
        reader.readAsDataURL(arquivo);
      }
    });
  }

  private dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    //New Code
    return new Blob([ab], { type: mimeString });
  }

}
