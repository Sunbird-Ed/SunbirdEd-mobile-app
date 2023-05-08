import {Pipe, PipeTransform} from '@angular/core';
import {DatePipe} from '@angular/common';
import {CommonUtilService} from '../../services/common-util.service';

export enum Interval {
    YEAR = 'year',
    MONTH = 'month',
    WEEK = 'week',
    DAY = 'day',
    HOUR = 'hour',
    MINUTE = 'minute',
    SECOND = 'second'
}

@Pipe({
    name: 'dateAgo',
    pure: true
})
export class DateAgoPipe implements PipeTransform {
    constructor(
        private datePipe: DatePipe,
        private commonUtilService: CommonUtilService
    ) {
    }

    transform(
        value: string,
        limit?: Interval,
        format?: string
    ): any {
        if (value) {
            const seconds = Math.floor((+new Date() - +new Date(value)) / 1000);

            if (seconds <= 0) {
                return this.commonUtilService.translateMessage(`SECONDS_AGO`, 0);
            }

            const intervals = {
                [Interval.YEAR]: {duration: 31536000},
                [Interval.MONTH]: {duration: 2592000},
                [Interval.WEEK]: {duration: 604800},
                [Interval.DAY]: {duration: 86400},
                [Interval.HOUR]: {duration: 3600},
                [Interval.MINUTE]: {duration: 60},
                [Interval.SECOND]: {duration: 1}
            };
            let counter;
            // tslint:disable-next-line:forin
            for (const i in intervals) {
                counter = Math.floor(seconds / intervals[i].duration);
                if (counter > 0) {
                    if (
                        limit && intervals[limit] &&
                        intervals[i].duration > intervals[limit].duration
                    ) {
                        if (!format) {
                            return value;
                        }

                        return this.datePipe.transform(new Date(value), format);
                    }

                    if (counter === 1) {
                        return this.commonUtilService.translateMessage(`${i.toUpperCase()}_AGO`, counter);
                    } else {
                        return this.commonUtilService.translateMessage(`${i.toUpperCase()}S_AGO`, counter);
                    }
                }
            }
        }
        return value;
    }
}
