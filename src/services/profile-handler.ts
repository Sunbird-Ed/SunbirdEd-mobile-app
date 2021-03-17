import { Inject, Injectable } from '@angular/core';
import { FormConfigCategories, PreferenceKey } from '@app/app/app.constant';
import { FieldConfig, FieldConfigOption } from '@app/app/components/common-forms/field-config';
import { FormConstants } from '@app/app/form.constants';
import { SharedPreferences } from 'sunbird-sdk';
import { CommonUtilService } from './common-util.service';
import { FormAndFrameworkUtilService } from './formandframeworkutil.service';
import { LocationHandler } from './location-handler';

@Injectable()
export class ProfileHandler {
    private formFields: PersonaConfig[];
    constructor(
        @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
        private formAndFrameworkUtilService: FormAndFrameworkUtilService,
        private commonUtilService: CommonUtilService,
        private locationHandler: LocationHandler
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
        if (!userTypeSpecificConfig) {
            return {};
        }
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
        return userTypeConfig ? userTypeConfig['searchFilter'] : [];
    }

    public async getSubPersona(subPersonaCode: string, persona: string, userLocation: any): Promise<string> {
        if (!subPersonaCode || !persona) {
            return undefined;
        }
        let formFields;
        try {
            // const state = await this.locationHandler.getLocationDetails(Location.TYPE_STATE, userLocation.name);
            const state = userLocation.state;
            formFields = await this.getProfileFormConfig(state && state.code ? state.code : 'default');
        } catch (e) {
            formFields = await this.getProfileFormConfig('default');
        }

        const personaConfig: FormConfigCategories = formFields.find(formField => formField.code === 'persona');

        const personaChildrenConfig: FieldConfig<any>[] = personaConfig['children'][persona];
        const subPersonaConfig = personaChildrenConfig.find(formField => formField.code === 'subPersona');
        if (!subPersonaConfig) {
            return undefined;
         }
        const subPersonaFieldConfigOption = (subPersonaConfig.templateOptions.options as FieldConfigOption<any>[]).
                    find(option => option.value === subPersonaCode);
        return subPersonaFieldConfigOption ? subPersonaFieldConfigOption.label : undefined;
    }

    private async getProfileFormConfig(subType: string): Promise<FieldConfig<any>[]> {
        return await this.formAndFrameworkUtilService.getFormFields({
            ...FormConstants.LOCATION_MAPPING,
            subType,
        });
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
