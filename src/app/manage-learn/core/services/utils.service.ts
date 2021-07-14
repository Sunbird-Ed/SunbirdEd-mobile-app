import { Injectable, Inject, NgZone } from "@angular/core";
import { v4 as uuidv4 } from "uuid";
import * as moment from "moment";
import * as _ from "underscore";
import { statusType } from "@app/app/manage-learn/core/constants/statuses.constant";
import { UtilityService } from "@app/services";
import {
  ProfileService,
  AuthService,
  CachedItemRequestSourceFrom
} from "sunbird-sdk";
import { ProfileConstants, RouterLinks } from "@app/app/app.constant";
import { CommonUtilService } from "@app/services/common-util.service";
import { KendraApiService } from "./kendra-api.service";
import { urlConstants } from "../constants/urlConstants";
import { AlertController } from "@ionic/angular";
import { Router } from "@angular/router";
import { Storage } from "@ionic/storage";
import { storageKeys } from "../../storageKeys";
import { Events } from '@app/util/events';

@Injectable({
  providedIn: "root"
})
export class UtilsService {
  private alert?: any;
  imagePath: string;
  public assessmentBaseUrl: string;
  public projectsBaseUrl: string;
  profile;
  organisationName;
  orgDetails;
  requiredFields;
  profileAlert;
  userId;
  mandatoryFields ={};
  constructor(
    private utility: UtilityService,
    @Inject("PROFILE_SERVICE") private profileService: ProfileService,
    @Inject("AUTH_SERVICE") public authService: AuthService,
    private zone: NgZone,
    private commonUtilService: CommonUtilService,
    private kendra: KendraApiService,
    private aleryCtrl: AlertController,
    private router: Router,
    private storage: Storage,
    private events: Events,

  ) {
    this.storage.get(storageKeys.mandatoryFields).then(data =>{
      if (data) {
        this.mandatoryFields = data;
      }
    });

      this.events.subscribe("loggedInProfile:update", framework => {
      this.getProfileInfo(true);
    });
  }

  generateFileName(name: string[] = []) {
    const d = new Date();
    const fullTime = moment(d).format("DD-MM-YYYY-hh-mm-ss");

    name.push(fullTime);
    return name.join("_");
  }

  cameltoNormalCase(word) {
    return word.replace(/([A-Z])/g, " $1").replace(/^./, function(str) {
      return str.toUpperCase();
    });
  }

  //create query url
  queryUrl(url, query) {
    query = Object.entries(query).reduce(
      (a, [k, v]) => (v == null ? a : ((a[k] = v), a)),
      {}
    ); // remove null and undefined values
    if (_.isEmpty(query)) {
      return url;
    }
    query = this.encodeQuery(query);
    url = `${url}?${query}`;
    return url;
  }

  // returns the query string
  /*
   Input: {'website':'unnati', 'location':'india'}
   Output: website=unnati&location=india
   */
  encodeQuery(data) {
    let query = "";
    for (let d in data)
      query += encodeURIComponent(d) + "=" + encodeURIComponent(data[d]) + "&";
    return query.slice(0, -1);
  }

  getMetaData(type) {
    const obj = {
      _id: uuidv4(),
      status: statusType.notStarted,
      name: "",
      endDate: "",
      assignee: "",
      type: "simple",
      attachments: [],
      startDate: "",
      isNew: true,
      isEdit: true,
      children: [],
      isDeleted: false,
      isDeletable: true
    };
    switch (type) {
      case "task":
        return obj;
      case "subTask":
        delete obj.children;
        delete obj.isDeletable;
        return obj;
    }
  }
  getTaskSortMeta() {
    const data = {
      past: {
        label: "LABELS.PAST",
        tasks: []
      },
      today: {
        label: "LABELS.TODAY",
        tasks: []
      },
      thisWeek: {
        label: "LABELS.THIS_WEEK",
        tasks: []
      },
      thisMonth: {
        label: "LABELS.THIS_MONTH",
        tasks: []
      },
      thisQuarter: {
        label: "LABELS.THIS_QUARTER",
        tasks: []
      },
      upcoming: {
        label: "LABELS.UPCOMING",
        tasks: []
      }
    };
    return data;
  }

