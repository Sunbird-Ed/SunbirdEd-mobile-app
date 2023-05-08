import {
    CorrelationData,
    TelemetryImpressionRequest,
    TelemetryInteractRequest,
    TelemetryStartRequest,
    TelemetryEndRequest,
    Rollup
} from '@project-sunbird/sunbird-sdk';
import { Mode, Environment } from '../services/telemetry-constants';


export const generateImpressionTelemetry = (
    type, subtype, pageid, env,
    objectId, objectType, objectVersion,
    rollup: Rollup,
    corRelationList: Array<CorrelationData>): TelemetryImpressionRequest => {

    const telemetryImpressionRequest = new TelemetryImpressionRequest();
    telemetryImpressionRequest.type = type;
    telemetryImpressionRequest.subType = subtype;
    telemetryImpressionRequest.pageId = pageid;
    telemetryImpressionRequest.env = env;
    telemetryImpressionRequest.objId = objectId;
    telemetryImpressionRequest.objType = objectType;
    telemetryImpressionRequest.objVer = objectVersion;

    if (rollup !== undefined) {
        telemetryImpressionRequest.rollup = rollup;
    }
    if (corRelationList !== undefined) {
        telemetryImpressionRequest.correlationData = corRelationList;
    }
    return telemetryImpressionRequest;
};

export const generateInteractTelemetry = (
    interactType, subType, env, pageId,
    values: Map, rollup: Rollup, corRelationList: Array<CorrelationData>): TelemetryInteractRequest => {
    const telemetryInteractRequest = new TelemetryInteractRequest();
    telemetryInteractRequest.type = interactType;
    telemetryInteractRequest.subType = subType;
    telemetryInteractRequest.pageId = pageId;
    telemetryInteractRequest.id = pageId;
    telemetryInteractRequest.env = env;
    if (values !== null) {
        telemetryInteractRequest.valueMap = values;
    }
    if (rollup !== undefined) {
        telemetryInteractRequest.rollup = rollup;
    }
    if (corRelationList !== undefined) {
        telemetryInteractRequest.correlationData = corRelationList;
    }
    return telemetryInteractRequest;
};

export const generateStartTelemetry = (
    pageId, objectId,
    objectType, objectVersion, rollup: Rollup, corRelationList: Array<CorrelationData>): TelemetryStartRequest => {
    const telemetryStartRequest = new TelemetryStartRequest();
    telemetryStartRequest.type = objectType;
    telemetryStartRequest.pageId = pageId;
    telemetryStartRequest.env = Environment.HOME;
    telemetryStartRequest.mode = Mode.PLAY;
    telemetryStartRequest.objId = objectId;
    telemetryStartRequest.objType = objectType;
    telemetryStartRequest.objVer = objectVersion;
    if (rollup !== undefined) {
        telemetryStartRequest.rollup = rollup;
    }
    if (corRelationList !== undefined) {
        telemetryStartRequest.correlationData = corRelationList;
    }

    return telemetryStartRequest;
};

export const generateEndTelemetry = (type, mode, pageId, objectId,
    objectType, objectVersion, rollup: Rollup, corRelationList: Array<CorrelationData>): TelemetryEndRequest => {
    const telemetryEndRequest = new TelemetryEndRequest();
    telemetryEndRequest.type = type;
    telemetryEndRequest.pageId = pageId;
    telemetryEndRequest.env = Environment.HOME;
    telemetryEndRequest.mode = mode;
    telemetryEndRequest.objId = objectId;
    telemetryEndRequest.objType = objectType;
    telemetryEndRequest.objVer = objectVersion;
    if (rollup !== undefined) {
        telemetryEndRequest.rollup = rollup;
    }
    if (corRelationList !== undefined) {
        telemetryEndRequest.correlationData = corRelationList;
    }
    return telemetryEndRequest;
};
export class Map {
    [key: string]: any
}
