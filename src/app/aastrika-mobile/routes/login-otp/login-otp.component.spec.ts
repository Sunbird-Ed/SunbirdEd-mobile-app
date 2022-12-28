import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { LoginOtpComponent } from './login-otp.component'

describe('LoginOtpComponent', () => {
  let component: LoginOtpComponent
  let fixture: ComponentFixture<LoginOtpComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoginOtpComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginOtpComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
