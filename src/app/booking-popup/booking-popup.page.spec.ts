import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingPopupPage } from './booking-popup.page';

describe('BookingPopupPage', () => {
  let component: BookingPopupPage;
  let fixture: ComponentFixture<BookingPopupPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BookingPopupPage],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingPopupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
