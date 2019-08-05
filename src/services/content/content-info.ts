import { TelemetryObject, Rollup, CorrelationData, HierarchyInfo } from 'sunbird-sdk';

export interface ContentInfo {
    telemetryObject: TelemetryObject;
    rollUp: Rollup;
    correlationList: CorrelationData[];
    hierachyInfo: HierarchyInfo[];
}
