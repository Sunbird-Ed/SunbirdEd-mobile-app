import { Injectable, Inject } from '@angular/core';
import { CanLoad, Router } from '@angular/router';
import { AuthService } from '@project-sunbird/sunbird-sdk';

@Injectable()
export class IsGuestUserGuard implements CanLoad {
    constructor(
        @Inject('AUTH_SERVICE') private authService: AuthService,
        private router: Router
    ) {
    }

    async canLoad(): Promise<boolean> {
        if (!(await this.authService.getSession().toPromise())) {
            return true;
        }

        await this.router.navigate(['/', 'profile-settings']);
        return false;
    }
}
