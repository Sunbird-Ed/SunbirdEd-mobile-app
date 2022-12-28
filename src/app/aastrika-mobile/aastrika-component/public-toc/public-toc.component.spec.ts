import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { PublicTocComponent } from './public-toc.component'

describe('PublicTocComponent', () => {
  let component: PublicTocComponent
  let fixture: ComponentFixture<PublicTocComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PublicTocComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicTocComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
