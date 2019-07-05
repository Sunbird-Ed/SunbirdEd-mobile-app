import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestEditPage } from './guest-edit.page';

describe('GuestEditPage', () => {
  let component: GuestEditPage;
  let fixture: ComponentFixture<GuestEditPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuestEditPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuestEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
