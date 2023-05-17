import {Pipe, PipeTransform} from '@angular/core';
import {ColorMapping} from '../../app/app.constant';

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

    transform(key: string, index?: number): any {
        if (!RandomColorMapPipe.cache[key]) {
            if (!index && index !== 0) {
                let val = Math.random();
                RandomColorMapPipe.cache[key] = this.colors[Math.floor(val * this.colors.length)];
            } else {
                RandomColorMapPipe.cache[key] = this.colors[(index % this.colors.length)];
            }
        }

        return RandomColorMapPipe.cache[key];
    }
}
