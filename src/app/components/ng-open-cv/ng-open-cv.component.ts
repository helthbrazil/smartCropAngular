import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, ɵConsole } from '@angular/core';
import { tap, switchMap, filter } from 'rxjs/operators';
import { NgOpenCVService, OpenCVLoadResult } from 'ng-open-cv';
import { Ng2ImgToolsService } from 'ng2-img-tools';
import { Observable, forkJoin, BehaviorSubject, fromEvent, Observer } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { ImagemCrop } from 'src/app/models/imagemCrop';
import { Arquivo } from 'src/app/models/arquivo';


@Component({
  selector: 'app-ng-open-cv',
  templateUrl: './ng-open-cv.component.html',
  styleUrls: ['./ng-open-cv.component.css']
})
export class NgOpenCvComponent implements OnInit {

  readonly PROPORCAO_LADO = 0.8;
  readonly PROPORCAO_CIMA = 0.4;
  readonly PROPORCAO_BAIXO = 1.2;

  readonly DIMENSOES = [40, 120, 200, 600, 800];

  showLoading = false;
  maxWidth = 800;
  maxHeight = this.maxWidth;
  imageUrl = 'assets/DaveChappelle.jpg';
  // Notifies of the ready state of the classifiers load operation
  private classifiersLoaded = new BehaviorSubject<boolean>(false);
  classifiersLoaded$ = this.classifiersLoaded.asObservable();

  elementosCanvas: Array<any>;
  arquivos: Array<Arquivo>;
  imagensProcessadas: Array<any>
  miniaturasProcessadas: Array<any>

  // HTML Element references
  @ViewChild('fileInput')
  fileInput: ElementRef;
  @ViewChild('canvasInput')
  canvasInput: ElementRef;
  @ViewChild('canvasOutput')
  canvasOutput: ElementRef;

  canvasList: Array<ElementRef>;

  file: any;
  imageData: any;
  imageDataAvatar: any;

  // Inject the NgOpenCVService
  constructor(private ngOpenCVService: NgOpenCVService, private ng2ImgToolsService: Ng2ImgToolsService,
    private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.canvasList = new Array<ElementRef>();
    this.elementosCanvas = new Array<any>();
    this.arquivos = new Array<Arquivo>();
    this.imagensProcessadas = new Array<any>();
    this.miniaturasProcessadas = new Array<any>();

    // Always subscribe to the NgOpenCVService isReady$ observer before using a CV related function to ensure that the OpenCV has been
    // successfully loaded
    this.ngOpenCVService.isReady$
      .pipe(
        // The OpenCV library has been successfully loaded if result.ready === true
        filter((result: OpenCVLoadResult) => result.ready),
        switchMap(() => {
          // Load the face and eye classifiers files
          return this.loadClassifiers();
        })
      )
      .subscribe(() => {
        // The classifiers have been succesfully loaded
        this.classifiersLoaded.next(true);
      });
  }

  ngAfterViewInit(): void { }

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



