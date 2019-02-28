import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgOpenCvComponent } from './ng-open-cv.component';

describe('NgOpenCvComponent', () => {
  let component: NgOpenCvComponent;
  let fixture: ComponentFixture<NgOpenCvComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgOpenCvComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgOpenCvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
