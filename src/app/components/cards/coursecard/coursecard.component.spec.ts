import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursecardComponent } from './coursecard.component';

describe('CoursecardComponent', () => {
  let component: CoursecardComponent;
  let fixture: ComponentFixture<CoursecardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoursecardComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoursecardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
