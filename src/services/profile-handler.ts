import { Inject, Injectable } from '@angular/core';
import { PreferenceKey } from '@app/app/app.constant';
import { FormConstants } from '@app/app/form.constants';
import { SharedPreferences } from 'sunbird-sdk';
import { CommonUtilService } from './common-util.service';
import { FormAndFrameworkUtilService } from './formandframeworkutil.service';
@Injectable()
export class ProfileHandler {
    private formFields: PersonaConfig[];
    constructor(
        @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
        private formAndFrameworkUtilService: FormAndFrameworkUtilService,
        private commonUtilService: CommonUtilService
    ) { }
    private async getFormFields(): Promise<PersonaConfig[]> {
        if (!this.formFields) {
            this.formFields = await this.formAndFrameworkUtilService.getFormFields(FormConstants.SUPPORTED_USER_TYPES);
        }
        return this.formFields;
    }
    public async getSupportedProfileAttributes(showOptionalCategories?: boolean, userType?: string): Promise<{ [key: string]: string }> {
        const formFields = await this.getFormFields();
        if (!userType) {
            userType = await this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();
        }
        const userTypeSpecificConfig = formFields.find(config => config.code === userType);
        let supportedAttribute = userTypeSpecificConfig['attributes']['mandatory'];
        const supportedOptionalAttribute = userTypeSpecificConfig['attributes']['optional'];
        if (showOptionalCategories) {
            supportedAttribute = supportedAttribute.concat(supportedOptionalAttribute);
        }
        return supportedAttribute.reduce((map, item) => {
            map[item] = item;
            return map;
        }, {});
    }
    public async getSupportedUserTypes(): Promise<Array<PersonaConfig>> {
        const supportedUserTypes = await this.getFormFields();
        return supportedUserTypes.map((element) => {
            element.name = element.translations ?
                this.commonUtilService.getTranslatedValue(element.translations, element.name) : element.name;
            return element;
        });
    }
    public async getPersonaConfig(persona: string): Promise<PersonaConfig> {
        const formFields = await this.getFormFields();
        return formFields.find(config => config.code === persona);
    }
    public async getAudience(userType: string): Promise<string[]> {
        const formFields = await this.getFormFields();
        const userTypeConfig = formFields.find(formField => formField.code === userType);
        return userTypeConfig['searchFilter'];
    }
}
export interface PersonaConfig {
    code: string;
    name: string;
    translations: string;
    image: string;
    ambiguousFilters: string[];
    searchFilter: string[];
    attributes: {
        mandatory: string[];
        optional: string[];
    };
}