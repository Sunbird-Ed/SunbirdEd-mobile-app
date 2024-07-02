import { Inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FrameworkCategoryCode, GetFrameworkCategoryTermsRequest,
     FrameworkUtilService, LocationSearchResult, CachedItemRequestSourceFrom, LocationSearchCriteria } from '@project-sunbird/sunbird-sdk';
import { LocationHandler } from './location-handler';
import { Location as LocationType } from '../app/app.constant';

@Injectable({
    providedIn: 'root'
})
export class FrameworkDetailsService {

    constructor(
        @Inject('FRAMEWORK_UTIL_SERVICE') private frameworkUtilService: FrameworkUtilService,
        private translate: TranslateService,
        private locationHandler: LocationHandler,
    ) { }

    async getFrameworkDetails(guestProfile?: any) {
        const framework = {};
        const boardList = await this.getBoardList(guestProfile).then((board) => {
            return board.map(t => ({ name: t.name, code: t.code }));
        });

        const mediumList = await this.getMediumList(guestProfile).then((medium) => {
            return medium.map(t => ({ name: t.name, code: t.code }));
        });

        const gradeList = await this.getGradeList(guestProfile).then((grade) => {
            return grade.map(t => ({ name: t.name, code: t.code }));
        });

        const subjectList = await this.getSubjectList(guestProfile).then((subject) => {
            return subject.map(t => ({ name: t.name, code: t.code }));
        });
        framework['id'] = guestProfile.syllabus;
        if (guestProfile.board && guestProfile.board.length) {
            const code = typeof (guestProfile.board) === 'string' ? guestProfile.board : guestProfile.board[0];
            framework['board'] = [boardList.find(board => code === board.code).name];
        }
        if (guestProfile.medium && guestProfile.medium.length) {
            const Names = [];
            guestProfile.medium.forEach(element => {
                Names.push(mediumList.find(medium => element === medium.code).name);
            });
            framework['medium'] = Names;
        }
        if (guestProfile.grade && guestProfile.grade.length) {
            const Names = [];
            guestProfile.grade.forEach(element => {
                Names.push(gradeList.find(grade => element === grade.code).name);
            });
            framework['gradeLevel'] = Names;
        }
        if (guestProfile.subject && guestProfile.subject.length) {
            const Names = [];
            guestProfile.subject.forEach(element => {
                Names.push(subjectList.find(subject => element === subject.code).name);
            });
            framework['subject'] = Names;
        }

        const presetLocation = (await this.locationHandler.getAvailableLocation(guestProfile, true))
            .reduce<{ [code: string]: LocationSearchResult }>((acc, loc) => {
                if (loc) { acc[loc.type] = loc; }
                return acc;
            }, {});
        const state = await this.fetchStateCode(presetLocation.state).then((data) => {
            return data;
        });
        const district = await this.fetchDistrictCode(presetLocation).then((dis) => {
            return dis;
        });
        const locationCodes = [];
        locationCodes.push({ type: state.type, code: state.code });
        locationCodes.push({ type: district.type, code: district.code });
        const req = {
            profileUserTypes: [{
                type: guestProfile.profileType,
            }],
            framework,
            profileLocation: locationCodes
        };
        return req;
    }

    private getBoardList(guestProfile) {
        try {
            const boardCategoryTermsRequet: GetFrameworkCategoryTermsRequest = {
                frameworkId: guestProfile.syllabus,
                requiredCategories: [FrameworkCategoryCode.BOARD],
                currentCategoryCode: FrameworkCategoryCode.BOARD,
                language: this.translate.currentLang
            };
            return this.frameworkUtilService.getFrameworkCategoryTerms(boardCategoryTermsRequet).toPromise();
        } catch (e) {
            console.error(e);
        }
    }

    private getGradeList(guestProfile) {
        try {
            const nextCategoryTermsRequet: GetFrameworkCategoryTermsRequest = {
                frameworkId: guestProfile.syllabus,
                requiredCategories: [FrameworkCategoryCode.GRADE_LEVEL],
                prevCategoryCode: FrameworkCategoryCode.MEDIUM,
                currentCategoryCode: FrameworkCategoryCode.GRADE_LEVEL,
                language: this.translate.currentLang,
                selectedTermsCodes: guestProfile.medium
            };
            return this.frameworkUtilService.getFrameworkCategoryTerms(nextCategoryTermsRequet).toPromise();
        } catch (e) {
            console.error(e);
        }
    }

    private getSubjectList(guestProfile) {
        try {
            const subjectTermsRequet: GetFrameworkCategoryTermsRequest = {
                frameworkId: guestProfile.syllabus,
                requiredCategories: [FrameworkCategoryCode.SUBJECT],
                prevCategoryCode: FrameworkCategoryCode.GRADE_LEVEL,
                currentCategoryCode: FrameworkCategoryCode.SUBJECT,
                language: this.translate.currentLang,
                selectedTermsCodes: guestProfile.grade
            };
            return this.frameworkUtilService.getFrameworkCategoryTerms(subjectTermsRequet).toPromise();
        } catch (e) {
            console.error(e);
        }
    }

    private getMediumList(guestProfile) {
        try {
            const mediumTermsRequet: GetFrameworkCategoryTermsRequest = {
                frameworkId: guestProfile.syllabus,
                requiredCategories: [FrameworkCategoryCode.MEDIUM],
                prevCategoryCode: FrameworkCategoryCode.BOARD,
                currentCategoryCode: FrameworkCategoryCode.MEDIUM,
                language: this.translate.currentLang,
                selectedTermsCodes: guestProfile.board
            };
            return this.frameworkUtilService.getFrameworkCategoryTerms(mediumTermsRequet).toPromise();
        } catch (e) {
            console.error(e);
        }
    }

    private async fetchStateCode(presetLocation) {
        const req: LocationSearchCriteria = {
            from: CachedItemRequestSourceFrom.SERVER,
            filters: {
                type: LocationType.TYPE_STATE
            }
        };
        return await this.locationHandler.getLocationList(req)
            .then((response) => {
                return response.find(d => d.id === presetLocation.id);
            });
    }

    private async fetchDistrictCode(location) {
        const req: LocationSearchCriteria = {
            from: CachedItemRequestSourceFrom.SERVER,
            filters: {
                type: 'district',
                parentId: location.state.id
            }
        };
        return await this.locationHandler.getLocationList(req)
            .then((response) => {
                return response.find(d => d.id === location.district.id);
            });
    }
}
