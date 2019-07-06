import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionDetailEtbPage } from './collection-detail-etb.page';

describe('CollectionDetailEtbPage', () => {
  let component: CollectionDetailEtbPage;
  let fixture: ComponentFixture<CollectionDetailEtbPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionDetailEtbPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionDetailEtbPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
