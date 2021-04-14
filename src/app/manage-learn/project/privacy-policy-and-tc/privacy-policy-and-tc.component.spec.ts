import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PrivacyPolicyAndTCComponent } from './privacy-policy-and-tc.component';

describe('PrivacyPolicyAndTCComponent', () => {
  let component: PrivacyPolicyAndTCComponent;
  let fixture: ComponentFixture<PrivacyPolicyAndTCComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivacyPolicyAndTCComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PrivacyPolicyAndTCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
