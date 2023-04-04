import { Inject, Injectable } from '@angular/core';
import { FormConfigCategories, PreferenceKey } from '@app/app/app.constant';
import { FieldConfig } from '@app/app/components/common-forms/field-config';
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
    private async getFormFields(rooOrgId?: string): Promise<PersonaConfig[]> {
        if (!this.formFields) {
            this.formFields = await this.formAndFrameworkUtilService.getFormFields(FormConstants.SUPPORTED_USER_TYPES, rooOrgId);
        }
        return this.formFields;
    }

    public async getSupportedProfileAttributes(showOptionalCategories?: boolean, userType?: string, rootOrgId?: string): Promise<{ [key: string]: string }> {
        const formFields = await this.getFormFields(rootOrgId);
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
    public async getSupportedUserTypes(rootOrgId?: string): Promise<Array<PersonaConfig>> {
        const supportedUserTypes = await this.getFormFields(rootOrgId);
        return supportedUserTypes.map((element) => {
            element.name = element.translations ?
                this.commonUtilService.getTranslatedValue(element.translations, element.name) : element.name;
            element.isActive = 'isActive' in element ? element.isActive : true;
            return element;
        });
    }
    public async getPersonaConfig(persona: string, rootOrgId?: string): Promise<PersonaConfig> {
        const formFields = await this.getFormFields(rootOrgId);
        return formFields.find(config => config.code === persona);
    }
    public async getAudience(userType: string, rootOrgId?: string): Promise<string[]> {
        const formFields = await this.getFormFields(rootOrgId);
        const userTypeConfig = formFields.find(formField => formField.code === userType);
        return userTypeConfig ? userTypeConfig['searchFilter'] : [];
    }

    public async getSubPersona(profile, persona: string, userLocation: any): Promise<string> {

        if((!profile.profileUserTypes || !profile.profileUserTypes.length) && (!profile.profileUserType || !profile.profileUserType.subType)){
            return undefined;
        }
        let formFields;
        try {
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
        const subPersonaCodes = [];

        if (subPersonaConfig.templateOptions.multiple) {
            if (!profile.profileUserTypes && !profile.profileUserTypes.length && profile.profileUserType && profile.profileUserType.subType) {
                subPersonaCodes.push(profile.profileUserType.subType);
            }
            else if (profile.profileUserTypes && profile.profileUserTypes.length) {
                for (let i = 0; i < profile.profileUserTypes.length; i++) {
                    subPersonaCodes.push(profile.profileUserTypes[i].subType);
                }
            }            
        } else{
            if (profile.profileUserType) {
                subPersonaCodes.push(profile.profileUserType.subType);
            }
        }

         const subPersonaLabelArray : any = []
         if (subPersonaConfig.templateOptions.options && subPersonaConfig.templateOptions.options.length) {
            subPersonaCodes.forEach(code => {
              for (let i = 0; i<subPersonaConfig.templateOptions.options.length; i++ ){
                if(subPersonaConfig.templateOptions.options[i].value === code){
                  subPersonaLabelArray.push(subPersonaConfig.templateOptions.options[i].label);
                  break;
                }
              }
            });
          }
         return subPersonaLabelArray;
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
    isActive?: boolean;
}