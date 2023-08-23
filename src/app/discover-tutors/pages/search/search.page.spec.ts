import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiscoverTutorsPage } from './search.page';
import { DsepService } from '../../services/dsep.service';
import { of } from 'rxjs';

describe('DiscoverTutorsPage', () => {
  let component: DiscoverTutorsPage;
  let fixture: ComponentFixture<DiscoverTutorsPage>;
  let mockDsepService: jasmine.SpyObj<DsepService>;

  beforeEach(() => {
    mockDsepService = jasmine.createSpyObj('DsepService', ['searchTutors']);

    TestBed.configureTestingModule({
      declarations: [DiscoverTutorsPage],
      providers: [{ provide: DsepService, useValue: mockDsepService }],
    });

    fixture = TestBed.createComponent(DiscoverTutorsPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set tutors when searchTutors is called', () => {
    const mockResponse = { tutors: [{ name: 'Tutor 1' }, { name: 'Tutor 2' }] };
    mockDsepService.searchTutors.and.returnValue(of(mockResponse));

    component.searchTutors('math');

    expect(component.tutors).toEqual(mockResponse.tutors);
  });
});
