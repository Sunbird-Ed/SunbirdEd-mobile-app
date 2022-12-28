import { Component, OnInit } from '@angular/core'
import { RouterLinks } from '@app/app/app.constant'

@Component({
  selector: 'ws-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  homePage() {
    location.href = `/${RouterLinks.HOME}/user`
  }
}