    // LIMPAR LISTA DE CANVAS
    /* this.canvasList.length = 0;
    let totalFiles = event.target.files.length;

    this.showLoading = true;
    this.clearOutputCanvas();
    if (event.target.files.length) {
      let files = new Array<File>();

      for (let i = 0; i < event.target.files.length; i++) {
        files.push(event.target.files[i]);
      }

      this.ng2ImgToolsService.resize(files, this.maxWidth, this.maxHeight, false).subscribe(response => {
        this.file = response;

        var file = this.file;

        var _URL = window.URL;
        let img = new Image();
        let _this = this;
        img.onload = function () {
          file.largura = img.naturalWidth,
            file.altura = img.naturalHeight;
        };
        img.src = _URL.createObjectURL(this.file);

        this.showLoading = false;

        const reader = new FileReader();
        const load$ = fromEvent(reader, 'load');
        load$
          .pipe(
            switchMap(() => {
              return this.ngOpenCVService.loadImageToHTMLCanvas(`${reader.result}`, this.canvasInput.nativeElement);
            })
          )
          .subscribe(
            () => { },
            err => {
              console.log('Error loading image', err);
            }
          );
        reader.readAsDataURL(response);

      }, error => {
        console.error(error);
      });

    } */
  }
  // Before attempting face detection, we need to load the appropriate classifiers in memory first
  // by using the createFileFromUrl(path, url) function, which takes two parameters
  // @path: The path you will later use in the detectMultiScale function call
  // @url: The url where to retrieve the file from.
  loadClassifiers(): Observable<any> {
    return forkJoin(
      this.ngOpenCVService.createFileFromUrl(
        'haarcascade_frontalface_default.xml',
        `assets/opencv/data/haarcascades/haarcascade_frontalface_default.xml`
      )
    );
  }

  detectFace() {
    this.imagensProcessadas.length = 0;
    this.miniaturasProcessadas.length = 0;
    // before detecting the face we need to make sure that
    // 1. OpenCV is loaded
    // 2. The classifiers have been loaded    

    this.ngOpenCVService.isReady$
      .pipe(
        filter((result: OpenCVLoadResult) => result.ready),
        switchMap(() => {
          return this.classifiersLoaded$;
        }),
        tap(() => {          
          this.findFaceAndEyes();
        })
      )
      .subscribe(() => {
        console.log('Face detected');
      });
  }


  findFaceAndEyes() {
    // Example code from OpenCV.js to perform face and eyes detection
    // Slight adapted for Angular
    this.elementosCanvas.forEach(canvas => {
      const src = cv.imread(canvas.id);
      const gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
      const faces = new cv.RectVector();
      const faceCascade = new cv.CascadeClassifier();
      // load pre-trained classifiers, they should be in memory now
      faceCascade.load('haarcascade_frontalface_default.xml');

      // detect faces
      const msize = new cv.Size(0, 0);
      faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, msize, msize);
      for (let i = 0; i < faces.size(); ++i) {
        // PEGAR SOMENTE O PRIMEIRO ROSTO ENCONTRADO
        if (i == 0) {

          // PROCESSAR REGRA DE CORTE
          let imageCrop = new ImagemCrop(faces.get(i).width, faces.get(i).height, faces.get(i).x, faces.get(i).y);
          let arquivo = this.arquivos.find(arq => arq.nome === canvas.id);
          if (arquivo) {
            imageCrop.alturaImagemOriginal = arquivo.alturaOriginal;
            imageCrop.larguraImagemOriginal = arquivo.larguraOriginal;
            let copiaImageCrop = { ...imageCrop };
            let crop = this.processarLogicaDeCorteDaImagem(imageCrop, false);
            let cropMiniatura = this.processarLogicaDeCorteDaImagem(copiaImageCrop, true);

            this.ng2ImgToolsService.cropImage(arquivo.conteudoOriginal, crop.width, crop.height, crop.x, crop.y).subscribe(response => {
              console.log(response);
              let urlCreator = window.URL;
              let imageData = this.sanitizer.bypassSecurityTrustUrl(
                urlCreator.createObjectURL(response));

              this.imagensProcessadas.push(imageData);
            }, error => {
              console.error(error);
            });

            this.ng2ImgToolsService.cropImage(arquivo.conteudoOriginal, cropMiniatura.width, cropMiniatura.height, cropMiniatura.x, cropMiniatura.y).subscribe(response => {
              console.log(response);
              let urlCreator = window.URL;
              let imageData = this.sanitizer.bypassSecurityTrustUrl(
                urlCreator.createObjectURL(response));

              this.miniaturasProcessadas.push(imageData);
            }, error => {
              console.error(error);
            });
          }



          /*  let copiaImagemCrop = { ...imageCrop };
           let crop = this.processarLogicaDeCorteDaImagem(imageCrop, false);
           let cropMiniatura = this.processarLogicaDeCorteDaImagem(copiaImagemCrop, true);
   
           this.ng2ImgToolsService.cropImage(this.file, crop.width, crop.height, crop.x, crop.y).subscribe(response => {
             console.log(response);
             let urlCreator = window.URL;
             this.imageData = this.sanitizer.bypassSecurityTrustUrl(
               urlCreator.createObjectURL(response));
           }, error => {
             console.error(error);
           });
   
           this.ng2ImgToolsService.cropImage(this.file, cropMiniatura.width, cropMiniatura.height, cropMiniatura.x, cropMiniatura.y).subscribe(response => {
             console.log(response);
             let urlCreator = window.URL;
             this.imageDataAvatar = this.sanitizer.bypassSecurityTrustUrl(
               urlCreator.createObjectURL(response));
           }, error => {
             console.error(error);
           });
   
           const roiGray = gray.roi(faces.get(i));
           const roiSrc = src.roi(faces.get(i));
           const point1 = new cv.Point(faces.get(i).x, faces.get(i).y);
           const point2 = new cv.Point(faces.get(i).x + faces.get(i).width, faces.get(i).y + faces.get(i).height);
           cv.rectangle(src, point1, point2, [255, 0, 0, 255]);
   
           roiGray.delete();
           roiSrc.delete(); */
        }
      }
     // cv.imshow(this.canvasOutput.nativeElement.id, src);
      src.delete();
      gray.delete();
      faceCascade.delete();
      faces.delete();
    });

  }

  processarLogicaDeCorteDaImagem(imagemCrop: ImagemCrop, isMiniatura: boolean): ImagemCrop {
    // ADICIONAR ESPAÇO
    let esquerda = imagemCrop.x - imagemCrop.width * (isMiniatura ? this.PROPORCAO_CIMA : this.PROPORCAO_LADO);
    let direita = imagemCrop.x + imagemCrop.width * (1 + (isMiniatura ? this.PROPORCAO_CIMA : this.PROPORCAO_LADO));
    let acima = imagemCrop.y - imagemCrop.height * (this.PROPORCAO_CIMA);
    let abaixo = imagemCrop.y + imagemCrop.height * (1 + (isMiniatura ? this.PROPORCAO_CIMA : this.PROPORCAO_BAIXO));

    if (acima < 0) {
      esquerda = esquerda - (acima / 2);
      direita = direita + (acima / 2);
      acima = 0;
    }

    if (abaixo > imagemCrop.alturaImagemOriginal) {
      esquerda = esquerda - ((imagemCrop.alturaImagemOriginal - abaixo) / 2);
      direita = direita + ((imagemCrop.alturaImagemOriginal - abaixo) / 2);
      abaixo = imagemCrop.alturaImagemOriginal;
    }

    if (isMiniatura) {

      if (esquerda < 0) {
        acima = acima - (esquerda / 2);
        abaixo = abaixo + (esquerda / 2);
        esquerda = 0;
      }

      if (direita > imagemCrop.larguraImagemOriginal) {
        acima = acima - (imagemCrop.larguraImagemOriginal / 2);
        abaixo = abaixo + (imagemCrop.larguraImagemOriginal / 2);
        direita = imagemCrop.larguraImagemOriginal;
      }

    } else {
      if (esquerda < 0) {
        abaixo = abaixo + esquerda;
        esquerda = 0;
      }

      if (direita > imagemCrop.larguraImagemOriginal) {
        abaixo = abaixo + (imagemCrop.larguraImagemOriginal - direita);
        direita = imagemCrop.larguraImagemOriginal;
      }
    }


    // TRANSFORMAR EM INTEIROS
    esquerda = Math.floor(esquerda);
    direita = Math.floor(direita);
    acima = Math.floor(acima);
    abaixo = Math.floor(abaixo);

    imagemCrop.x = esquerda;
    imagemCrop.y = acima;
    imagemCrop.width = direita - esquerda;
    imagemCrop.height = abaixo - acima;

    return imagemCrop;
  }


  transformarArquivosParaImagensCanvas(arquivos: Array<File>) {
    console.log(arquivos);
    this.elementosCanvas.length = 0;
    this.arquivos.length = 0;
    let elementosCanvas = new Array<any>();

    arquivos.forEach(arquivo => {
      let objetoArquivo = new Arquivo();
      objetoArquivo.conteudoOriginal = arquivo;
      let nomeArquivo = (arquivo.name + '').split('.')[0];
      objetoArquivo.nome = nomeArquivo;
      var canv = document.createElement('canvas');
      canv.id = nomeArquivo;
      this.elementosCanvas.push(canv);


      var _URL = window.URL;
      let img = new Image();
      let _this = this;
      img.onload = function () {
        objetoArquivo.larguraOriginal = img.naturalWidth,
          objetoArquivo.alturaOriginal = img.naturalHeight;
        _this.arquivos.push(objetoArquivo);
      };
      img.src = _URL.createObjectURL(arquivo);

      this.showLoading = false;

      const reader = new FileReader();
      const load$ = fromEvent(reader, 'load');
      load$
        .pipe(
          switchMap(() => {
            let canv1 = <HTMLCanvasElement>document.getElementById(canv.id);
            return this.ngOpenCVService.loadImageToHTMLCanvas(`${reader.result}`, canv1);
          })
        )
        .subscribe(
          () => { },
          err => {
            console.log('Error loading image', err);
          }
        );
      reader.readAsDataURL(arquivo);

    });

    console.info(this.elementosCanvas);

  }




}
