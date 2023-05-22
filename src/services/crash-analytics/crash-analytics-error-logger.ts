import { ErrorHandler, Optional, Injector, Injectable } from '@angular/core';
import { SunbirdSdk, TelemetryErrorRequest } from '@project-sunbird/sunbird-sdk';
import { ActivePageService } from '../../services/active-page/active-page-service';
import { Router } from '@angular/router';
@Injectable()
export class CrashAnalyticsErrorLogger extends ErrorHandler {
    router: any;

    constructor(
        @Optional() private activePageService: ActivePageService,
        @Optional() private injector: Injector,
    ) {
        super();
        window.addEventListener('unhandledrejection', this.handleError);
    }

    async handleError(error: Error | string | any): Promise<void> {
        const telemetryErrorRequest: TelemetryErrorRequest = {
            errorCode: '',
            errorType: '',
            stacktrace: '',
            pageId: ''
        };

        if (error instanceof Error) {
            telemetryErrorRequest.stacktrace = (error.stack) ? error.stack.slice(0, 250) : ''; // 250 characters limited for API purpose.
            telemetryErrorRequest.errorType = error.name || 'Error';
            telemetryErrorRequest.errorCode = error.name || 'Error';
        }

        try {
            this.router = this.injector.get(Router);
            if (this.activePageService && this.router && this.router.url) {
                telemetryErrorRequest.pageId = this.activePageService.computePageId(this.router.url);
            }
        } catch (e) { }

        if (SunbirdSdk.instance && SunbirdSdk.instance.isInitialised && telemetryErrorRequest.stacktrace) {
            await SunbirdSdk.instance.telemetryService.error(telemetryErrorRequest).toPromise();
        }

        await super.handleError(error);
    }

}
