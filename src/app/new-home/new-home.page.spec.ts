import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewHomePage } from './new-home.page';

describe('NewHomePage', () => {
  let component: NewHomePage;
  let fixture: ComponentFixture<NewHomePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewHomePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
