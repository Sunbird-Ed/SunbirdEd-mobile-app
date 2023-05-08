import { Batch, TelemetryObject, Rollup, CorrelationData } from '@project-sunbird/sunbird-sdk';


export interface EnrollCourse {
    userId: string;
    batch: Batch | any;
    pageId: string;
    courseId?: string;
    telemetryObject?: TelemetryObject;
    objRollup?: Rollup;
    corRelationList?: Array<CorrelationData>;
    channel?: string;
    userConsent?: string;
}
