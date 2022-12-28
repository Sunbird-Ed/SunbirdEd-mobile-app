import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AastrikaHomePage } from './aastrika-home.page';

describe('AastrikaHomePage', () => {
  let component: AastrikaHomePage;
  let fixture: ComponentFixture<AastrikaHomePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AastrikaHomePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AastrikaHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
