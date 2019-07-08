import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageFilterPage } from './page-filter.page';

describe('PageFilterPage', () => {
  let component: PageFilterPage;
  let fixture: ComponentFixture<PageFilterPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageFilterPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageFilterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