  setStatusForProject(project) {
    const projectData = { ...project };
    for (const task of projectData.tasks) {
      const activeSubTask = _.filter(task.children, function(el) {
        return !el.isDeleted;
      });
      task.status = activeSubTask.length
        ? this.calculateStatus(task.children)
        : task.status;

      // added for assessment or observation submission statuses
      if (task.type == "assessment" || task.type == "observation") {
        if (
          task.submissionDetails &&
          task.submissionDetails.status !== statusType.completed
        ) {
          if (task.status == statusType.completed) {
            task.status = statusType.inProgress;
          }
        }
        if (!task.submissionDetails) {
          if (task.status == statusType.completed) {
            task.status = statusType.inProgress;
          }
        }

        if (
          task.submissionDetails &&
          task.submissionDetails.status == statusType.completed &&
          !task.children.length
        ) {
          task.status = statusType.completed;
        }
        if (!task.submissionDetails && !task.children.length) {
          task.status = statusType.notStarted;
        }
      }
    }
    projectData.status = this.calculateStatus(projectData.tasks);

    return projectData;
  }

  calculateStatus(childArray) {
    let status;
    const items = [...childArray];
    const completedList = _.filter(items, function(el) {
      return !el.isDeleted && el.status === statusType.completed;
    });
    const inProgressList = _.filter(items, function(el) {
      return !el.isDeleted && el.status === statusType.inProgress;
    });
    const validchildArray = _.filter(items, function (el) {
      return !el.isDeleted;
    });
    if (completedList.length === validchildArray.length) {
      status = statusType.completed;
    } else if (inProgressList.length || completedList.length) {
      status = statusType.inProgress;
    } else {
      status = statusType.notStarted;
    }
    return validchildArray.length ? status : statusType.notStarted;
  }

  checkForTaskCompletion(task) {
    let status = true;
    for (const subTask of task.children) {
      if (subTask.status !== statusType.completed) {
        status = false;
        break;
      }
    }
    return status;
  }

  checkForProjectCompletion(project) {
    let completed = true;
    for (const task of project.tasks) {
      if (task.status !== statusType.completed) {
        completed = false;
        break;
      }
    }
    return completed;
  }

  processProjectsData(projects) {
    const projectData = [...projects];
    for (const project of projects) {
      const categories = [];
      if (project.categories && project.categories.length) {
        for (const category of project.categories) {
          const obj = {
            value: category._id,
            label: category.name
          };
          categories.push(obj);
        }
      }
      project.categories = categories;
    }
    return projectData;
  }

  getFileExtensions(url) {
    let splittedString = url.split(".");
    let splittedStringForName = url.split("/");
    const obj = {
      type: splittedString[splittedString.length - 1],
      name: splittedStringForName[splittedStringForName.length - 1]
    };
    return obj;
  }

  getAssessmentLocalStorageKey(entityId) {
    return "assessmentDetails_" + entityId;
  }
  setCurrentimageFolderName(evidenceId, schoolId) {
    this.imagePath = "images_" + evidenceId + "_" + schoolId;
  }

  checkForDependentVisibility(qst, allQuestion): boolean {
    let display = true;
    for (const question of allQuestion) {
      for (const condition of qst.visibleIf) {
        if (condition._id === question._id) {
          let expression = [];
          if (condition.operator != "===") {
            if (question.responseType === "multiselect") {
              for (const parentValue of question.value) {
                for (const value of condition.value) {
                  expression.push(
                    "(",
                    "'" + parentValue + "'",
                    "===",
                    "'" + value + "'",
                    ")",
                    condition.operator
                  );
                }
              }
            } else {
              for (const value of condition.value) {
                expression.push(
                  "(",
                  "'" + question.value + "'",
                  "===",
                  "'" + value + "'",
                  ")",
                  condition.operator
                );
              }
            }

            expression.pop();
          } else {
            if (question.responseType === "multiselect") {
              for (const value of question.value) {
                expression.push(
                  "(",
                  "'" + condition.value + "'",
                  "===",
                  "'" + value + "'",
                  ")",
                  "||"
                );
              }
              expression.pop();
            } else {
              expression.push(
                "(",
                "'" + question.value + "'",
                condition.operator,
                "'" + condition.value + "'",
                ")"
              );
            }
          }
          if (!eval(expression.join(""))) {
            return false;
          }
        }
      }
    }
    return display;
  }

