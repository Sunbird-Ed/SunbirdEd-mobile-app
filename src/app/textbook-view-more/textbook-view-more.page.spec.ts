import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextbookViewMorePage } from './textbook-view-more.page';

describe('TextbookViewMorePage', () => {
  let component: TextbookViewMorePage;
  let fixture: ComponentFixture<TextbookViewMorePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextbookViewMorePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextbookViewMorePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
