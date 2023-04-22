import { generateImpressionTelemetry, generateStartTelemetry, generateEndTelemetry } from './telemetryutil';
import { generateInteractTelemetry } from './telemetryutil';
import {
    CorrelationData,
    TelemetryInteractRequest,
    TelemetryStartRequest,
    TelemetryEndRequest,
    TelemetryImpressionRequest,
    Rollup
} from '@project-sunbird/sunbird-sdk';
import { Environment, Mode } from '../services/telemetry-constants';

describe('generateImpressionTelemetry', () => {
    it('generateImpressionTelemetry', () => {
        const type = 'sample-type', subtype = 's-type', pageid = 'home', env = 'online',
            objectId = 'o-id', objectType = 'o-type', objectVersion = '6',
            rollup = { id: 'id' },
            corRelationList = [{ id: 'do_id', type: 's-type' }];
        const telemetryImpressionRequest = new TelemetryImpressionRequest();
        telemetryImpressionRequest.type = type;
        telemetryImpressionRequest.subType = subtype;
        telemetryImpressionRequest.pageId = pageid;
        telemetryImpressionRequest.env = env;
        telemetryImpressionRequest.objId = objectId;
        telemetryImpressionRequest.objType = objectType;
        telemetryImpressionRequest.objVer = objectVersion;
        telemetryImpressionRequest.rollup = rollup;
        telemetryImpressionRequest.correlationData = corRelationList;

        const data = generateImpressionTelemetry(type, subtype, pageid, env,
            objectId, objectType, objectVersion,
            rollup,
            corRelationList);
        expect(data).toStrictEqual(telemetryImpressionRequest);
    });

    it('generateImpressionTelemetry for else part', () => {
        const type = 'sample-type', subtype = 's-type', pageid = 'home', env = 'online',
            objectId = 'o-id', objectType = 'o-type', objectVersion = '6',
            rollup = undefined,
            corRelationList = undefined;
        const telemetryImpressionRequest = new TelemetryImpressionRequest();
        telemetryImpressionRequest.type = type;
        telemetryImpressionRequest.subType = subtype;
        telemetryImpressionRequest.pageId = pageid;
        telemetryImpressionRequest.env = env;
        telemetryImpressionRequest.objId = objectId;
        telemetryImpressionRequest.objType = objectType;
        telemetryImpressionRequest.objVer = objectVersion;

        const data = generateImpressionTelemetry(type, subtype, pageid, env,
            objectId, objectType, objectVersion,
            rollup,
            corRelationList);
        expect(data).toStrictEqual(telemetryImpressionRequest);
    });
});

describe('generateInteractTelemetry', () => {
    it('generateInteractTelemetry', () => {
        const values = new Map();
        values.set('id', 'do-123');
        const interactType = 'i-type', subType = 's-type', env = 'home', pageId = 'course', rollup = { id: 'id' },
            corRelationList = [{ id: 'do_id', type: 's-type' }];
        const telemetryInteractRequest = new TelemetryInteractRequest();
        telemetryInteractRequest.type = interactType;
        telemetryInteractRequest.subType = subType;
        telemetryInteractRequest.pageId = pageId;
        telemetryInteractRequest.id = pageId;
        telemetryInteractRequest.env = env;
        telemetryInteractRequest.valueMap = values;
        telemetryInteractRequest.rollup = rollup;
        telemetryInteractRequest.correlationData = corRelationList;

        const data = generateInteractTelemetry(interactType, subType, env, pageId,
            values,
            rollup,
            corRelationList);
        expect(data).toBeTruthy();
    });

    it('generateInteractTelemetry for else part', () => {
        const values = null;
        const interactType = 'i-type', subType = 's-type', env = 'home', pageId = 'course', rollup = undefined,
            corRelationList = undefined;
        const telemetryInteractRequest = new TelemetryInteractRequest();
        telemetryInteractRequest.type = interactType;
        telemetryInteractRequest.subType = subType;
        telemetryInteractRequest.pageId = pageId;
        telemetryInteractRequest.id = pageId;
        telemetryInteractRequest.env = env;

        const data = generateInteractTelemetry(interactType, subType, env, pageId,
            values,
            rollup,
            corRelationList);
        expect(data).toStrictEqual(telemetryInteractRequest);
    });
});

