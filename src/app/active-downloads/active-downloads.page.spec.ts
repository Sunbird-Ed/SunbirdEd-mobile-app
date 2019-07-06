import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveDownloadsPage } from './active-downloads.page';

describe('ActiveDownloadsPage', () => {
  let component: ActiveDownloadsPage;
  let fixture: ComponentFixture<ActiveDownloadsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActiveDownloadsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveDownloadsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
