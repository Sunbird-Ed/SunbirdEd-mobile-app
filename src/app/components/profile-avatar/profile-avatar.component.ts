import { Component, Input, OnInit, OnChanges } from '@angular/core';
import GraphemeSplitter from 'grapheme-splitter';

@Component({
  selector: 'app-profile-avatar',
  templateUrl: './profile-avatar.component.html',
  styleUrls: ['./profile-avatar.component.scss'],
})
export class ProfileAvatarComponent implements OnInit , OnChanges {
  @Input() username: string;
  @Input() isStateUser: boolean;
  bgColor: string;
  color: string;
  initial: string;
  // GraphemeSplitter = require('grapheme-splitter');
  constructor() { }
  ngOnInit() {
    this.extractInitial();
  }

  /**
   * It will detect the changes of username and call the extractInitial() method
   * @param changes
   */
  ngOnChanges(changes: any) {
    this.username = changes.username.currentValue;
    this.extractInitial();
  }

  getBgColor(pname) {
    this.bgColor = this.stringToColor(pname.toLowerCase());
    this.color = this.getContrast(this.bgColor);
  }

  /*Get color Hex code by passing a string*/
  stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      // tslint:disable-next-line:no-bitwise
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let colour = '#';
    for (let i = 0; i < 3; i++) {
      // tslint:disable-next-line:no-bitwise
      const value = (hash >> (i * 8)) & 0xFF;
      colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
  }

  /*Get text contrast by passing background hex color*/
  getContrast(hexcolor) {
    const r = parseInt(hexcolor.substr(1, 2), 16);
    const g = parseInt(hexcolor.substr(3, 2), 16);
    const b = parseInt(hexcolor.substr(5, 2), 16);
    const color = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (color >= 128) ? '#000000' : '#ffffff';
  }

  /**
 * It will extract the first character of the user name and return with different BG color
 */
  extractInitial() {
    const splitter = new GraphemeSplitter();
    const split: string[] = splitter.splitGraphemes(this.username.trim());
    this.initial = split[0];
    if (this.initial) {
      this.getBgColor(this.username);
    }
  }
}
