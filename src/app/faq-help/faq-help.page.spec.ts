import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqHelpPage } from './faq-help.page';

describe('FaqHelpPage', () => {
  let component: FaqHelpPage;
  let fixture: ComponentFixture<FaqHelpPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaqHelpPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqHelpPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
