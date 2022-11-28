import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EntitySearchLocalComponent } from './entity-search-local.component';

describe('EntitySearchLocalComponent', () => {
  let component: EntitySearchLocalComponent;
  let fixture: ComponentFixture<EntitySearchLocalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntitySearchLocalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EntitySearchLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