describe('generateStartTelemetry', () => {
    it('generateStartTelemetry', () => {
        const pageId = 'course', objectId = 'o-id',
            objectType = 'o-type', objectVersion = '6', rollup = { id: 'id' },
            corRelationList = [{ id: 'do_id', type: 's-type' }];
        const telemetryStartRequest = new TelemetryStartRequest();
        telemetryStartRequest.type = objectType;
        telemetryStartRequest.pageId = pageId;
        telemetryStartRequest.env = Environment.HOME;
        telemetryStartRequest.mode = Mode.PLAY;
        telemetryStartRequest.objId = objectId;
        telemetryStartRequest.objType = objectType;
        telemetryStartRequest.objVer = objectVersion;
        telemetryStartRequest.rollup = rollup;
        telemetryStartRequest.correlationData = corRelationList;

        const data = generateStartTelemetry(pageId, objectId,
            objectType, objectVersion,
            rollup,
            corRelationList);
        expect(data).toStrictEqual(telemetryStartRequest);
    });

    it('generateStartTelemetry for else part', () => {
        const pageId = 'course', objectId = 'o-id',
            objectType = 'o-type', objectVersion = '6', rollup = undefined,
            corRelationList = undefined;
        const telemetryStartRequest = new TelemetryStartRequest();
        telemetryStartRequest.type = objectType;
        telemetryStartRequest.pageId = pageId;
        telemetryStartRequest.env = Environment.HOME;
        telemetryStartRequest.mode = Mode.PLAY;
        telemetryStartRequest.objId = objectId;
        telemetryStartRequest.objType = objectType;
        telemetryStartRequest.objVer = objectVersion;

        const data = generateStartTelemetry(pageId, objectId,
            objectType, objectVersion,
            rollup,
            corRelationList);
        expect(data).toStrictEqual(telemetryStartRequest);
    });
});

describe('generateEndTelemetry', () => {
    it('generateEndTelemetry', () => {
        const type = 'content', mode = 'play', pageId = 'course', objectId = 'o-id',
            objectType = 'o-type', objectVersion = '6', rollup = { id: 'id' },
            corRelationList = [{ id: 'do_id', type: 's-type' }];
        const telemetryEndRequest = new TelemetryEndRequest();
        telemetryEndRequest.type = type;
        telemetryEndRequest.pageId = pageId;
        telemetryEndRequest.env = Environment.HOME;
        telemetryEndRequest.mode = mode;
        telemetryEndRequest.objId = objectId;
        telemetryEndRequest.objType = objectType;
        telemetryEndRequest.objVer = objectVersion;
        telemetryEndRequest.rollup = rollup;
        telemetryEndRequest.correlationData = corRelationList;

        const data = generateEndTelemetry(type, mode, pageId, objectId,
            objectType, objectVersion,
            rollup,
            corRelationList);
        expect(data).toStrictEqual(telemetryEndRequest);
    });

    it('generateEndTelemetry for else part', () => {
        const type = 'content', mode = 'play', pageId = 'course', objectId = 'o-id',
            objectType = 'content', objectVersion = '6', rollup = undefined,
            corRelationList = undefined;
        const telemetryEndRequest = new TelemetryEndRequest();
        telemetryEndRequest.type = type;
        telemetryEndRequest.pageId = pageId;
        telemetryEndRequest.env = Environment.HOME;
        telemetryEndRequest.mode = mode;
        telemetryEndRequest.objId = objectId;
        telemetryEndRequest.objType = objectType;
        telemetryEndRequest.objVer = objectVersion;

        const data = generateEndTelemetry(type, mode, pageId, objectId,
            objectType, objectVersion,
            rollup,
            corRelationList);
        expect(data).toStrictEqual(telemetryEndRequest);
    });
});