  isQuestionComplete(question): boolean {
    if (
      question.validation.required &&
      question.value === "" &&
      question.responseType !== "multiselect"
    ) {
      return false;
    }
    if (
      question.validation.required &&
      question.value &&
      !question.value.length &&
      question.responseType === "multiselect"
    ) {
      return false;
    }
    if (
      question.validation.regex &&
      (question.responseType === "number" ||
        question.responseType === "text") &&
      !this.testRegex(question.validation.regex, question.value)
    ) {
      return false;
    }
    return true;
  }

  isMatrixQuestionComplete(question): boolean {
    if (!question.value.length) {
      return false;
    }
    for (const instance of question.value) {
      for (const question of instance) {
        if (!question.isCompleted) {
          return false;
        }
      }
    }
    return true;
  }
  isPageQuestionComplete(question) {
    for (const element of question.pageQuestions) {
      if (!element.isCompleted) {
        return false;
      }
    }
    return true;
  }

  testRegex(rege, value): boolean {
    const regex = new RegExp(rege);
    return regex.test(value);
  }

  getCompletedQuestionsCount(questions) {
    let count = 0;
    for (const question of questions) {
      if (question.isCompleted) {
        count++;
      }
    }
    return count;
  }

  getImageNamesForQuestion(question) {
    let imageArray = [];
    if (question.responseType === "matrix") {
      for (const instance of question.value) {
        for (const qst of instance) {
          const newArray = qst.fileName.length
            ? imageArray.concat(qst.fileName)
            : imageArray;
          imageArray = newArray;
        }
      }
    } else {
      // imageArray = [...imageArray, question.fileName]
      const newArray = question.fileName.length
        ? imageArray.concat(question.fileName)
        : imageArray;
      imageArray = newArray;
    }
    return imageArray;
  }

  async getMandatoryEntities(): Promise<any> {
  this.profile = await this.getProfileData('SERVER');
    return new Promise((resolve, reject) => {
      const config = {
        url:
          urlConstants.API_URLS.MANDATORY_ENTITY_TYPES_FOR_ROLES +
          `${this.profile.state}?role=${this.profile.role}`
      };

      this.kendra.get(config).subscribe(
        data => {
          if (data.result && data.result.length) {
            this.requiredFields = data.result;
            this.mandatoryFields[this.profile.state] = { [this.profile.role]: this.requiredFields};
            this.storage.set(storageKeys.mandatoryFields, this.mandatoryFields);
            this.checkMandatoryFields(this.mandatoryFields[this.profile.state][this.profile.role]);
          } else {
            this.openProfileUpdateAlert();
            resolve(false);
          }
        },
        error => {
          resolve(false);
          // reject()
        }
      );
    });
  }

  checkMandatoryFields(requiredFields) {
    console.log(requiredFields,"requiredFields");
    if(requiredFields){
      let allFieldsPresent = true;
      for (const field of requiredFields) {
        if (!this.profile[field]) {
          allFieldsPresent = false;
          break;
        }
      }
      if (!allFieldsPresent) {
        this.openProfileUpdateAlert();
        return false;
      } else {
        return true;
      }
    }else{
      this.openProfileUpdateAlert();
      return false;
    }
  
  }

  async getMandatoryEntitiesList(): Promise<any> {
    return new Promise((resolve, reject) => {
      const config = {
        url:
          urlConstants.API_URLS.MANDATORY_ENTITY_TYPES_FOR_ROLES +
          `${this.profile.state}?role=${this.profile.role}`
      };
      this.kendra.get(config).subscribe(
        data => {
          if (data.result && data.result.length) {
            this.requiredFields = data.result;
            resolve(data.result);
          } else {
            resolve(false);
          }
        },
        error => {
          resolve(false);
          // reject()
        }
      );
    });
  }

  async openProfileUpdateAlert() {
    this.profileAlert = await this.aleryCtrl.create({
      header: "Alert",
      message: `Please update   ${
        this.requiredFields && this.requiredFields.length
          ? this.requiredFields + " in"
          : ""
      }   your profile to access the feature.`,
      buttons: [
        {
          text: "Update Profile",
          role: "cancel",
          handler: blah => {
            this.router.navigate([
              `/${RouterLinks.TABS}/${RouterLinks.PROFILE}`
            ]);
          }
        }
      ],
      backdropDismiss: false
    });
    await this.profileAlert.present();
  }

  async closeProfileAlert() {
    this.profileAlert ? await this.profileAlert.dismiss() : null;
  }

