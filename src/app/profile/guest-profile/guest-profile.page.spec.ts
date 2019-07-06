import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestProfilePage } from './guest-profile.page';

describe('GuestProfilePage', () => {
  let component: GuestProfilePage;
  let fixture: ComponentFixture<GuestProfilePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuestProfilePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuestProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
