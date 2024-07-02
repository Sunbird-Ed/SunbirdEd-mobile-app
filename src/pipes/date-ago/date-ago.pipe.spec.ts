import {DateAgoPipe} from '../../pipes/date-ago/date-ago.pipe';
import {DatePipe} from '@angular/common';
import {CommonUtilService} from '../../services';

describe('DateAgoPipe', () => {
    const mockCommonUtilsService: Partial<CommonUtilService> = {
        translateMessage: (translationKey, param) => `${translationKey}-${param}`
    };
    const dateAgoPipe = new DateAgoPipe(
        new DatePipe('en'),
        mockCommonUtilsService
    );

    describe('when no interval limit is passed', () => {
        it('should resolve appropriate string', () => {
            const secondsAgoDate = new Date();
            secondsAgoDate.setSeconds(secondsAgoDate.getSeconds() - 2);
            expect(dateAgoPipe.transform(secondsAgoDate.toString())).toEqual('SECONDS_AGO-2');

            const minutesAgoDate = new Date();
            minutesAgoDate.setMinutes(minutesAgoDate.getMinutes() - 2);
            expect(dateAgoPipe.transform(minutesAgoDate.getTime())).toEqual('MINUTES_AGO-2');

            const hoursAgoDate = new Date();
            hoursAgoDate.setHours(hoursAgoDate.getHours() - 2);
            expect(dateAgoPipe.transform(hoursAgoDate.toString())).toEqual('HOURS_AGO-2');
        });
    });

    describe('when limit is given and no default format passed', () => {
        it('should resolve appropriate string upto limit', () => {
            const secondsAgoDate = new Date();
            secondsAgoDate.setSeconds(secondsAgoDate.getSeconds() - 2);
            expect(dateAgoPipe.transform(secondsAgoDate.toString(), 'second')).toEqual('SECONDS_AGO-2');
        });

        it('should do nothing beyond limit', () => {
            const minutesAgoDate = new Date();
            minutesAgoDate.setMinutes(minutesAgoDate.getMinutes() - 2);
            expect(dateAgoPipe.transform(minutesAgoDate.toString(), 'second')).toEqual(minutesAgoDate.toString());

            const daysAgoDate = new Date();
            daysAgoDate.setDate(daysAgoDate.getDate() - 2);
            expect(dateAgoPipe.transform(daysAgoDate.toString(), 'minute')).toEqual(daysAgoDate.toString());
        });
    });

    describe('when limit is given and default format passed', () => {
        it('should resolve appropriate string upto limit', () => {
            const secondsAgoDate = new Date();
            secondsAgoDate.setSeconds(secondsAgoDate.getSeconds() - 2);
            expect(dateAgoPipe.transform(secondsAgoDate.toString(), 'second')).toEqual('SECONDS_AGO-2');
        });

        it('should delegate to date pipe', () => {
            const minutesAgoDate = new Date();
            minutesAgoDate.setMinutes(minutesAgoDate.getMinutes() - 2);
            expect(dateAgoPipe.transform(minutesAgoDate.toString(), 'second', 'M/d/yy')).toEqual(expect.stringMatching(/^\d*\/\d*\/\d*$/));

            const daysAgoDate = new Date();
            daysAgoDate.setDate(daysAgoDate.getDate() - 2);
            expect(dateAgoPipe.transform(daysAgoDate.toString(), 'minute', 'M/d/yy')).toEqual(expect.stringMatching(/^\d*\/\d*\/\d*$/));
        });
    });

    describe('when current date is given', () => {
        it('should resolve with 0 seconds ago', () => {
            const secondsAgoDate = new Date();
            expect(dateAgoPipe.transform(secondsAgoDate.getTime(), 'minute')).toEqual('SECONDS_AGO-0');
        });
    });

    describe('when future date is given', () => {
        it('should resolve with 0 seconds ago', () => {
            const secondsAgoDate = new Date();
            secondsAgoDate.setSeconds(secondsAgoDate.getSeconds() + 1);
            expect(dateAgoPipe.transform(secondsAgoDate.getTime(), 'minute')).toEqual('SECONDS_AGO-0');
        });
    });
});
