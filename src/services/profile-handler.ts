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
        let supportedAttribute = userTypeSpecificCofig['attributes']['mandatory'];
        const supportedOptionalAttribute = userTypeSpecificCofig['attributes']['optional'];
        if (showOptionalCategories) {
            supportedAttribute = supportedAttribute.concat(supportedOptionalAttribute);
        }
        return supportedAttribute.reduce((map, item) => {
            map[item] = item;
            return map;
        }, {});
    }

    public async getSupportedUserTypes(): Promise<Array<any>> {
        return Promise.resolve([
            {
              "code": "student",
              "name": "Student",
              "ambiguousFilters": [
                "learner",
                "student"
              ],
              "searchFilter": [
                "Student",
                "Learner"
              ],
              "attributes": {
                "mandatory": [
                  "board",
                  "medium",
                  "gradeLevel"
                ],
                "optional": [
                  "subject"
                ]
              }
            },
            {
              "code": "teacher",
              "name": "Teacher",
              "ambiguousFilters": [
                "teacher",
                "instructor"
              ],
              "searchFilter": [
                "Teacher",
                "Instructor"
              ],
              "attributes": {
                "mandatory": [
                  "board",
                  "medium",
                  "gradeLevel"
                ],
                "optional": [
                  "subject"
                ]
              }
            },
            {
              "code": "administrator",
              "name": "Admin",
              "ambiguousFilters": [],
              "searchFilter": [
                "administrator"
              ],
              "attributes": {
                "mandatory": [
                  "board"
                ],
                "optional": []
              }
            },
            {
              "code": "other",
              "name": "Other",
              "ambiguousFilters": [
                "student, teacher",
                "instructor and learner",
                "learner & instructor"
              ],
              "searchFilter": [
                "Student",
                "Teacher",
                "Instructor",
                "Learner"
              ],
              "attributes": {
                "mandatory": [
                  "board",
                  "medium",
                  "gradeLevel"
                ],
                "optional": [
                  "subject"
                ]
              }
            }
          ]);
        // return await this.formAndFrameworkUtilService.getFormFields(FormConstants.SUPPORTED_USER_TYPES);
    }

    public async getAudience(userType: string): Promise<string[]> {
        const formFields = await this.formAndFrameworkUtilService.getFormFields(FormConstants.SUPPORTED_USER_TYPES);
        const userTypeConfig = formFields.find(formField => formField.code === userType);
        return userTypeConfig['searchFilter'];
    }
}
