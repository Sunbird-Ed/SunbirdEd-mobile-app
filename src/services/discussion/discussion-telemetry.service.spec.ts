import { DiscussionTelemetryService } from './discussion-telemetry.service';
import { TelemetryGeneratorService } from '..';
import { Environment } from '../telemetry-constants';

describe('GroupHandlerService', () => {
    let discussionTelemetryService: DiscussionTelemetryService;
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn()
    };

    beforeAll(() => {
        discussionTelemetryService = new DiscussionTelemetryService(
            mockTelemetryGeneratorService as TelemetryGeneratorService,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('Should create instatance', () => {
        expect(discussionTelemetryService).toBeTruthy();
    });

    describe('logTelemetryEvent', () => {
        it('Should call telemetrygenarator service with proper params', () => {
            // arrange
            const event = {
                eid: 'IMPRESSION',
                edata: {
                    type: 'some_type',
                    id: 'some_id',
                    pageid: 'some_pageid'
                },
                context: {
                    cdata: []
                }
            }
            const cData = {
                type: 'Course',
                id: 'some_id'
            }
            discussionTelemetryService.contextCdata = [cData];
            // act
            discussionTelemetryService.logTelemetryEvent(event)
            // assert
           expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
               'some_type',
               'some_id',
               'some_pageid',
               Environment.DISCUSSION,
                undefined,
                undefined,
                undefined,
                undefined,
                [cData]
           )
        });

        it('Should call telemetrygenarator service with proper params', () => {
             // arrange
             const event = {
                eid: 'INTERACT',
                edata: {
                    type: 'some_type',
                    id: 'some_id',
                    pageid: 'some_pageid'
                }
            }
            const cData = {
                type: 'Course',
                id: 'some_id'
            }
            discussionTelemetryService.contextCdata = [cData];
            // act
            discussionTelemetryService.logTelemetryEvent(event)
            // assert
           expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
               'some_type',
               'some_id',
                Environment.DISCUSSION,
               'some_pageid',
                undefined,
                undefined,
                undefined,
                [cData]
           )
            
        });

    });
});
