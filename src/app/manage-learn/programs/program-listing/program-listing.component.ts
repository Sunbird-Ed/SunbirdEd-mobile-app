import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { RouterLinks } from '@app/app/app.constant';
import { AppHeaderService } from '@app/services';
import { Subscription } from 'rxjs';
import {
    Events, Platform, PopoverController
} from '@ionic/angular';
import { KendraApiService } from '../../core/services/kendra-api.service';
import { urlConstants } from '../../core/constants/urlConstants';
import { UtilsService, LoaderService } from '../../core';

@Component({
    selector: 'app-program-listing',
    templateUrl: './program-listing.component.html',
    styleUrls: ['./program-listing.component.scss'],
})
export class ProgramListingComponent implements OnInit {
    private backButtonFunc: Subscription;
    headerConfig = {
        showHeader: true,
        showBurgerMenu: false,
        actionButtons: []
    };
    programs = [];
    count = 0;
    description;
    page = 1;
    limit = 25;


    constructor(private router: Router, private location: Location,
        private loader: LoaderService,
        private headerService: AppHeaderService, private platform: Platform, private utils: UtilsService, private kendraService: KendraApiService) { }

    ngOnInit() {
        this.getPrograms();
    }

    async getPrograms() {
        this.loader.startLoader();
        let payload = await this.utils.getProfileInfo();
        if (payload) {
            const config = {
                url: urlConstants.API_URLS.PROGRAM_LISTING + 'page=' + this.page + '&limit=' + this.limit + '&search=',
                payload: payload
            }
            this.kendraService.post(config).subscribe(success => {
                this.loader.stopLoader();
                if (success.result.data) {
                    this.programs = this.programs.concat(success.result.data);
                    this.count = success.result.count;
                    this.description = success.result.description;
                }
            }, error => {
                this.loader.stopLoader();
                this.programs = [];
            })
        } else {
            this.loader.stopLoader();
        }
    }

    ionViewWillEnter() {
        this.headerConfig = this.headerService.getDefaultPageConfig();
        this.headerConfig.actionButtons = [];
        this.headerConfig.showHeader = true;
        this.headerConfig.showBurgerMenu = false;
        this.headerService.updatePageConfig(this.headerConfig);
        this.handleBackButton();
    }

    ionViewWillLeave() {
        if (this.backButtonFunc) {
            this.backButtonFunc.unsubscribe();
        }
    }

    private handleBackButton() {
        this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
            this.location.back();
            this.backButtonFunc.unsubscribe();
        });
    }

    selectedProgram(id) {
        this.router.navigate([`/${RouterLinks.PROGRAM}/${RouterLinks.SOLUTIONS}`, id]);
    }

    handleNavBackButton() {
        this.location.back();
    }

    loadMore() {
        this.page = this.page + 1;
    }

}
