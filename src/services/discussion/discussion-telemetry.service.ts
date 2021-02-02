import { Injectable } from '@angular/core';
import { CorrelationData } from '@project-sunbird/sunbird-sdk';
import { Environment } from '../telemetry-constants';
import { TelemetryGeneratorService } from '../telemetry-generator.service';


@Injectable({
  providedIn: 'root'
})
export class DiscussionTelemetryService {

    constructor(
        private telemetryService: TelemetryGeneratorService
    ) { }

    private _contextCdata: Array<CorrelationData>;
    logTelemetryEvent(event) {
        switch (event.eid) {
        case 'IMPRESSION':
            this.telemetryService.generateImpressionTelemetry(
                event.edata.type,
                event.edata.id,
                event.edata.pageid,
                Environment.DISCUSSION,
                undefined,
                undefined,
                undefined,
                undefined,
                this.contextCdata);
            break;
        case 'INTERACT':
            this.telemetryService.generateInteractTelemetry(
                event.edata.type,
                event.edata.id,
                Environment.DISCUSSION,
                event.edata.pageid,
                undefined,
                undefined,
                undefined,
                this.contextCdata
            );
            break;
        }
        console.log('event from DF', event);
    }

    set contextCdata(objectData: Array<CorrelationData>) {
        this._contextCdata = objectData;
    }

    get contextCdata() {
        return this._contextCdata;
    }
}
