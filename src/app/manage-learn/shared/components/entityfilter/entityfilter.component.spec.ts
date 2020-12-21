import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityfilterComponent } from './entityfilter.component';

describe('EntityfilterComponent', () => {
  let component: EntityfilterComponent;
  let fixture: ComponentFixture<EntityfilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityfilterComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityfilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
