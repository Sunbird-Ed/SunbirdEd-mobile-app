import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrolledCourseDetailsPagePage } from './enrolled-course-details-page.page';

describe('EnrolledCourseDetailsPagePage', () => {
  let component: EnrolledCourseDetailsPagePage;
  let fixture: ComponentFixture<EnrolledCourseDetailsPagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnrolledCourseDetailsPagePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrolledCourseDetailsPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
