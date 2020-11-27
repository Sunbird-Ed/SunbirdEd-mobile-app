import { Inject, Injectable } from '@angular/core';
import { PreferenceKey } from '@app/app/app.constant';
import { FormConstants } from '@app/app/form.constants';
import { SharedPreferences } from 'sunbird-sdk';
import { FormAndFrameworkUtilService } from './formandframeworkutil.service';

@Injectable()
export class ProfileHandler {
    constructor(
        @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
        private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    ) { }

    public async getSupportedProfileAttributes(showOptionalCategories?: boolean, userType?: string): Promise<{ [key: string]: string }> {
        const formFields = await this.formAndFrameworkUtilService.getFormFields(FormConstants.SUPPORTED_USER_TYPES);
        if (!userType) {
            userType = await this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();
        }
        const userTypeSpecificCofig = formFields.find(config => config.code === userType);
        let supportedAttribute = userTypeSpecificCofig ? userTypeSpecificCofig['attributes']['mandatory'] : [];
        const supportedOptionalAttribute = userTypeSpecificCofig ? userTypeSpecificCofig['attributes']['optional'] : [];
        if (showOptionalCategories) {
            supportedAttribute = supportedAttribute.concat(supportedOptionalAttribute);
        }
        return supportedAttribute.reduce((map, item) => {
            map[item] = item;
            return map;
        }, {});
    }

    public async getSupportedUserTypes(): Promise<{ name: string, code: string, identifier: string }[]> {
        const formFields = await this.formAndFrameworkUtilService.getFormFields(FormConstants.SUPPORTED_USER_TYPES);
        return formFields.reduce((acc, val) => {
            acc.push({
                name: val.name,
                code: val.code,
                identifier: val.identifier
            });
            return acc;
        }, []);
    }

    public async getAudience(userType: string): Promise<string[]> {
        const formFields = await this.formAndFrameworkUtilService.getFormFields(FormConstants.SUPPORTED_USER_TYPES);
        const userTypeConfig = formFields.filter(formField => formField.code === userType) || {};
        return userTypeConfig['searchFilter'];
    }
}
