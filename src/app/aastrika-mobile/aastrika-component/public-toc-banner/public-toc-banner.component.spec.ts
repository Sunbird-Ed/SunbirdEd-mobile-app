import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { PublicTocBannerComponent } from './public-toc-banner.component'

describe('PublicTocBannerComponent', () => {
  let component: PublicTocBannerComponent
  let fixture: ComponentFixture<PublicTocBannerComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PublicTocBannerComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicTocBannerComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
