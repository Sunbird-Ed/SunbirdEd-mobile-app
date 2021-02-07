import { DiscoverContainerPage } from './discover-container.page';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Events } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppHeaderService } from '../../services/app-header.service';
import { SearchEventsService } from './search-events-service';

describe('DiscoverContainerPage', () => {
  let discoverContainerPage: DiscoverContainerPage;
  const mockAppVersion: Partial<AppVersion> = {
    getAppName: jest.fn(() => Promise.resolve('sunbird'))
  };
  const mockEvents: Partial<Events> = {
    subscribe: jest.fn()
  };
  const mockHeaderService: Partial<AppHeaderService> = {};
  const mockRouter: Partial<Router> = {};
  const mockSearchEventsService: Partial<SearchEventsService> = {};


  beforeAll(() => {
    discoverContainerPage = new DiscoverContainerPage(
      mockAppVersion as AppVersion, 
      mockHeaderService as AppHeaderService,
      mockRouter as Router,
      mockEvents as Events,
      mockSearchEventsService as SearchEventsService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be create an instance of DiscoverContainerPage', () => {
    expect(DiscoverContainerPage).toBeTruthy();
  });
});
