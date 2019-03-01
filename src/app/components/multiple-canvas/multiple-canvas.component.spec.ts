import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleCanvasComponent } from './multiple-canvas.component';

describe('MultipleCanvasComponent', () => {
  let component: MultipleCanvasComponent;
  let fixture: ComponentFixture<MultipleCanvasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultipleCanvasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
