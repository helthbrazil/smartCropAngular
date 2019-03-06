import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResizeServiceService {

  file: File;
  imageData: any;
  maxWidth: number;

  constructor() {
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

    })


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

    //Old Code
    //write the ArrayBuffer to a blob, and you're done
    //var bb = new BlobBuilder();
    //bb.append(ab);
    //return bb.getBlob(mimeString);

    //New Code
    return new Blob([ab], { type: mimeString });


  }

}
