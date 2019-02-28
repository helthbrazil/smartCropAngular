import { Injectable } from '@angular/core';
import { Ng2ImgToolsService } from 'ng2-img-tools';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResizeServiceService {

  file: File;
  imageData: any;
  maxWidth: number;

  constructor(private ng2ImgToolsService: Ng2ImgToolsService) {
  }

  redimensionar(file: File): Observable<Blob> {
    return this.ng2ImgToolsService.resizeImage(this.file, this.maxWidth, this.maxWidth, false);
  }

}
