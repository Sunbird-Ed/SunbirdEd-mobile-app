import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AastrikaSignupPage } from './aastrika-signup.page';

describe('AastrikaSignupPage', () => {
  let component: AastrikaSignupPage;
  let fixture: ComponentFixture<AastrikaSignupPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AastrikaSignupPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AastrikaSignupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
