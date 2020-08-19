import { Pipe, PipeTransform } from '@angular/core';
import GraphemeSplitter from 'grapheme-splitter';

@Pipe(
    { name: 'initial' }
)

export class InitialPipe implements PipeTransform {
  transform(value) {
    let initial = '';
    if (value) {
      const splitter = new GraphemeSplitter();
      const split: string[] = splitter.splitGraphemes(value.trim());
      initial = split[0];
    }
    return initial;
  }
}
