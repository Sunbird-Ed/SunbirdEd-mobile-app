import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SbProgressLoaderPage } from './sb-progress-loader.page';

describe('SbProgressLoaderPage', () => {
  let component: SbProgressLoaderPage;
  let fixture: ComponentFixture<SbProgressLoaderPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SbProgressLoaderPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SbProgressLoaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
