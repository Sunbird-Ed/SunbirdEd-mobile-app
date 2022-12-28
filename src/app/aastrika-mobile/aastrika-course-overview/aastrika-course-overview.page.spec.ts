import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AastrikaCourseOverviewPage } from './aastrika-course-overview.page';

describe('AastrikaCourseOverviewPage', () => {
  let component: AastrikaCourseOverviewPage;
  let fixture: ComponentFixture<AastrikaCourseOverviewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AastrikaCourseOverviewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AastrikaCourseOverviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
