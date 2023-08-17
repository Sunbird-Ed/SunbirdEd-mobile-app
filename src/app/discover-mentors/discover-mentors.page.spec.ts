import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { DiscoverMentorsPage } from './discover-mentors.page';

describe('DiscoverMentorsPage', () => {
  let component: DiscoverMentorsPage;
  let fixture: ComponentFixture<DiscoverMentorsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DiscoverMentorsPage],
      imports: [IonicModule.forRoot(), TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DiscoverMentorsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct initial values', () => {
    expect(component.searchInfoVisibility).toEqual('hide');
    expect(component.appName).toEqual('Your App Name');
    expect(component.searchKeywords).toEqual('');
  });

  it('should handle search', () => {
    const searchKeywords = 'example search';
    component.searchKeywords = searchKeywords;
    spyOn(console, 'log'); // Spy on the console.log method

    component.handleSearch();

    expect(console.log).toHaveBeenCalledWith('Search triggered:', searchKeywords);
  });
});
