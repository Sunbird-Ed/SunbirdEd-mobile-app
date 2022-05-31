import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-item',
  templateUrl: './skeleton-item.component.html',
  styleUrls: ['./skeleton-item.component.scss'],
})
export class SkeletonItemComponent implements OnInit {
  @Input() width: any;
  @Input() height: any;
  @Input() radius: any;
  styles: any = {};

  ngOnInit() {
    this.styles = {
      width: this.width ? this.width : '100%',
      height: this.height ? this.height : '1rem'
    };

    if (typeof this.radius !== 'undefined' && this.radius !== '') {
      this.styles.borderRadius = this.radius;
    }
  }


}
