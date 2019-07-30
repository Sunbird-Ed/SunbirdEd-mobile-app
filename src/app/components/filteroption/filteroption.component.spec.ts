import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilteroptionComponent } from './filteroption.component';

describe('FilteroptionComponent', () => {
  let component: FilteroptionComponent;
  let fixture: ComponentFixture<FilteroptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilteroptionComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilteroptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
