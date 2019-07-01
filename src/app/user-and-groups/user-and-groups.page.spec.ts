import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAndGroupsPage } from './user-and-groups.page';

describe('UserAndGroupsPage', () => {
  let component: UserAndGroupsPage;
  let fixture: ComponentFixture<UserAndGroupsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserAndGroupsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAndGroupsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