  async getProfileInfo(callMandatory?): Promise<any> {
    //     const profile = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise();
    return new Promise(async (resolve, reject) => {
      let param = callMandatory ? 'SERVER' :'CACHE'
      this.profile = await this.getProfileData(param);
      let allFieldsPresent = true;
      let mandatoryFields;
      if (!callMandatory) {
        if (this.commonUtilService.networkInfo.isNetworkAvailable) {
          mandatoryFields = this.getMandatoryEntities();
          mandatoryFields ? resolve(this.profile) : resolve(null);
        } else {
          this.storage.get(storageKeys.mandatoryFields).then(data => {
            if (data && data[this.profile.state]) {
            this.checkMandatoryFields(
                data[this.profile.state][this.profile.role]
              );
              if (!allFieldsPresent) {
                mandatoryFields ? resolve(this.profile) : resolve(null);
              } else {
                resolve(this.profile);
              }
            } else {
              this.openProfileUpdateAlert();
            }
          });
        }
      } else {
        mandatoryFields = this.getMandatoryEntities();
        this.profile = await this.getProfileData('SERVER');
        mandatoryFields ? resolve(this.profile) : resolve(null);
      }

      // mandatoryFields = await this.getMandatoryEntities();
      // resolve(this.profile)
      // resolve({
      //   "state" :  "5f33c3d85f637784791cd831",
      //   "district" : "5f33c56fb451f58478b36997",
      //   "block" : "5f33c63ece438a849b4a17f4",
      //   "school" : "5f33c6dcc1352f84a29f547a",
      //   "role" : "DEO"

      // })
      // resolve({
      //   "role": "DEO",
      //   "state": "a10623c3-cc97-4971-a7fe-2f6d4e6883f7",
      //   "district": "5a27983c-5cfd-4fbb-89d5-8f45742a77d1",
      //   "school": "1"

      // })
    });
  }

  async setProfileData(type) {
    return new Promise(async (resolve, reject) => {
      let userData;
      userData = await this.getProfileInfo();
      let data = {
        userData: userData,
        generatedKey: this.getUniqueKey(userData, type)
      };
      resolve(data);
    });
  }

  // Generating unique for local storage

  getUniqueKey(userData, type) {
    let generateKey = "";
    Object.keys(userData)
      .sort()
      .forEach(function(v, i) {
        generateKey = generateKey + userData[v];
      });
    generateKey = generateKey + type;
    return generateKey;
  }

  getOrgDetails() {
    const orgList = [];
    let orgItemList;
    orgItemList = this.profile.organisations;
    if (orgItemList.length > 1) {
      orgItemList.map(org => {
        if (this.profile.rootOrgId !== org.organisationId) {
          orgList.push(org);
        }
      });
      orgList.sort((orgDate1, orgdate2) =>
        orgDate1.orgjoindate > orgdate2.organisation ? 1 : -1
      );
      this.organisationName = orgList[0].orgName;
      this.orgDetails = this.commonUtilService.getOrgLocation(orgList[0]);
    }
  }

  getProfileData(fromData = 'CACHE'): Promise<any> {
    return new Promise((resolve, reject) => {
      this.authService
        .getSession()
        .toPromise()
        .then(session => {
          if (session === null || session === undefined) {
            reject("session is null");
          } else {
            const serverProfileDetailsRequest = {
              userId: session.userToken,
              requiredFields: ProfileConstants.REQUIRED_FIELDS,
              from: CachedItemRequestSourceFrom[fromData]
            };
            this.profileService
              .getServerProfilesDetails(serverProfileDetailsRequest)
              .toPromise()
              .then(profileData => {
                this.zone.run(async () => {
                  this.userId = profileData.userId;
                  this.profile = profileData;
                  const obj = {};
                  for (const location of profileData["userLocations"]) {
                    obj[location.type] = location.id;
                  }
                  for (const org of profileData["organisations"]) {
                    if (org.isSchool) {
                      obj["school"] = org.externalId;
                    }
                  }

                  obj["role"] =
                    profileData["profileUserType"] &&
                    profileData["profileUserType"]["subType"]
                      ? profileData["profileUserType"]["subType"].toUpperCase()
                      : null;
                  resolve(obj);
                });
              })
              .catch(err => {
                resolve({});
              });
          }
        });
    });
  }
}
