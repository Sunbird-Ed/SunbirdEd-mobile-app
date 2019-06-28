import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInCardComponent } from './sign-in-card.component';

describe('SignInCardComponent', () => {
  let component: SignInCardComponent;
  let fixture: ComponentFixture<SignInCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignInCardComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignInCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
