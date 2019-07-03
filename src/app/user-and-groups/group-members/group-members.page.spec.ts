import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupMembersPage } from './group-members.page';

describe('GroupMembersPage', () => {
  let component: GroupMembersPage;
  let fixture: ComponentFixture<GroupMembersPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupMembersPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupMembersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
