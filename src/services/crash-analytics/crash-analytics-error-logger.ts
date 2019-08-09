import { ErrorHandler, Optional, Injector } from '@angular/core';
import { SunbirdSdk, TelemetryErrorRequest } from 'sunbird-sdk';
import { ActivePageService } from '../active-page-service';
import { Router } from '@angular/router';

export class CrashAnalyticsErrorLogger extends ErrorHandler {
    router: any;

    constructor(
        @Optional() private activePageService: ActivePageService,
        @Optional() private injector: Injector,
    ) {
        super();
        window.addEventListener('unhandledrejection', this.handleError);
    }

    handleError(error: Error | string | any): void {

        const telemetryErrorRequest: TelemetryErrorRequest = {
            errorCode: '',
            errorType: '',
            stacktrace: '',
            pageId: ''
        };

        if (error instanceof Error) {
            telemetryErrorRequest.stacktrace = error.stack.slice(0, 250); // 250 characters limited for Telemetry and API purpose.
            telemetryErrorRequest.errorType = error.name || '';
        }

        try {
            this.router = this.injector.get(Router);
            if (this.activePageService && this.router && this.router.url) {
                telemetryErrorRequest.pageId = this.activePageService.computePageId(this.router.url);
            }
        } catch (e) { }

        if (SunbirdSdk.instance && telemetryErrorRequest.stacktrace) {
            SunbirdSdk.instance.telemetryService.error(telemetryErrorRequest).toPromise();
        }
        console.log(telemetryErrorRequest);

        super.handleError(error);
    }

}
