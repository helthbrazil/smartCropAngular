import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgOpenCVModule } from 'ng-open-cv';
import { AppComponent } from './app.component';
import { OpenCVOptions } from 'projects/ng-open-cv/src/public_api';
import { AppRoutingModule } from './app-routing.module';
import { Ng2ImgToolsService, ImgResizeExactService, ImgCropService } from 'ng2-img-tools';
import { NgOpenCvComponent } from './components/ng-open-cv/ng-open-cv.component';
import { Ng2ImgMaxModule } from 'ng2-img-max';
import { Ng2ImgMaxService, ImgMaxSizeService, ImgExifService, ImgMaxPXSizeService } from 'ng2-img-max';
import { Ng2PicaService } from 'ng2-pica';

const openCVConfig: OpenCVOptions = {
  scriptUrl: `assets/opencv/opencv.js`,
  wasmBinaryFile: 'wasm/opencv_js.wasm',
  usingWasm: true
};

@NgModule({
  declarations: [
    AppComponent,
    NgOpenCvComponent
  ],
  imports: [
    BrowserModule,
    Ng2ImgMaxModule,
    NgOpenCVModule.forRoot(openCVConfig),
    AppRoutingModule
  ],
  providers: [Ng2ImgToolsService, ImgResizeExactService, Ng2ImgMaxService,
    ImgMaxSizeService, ImgMaxPXSizeService, ImgExifService, Ng2PicaService,
    ImgCropService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
