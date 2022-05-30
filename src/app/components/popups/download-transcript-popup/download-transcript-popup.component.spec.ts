import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DownloadTranscriptPopupComponent } from './download-transcript-popup.component';

describe('DownloadTranscriptPopupComponent', () => {
  let component: DownloadTranscriptPopupComponent;
  let fixture: ComponentFixture<DownloadTranscriptPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadTranscriptPopupComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DownloadTranscriptPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
