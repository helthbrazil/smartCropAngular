import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgOpenCvComponent } from './components/ng-open-cv/ng-open-cv.component';
import { MultipleCanvasComponent } from './components/multiple-canvas/multiple-canvas.component';


const routes: Routes = [
  { path: '', redirectTo: '/ngOpenCv', pathMatch: 'full' },
  { path: 'ngOpenCv', component: NgOpenCvComponent },
  { path: 'multipleCanvas', component: MultipleCanvasComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
