import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSyncComponent } from './data-sync.component';

describe('DataSyncComponent', () => {
  let component: DataSyncComponent;
  let fixture: ComponentFixture<DataSyncComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataSyncComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSyncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
