import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseBatchesPage } from './course-batches.page';

describe('CourseBatchesPage', () => {
  let component: CourseBatchesPage;
  let fixture: ComponentFixture<CourseBatchesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseBatchesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseBatchesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
