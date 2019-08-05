import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltersPage } from './filters.page';

describe('FiltersPage', () => {
  let component: FiltersPage;
  let fixture: ComponentFixture<FiltersPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FiltersPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FiltersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
