import {Pipe, PipeTransform} from '@angular/core';
import {ColorMapping} from '@app/app/app.constant';

@Pipe({
    name: 'randomColorMapPipe',
    pure: true
})
export class RandomColorMapPipe implements PipeTransform {
    private static cache: {[key: string]: any} = {};

    private colors = ColorMapping.map(({primary, secondary}) => ({
        iconBgColor: primary,
        pillBgColor: secondary
    }));

    transform(key: string): any {
        if (!RandomColorMapPipe.cache[key]) {
            RandomColorMapPipe.cache[key] = this.colors[Math.floor(Math.random() * this.colors.length)];
        }

        return RandomColorMapPipe.cache[key];
    }
}
