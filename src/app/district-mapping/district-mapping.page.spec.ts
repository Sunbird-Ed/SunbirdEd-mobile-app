import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DistrictMappingPage } from './district-mapping.page';

describe('DistrictMappingPage', () => {
  let component: DistrictMappingPage;
  let fixture: ComponentFixture<DistrictMappingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DistrictMappingPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DistrictMappingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
