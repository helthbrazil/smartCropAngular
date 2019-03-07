import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, ɵConsole } from '@angular/core';
import { tap, switchMap, filter } from 'rxjs/operators';
import { NgOpenCVService, OpenCVLoadResult } from 'ng-open-cv';
import { Ng2ImgToolsService } from 'ng2-img-tools';
import { Observable, forkJoin, BehaviorSubject, fromEvent, Observer } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { ImagemCrop } from 'src/app/models/imagemCrop';
import { Arquivo } from 'src/app/models/arquivo';
import { ResizeServiceService } from 'src/app/services/resize-service.service';


@Component({
  selector: 'app-ng-open-cv',
  templateUrl: './ng-open-cv.component.html',
  styleUrls: ['./ng-open-cv.component.css']
})
export class NgOpenCvComponent implements OnInit {

  mensagemLoading: string;

  readonly PROPORCAO_LADO = 0.8;
  readonly PROPORCAO_CIMA = 0.4;
  readonly PROPORCAO_BAIXO = 1.2;

  readonly DIMENSOES = [40, 120, 200, 600, 800];

  limiteArquivos = 50;

  showLoading = false;
  maxWidth = 800;
  maxHeight = this.maxWidth;
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
    private sanitizer: DomSanitizer, private resizeService: ResizeServiceService) { }

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

    let observerRedimensionar = new Array<any>();
    let observerLoad = new Array<any>();

    // LIMPAR LISTA DE CANVAS
    let totalDeArquivos = event.target.files.length;

    if(totalDeArquivos > this.limiteArquivos){
      alert(`O máximo de arquivos permitidos é ${this.limiteArquivos} arquivos`);
      throw 'Quantidade de arquivos excedida';
    }

    if (totalDeArquivos > 0) {
      this.showLoading = true;
      this.mensagemLoading = 'Padronizando tamanho das imagens';
      this.imagensProcessadas.length = 0;
      this.elementosCanvas.length = 0;
      this.miniaturasProcessadas.length = 0;
    }

    let arquivos = new Array<File>();
    let arquivosRedimensionados = new Array<File>();

    for (let i = 0; i < totalDeArquivos; i++) {
      arquivos.push(event.target.files[i]);
      observerRedimensionar.push(this.resizeService.redimensionar(this.maxWidth, arquivos[i]));
    }

    forkJoin(observerRedimensionar).subscribe(response => {
      console.info('imagens redimensionadas');
      response.forEach(item => {
        this.elementosCanvas.push(item);
      });

      this.elementosCanvas.forEach(elemento => {
        observerLoad.push(this.ngOpenCVService.loadImageToHTMLCanvas(elemento.dataurl, elemento.canvas));
      });

      forkJoin(observerLoad).subscribe(response => {
        console.info('imagens carregadas');
        setTimeout(() => {
          this.detectFace();
        }, 100);
      });
    });

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
    this.showLoading = true;
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
    console.info('Detectando faces');
    this.showLoading = true;
    let quantidadeImagens = this.arquivos.length;
    let contador = 0;
    // Example code from OpenCV.js to perform face and eyes detection
    // Slight adapted for Angular    
    this.mensagemLoading = 'Detectando faces e processando imagens';
    let observerCorteFinal = new Array<any>();
    this.elementosCanvas.forEach(item => {
      let canvas = item.canvas;
      contador++;
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
          console.info(`Rosto encontrado [${canvas.id}]`);
          // PROCESSAR REGRA DE CORTE
          let imageCrop = new ImagemCrop(faces.get(i).width, faces.get(i).height, faces.get(i).x, faces.get(i).y);

          imageCrop.alturaImagemOriginal = item.originalHeight;
          imageCrop.larguraImagemOriginal = item.originalWidth;
          let copiaImageCrop = { ...imageCrop };
          let crop = this.processarLogicaDeCorteDaImagem(imageCrop, false);
          let cropMiniatura = this.processarLogicaDeCorteDaImagem(copiaImageCrop, true);

          observerCorteFinal.push(this.resizeService.cortarImagem(item, crop, cropMiniatura));
        }
      }
      // cv.imshow(this.canvasOutput.nativeElement.id, src);
      src.delete();
      gray.delete();
      faceCascade.delete();
      faces.delete();
    });

    console.log('Processando imagens');
    forkJoin(observerCorteFinal).subscribe(response => {
      console.log('Imagens Processadas');
      this.showLoading = false;
      for (let i = 0; i < response.length; i++) {
        this.imagensProcessadas.push(response[i].imagemPrincipal);
        this.miniaturasProcessadas.push(response[i].imagemMiniatura);
      }      
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
}
