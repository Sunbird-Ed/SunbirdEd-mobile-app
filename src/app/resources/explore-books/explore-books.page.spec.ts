import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreBooksPage } from './explore-books.page';

describe('ExploreBooksPage', () => {
  let component: ExploreBooksPage;
  let fixture: ComponentFixture<ExploreBooksPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreBooksPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreBooksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
