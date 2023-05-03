import { Batch, TelemetryObject, Rollup, CorrelationData } from 'sunbird-sdk';


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
