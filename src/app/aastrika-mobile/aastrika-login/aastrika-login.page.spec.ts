import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AastrikaLoginPage } from './aastrika-login.page';

describe('AastrikaLoginPage', () => {
  let component: AastrikaLoginPage;
  let fixture: ComponentFixture<AastrikaLoginPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AastrikaLoginPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AastrikaLoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
