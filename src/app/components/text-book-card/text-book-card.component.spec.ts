import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextBookCardComponent } from './text-book-card.component';

describe('TextBookCardComponent', () => {
  let component: TextBookCardComponent;
  let fixture: ComponentFixture<TextBookCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextBookCardComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextBookCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
