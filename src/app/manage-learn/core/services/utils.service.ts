import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';
import * as _ from 'underscore';
import { statusType } from '@app/app/manage-learn/core/constants/statuses.constant';

@Injectable()
export class UtilsService {
  imagePath: string;
  constructor() {}

  generateFileName(name: string[] = []) {
    const d = new Date();
    const fullTime = moment(d).format('DD-MM-YYYY-hh-mm-ss');

    name.push(fullTime);
    return name.join('_');
  }

  cameltoNormalCase(word) {
    return word.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
      return str.toUpperCase();
    });
  }

  //create query url
  queryUrl(url, query) {
    query = Object.entries(query).reduce((a, [k, v]) => (v == null ? a : ((a[k] = v), a)), {}); // remove null and undefined values
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
    let query = '';
    for (let d in data) query += encodeURIComponent(d) + '=' + encodeURIComponent(data[d]) + '&';
    return query.slice(0, -1);
  }

  getMetaData(type) {
    const obj = {
      _id: uuidv4(),
      status: statusType.notStarted,
      name: '',
      endDate: '',
      assignee: '',
      type: 'simple',
      attachments: [],
      startDate: '',
      isNew: true,
      isEdit: true,
      children: [],
      isDeleted: false,
      isDeletable: true,
    };
    switch (type) {
      case 'task':
        return obj;
      case 'subTask':
        delete obj.children;
        delete obj.isDeletable;
        return obj;
    }
  }
  getTaskSortMeta() {
    const data = {
      past: {
        label: 'LABELS.PAST',
        tasks: [],
      },
      today: {
        label: 'LABELS.TODAY',
        tasks: [],
      },
      thisWeek: {
        label: 'LABELS.THIS_WEEK',
        tasks: [],
      },
      thisMonth: {
        label: 'LABELS.THIS_MONTH',
        tasks: [],
      },
      thisQuarter: {
        label: 'LABELS.THIS_QUARTER',
        tasks: [],
      },
      upcoming: {
        label: 'LABELS.UPCOMING',
        tasks: [],
      },
    };
    return data;
  }

  setStatusForProject(project) {
    const projectData = { ...project };
    for (const task of projectData.tasks) {
      task.status = task.children.length ? this.calculateStatus(task.children) : task.status;

      // added for assessment or observation submission statuses
      if (task.type == 'assessment' || task.type == 'observation') {
        if (task.submissionDetails && task.submissionDetails.status !== statusType.completed) {
          if (task.status == statusType.completed) {
            task.status = statusType.inProgress;
          }
        }
        if (!task.submissionDetails) {
          if (task.status == statusType.completed) {
            task.status = statusType.inProgress;
          }
        }

        if (task.submissionDetails && task.submissionDetails.status == statusType.completed && !task.children.length) {
          task.status = statusType.completed;
        }
        if (!task.submissionDetails && !task.children.length) {
          task.status = statusType.notStarted;
        }
        /*  if (!task.submissionDetails  && task.children.length) {
           task.status = statusType.inProgress;
         } */
      }
    }
    projectData.status = this.calculateStatus(projectData.tasks);

    return projectData;
  }

  calculateStatus(childArray) {
    let status;
    const items = [...childArray];
    const completedList = _.filter(items, function (el) {
      return !el.isDeleted && el.status === statusType.completed;
    });
    const inProgressList = _.filter(items, function (el) {
      return !el.isDeleted && el.status === statusType.inProgress;
    });
    const notStartedList = _.filter(items, function (el) {
      return el.status === statusType.notStarted;
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
            label: category.name,
          };
          categories.push(obj);
        }
      }
      project.categories = categories;
    }
    return projectData;
  }

  getFileExtensions(url) {
    let splittedString = url.split('.');
    let splittedStringForName = url.split('/');
    const obj = {
      type: splittedString[splittedString.length - 1],
      name: splittedStringForName[splittedStringForName.length - 1],
    };
    return obj;
  }

  getAssessmentLocalStorageKey(entityId) {
    return 'assessmentDetails_' + entityId;
  }
  setCurrentimageFolderName(evidenceId, schoolId) {
    this.imagePath = 'images_' + evidenceId + '_' + schoolId;
  }

  checkForDependentVisibility(qst, allQuestion): boolean {
    let display = true;
    for (const question of allQuestion) {
      for (const condition of qst.visibleIf) {
        if (condition._id === question._id) {
          let expression = [];
          if (condition.operator != '===') {
            if (question.responseType === 'multiselect') {
              for (const parentValue of question.value) {
                for (const value of condition.value) {
                  expression.push('(', "'" + parentValue + "'", '===', "'" + value + "'", ')', condition.operator);
                }
              }
            } else {
              for (const value of condition.value) {
                expression.push('(', "'" + question.value + "'", '===', "'" + value + "'", ')', condition.operator);
              }
            }

            expression.pop();
          } else {
            if (question.responseType === 'multiselect') {
              for (const value of question.value) {
                expression.push('(', "'" + condition.value + "'", '===', "'" + value + "'", ')', '||');
              }
              expression.pop();
            } else {
              expression.push('(', "'" + question.value + "'", condition.operator, "'" + condition.value + "'", ')');
            }
          }
          if (!eval(expression.join(''))) {
            return false;
          }
        }
      }
    }
    return display;
  }

  isQuestionComplete(question): boolean {
    if (question.validation.required && question.value === '' && question.responseType !== 'multiselect') {
      return false;
    }
    if (
      question.validation.required &&
      question.value &&
      !question.value.length &&
      question.responseType === 'multiselect'
    ) {
      return false;
    }
    if (
      question.validation.regex &&
      (question.responseType === 'number' || question.responseType === 'text') &&
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
    if (question.responseType === 'matrix') {
      for (const instance of question.value) {
        for (const qst of instance) {
          const newArray = qst.fileName.length ? imageArray.concat(qst.fileName) : imageArray;
          imageArray = newArray;
        }
      }
    } else {
      // imageArray = [...imageArray, question.fileName]
      const newArray = question.fileName.length ? imageArray.concat(question.fileName) : imageArray;
      imageArray = newArray;
    }
    return imageArray;
  }

  getProjectData() {
    return {
      userId: '01c04166-a65e-4e92-a87b-a9e4194e771d',
      status: 'notStarted',
      isDeleted: false,
      categories: [{ value: '5fc48155b9335656a106c06a', label: 'Infrastructure' }],
      tasks: [
        {
          _id: '668fd6e2-9c06-458d-a286-6d4f642d3605',
          createdBy: 'f449823a-06bb-4a3f-9d49-edbe1524ebbb',
          updatedBy: '01c04166-a65e-4e92-a87b-a9e4194e771d',
          isDeleted: false,
          isDeleteable: false,
          taskSequence: [],
          children: [
            {
              _id: 'e08afef0-3857-42d5-9850-8ee882bf8631',
              status: 'notStarted',
              name: 'te',
              endDate: '',
              assignee: '',
              type: 'simple',
              attachments: [],
              startDate: '',
              isDeleted: false,
              externalId: 'tesstostyurssdtyureany ',
              isDeleteable: false,
              createdAt: '2020-12-01T15:29:07.334Z',
              updatedAt: '2020-12-01T17:20:04.953Z',
              isImportedFromLibrary: false,
              lastSync: '2020-12-01T17:20:04.953Z',
              children: [],
            },
          ],
          visibleIf: [],
          hasSubTasks: false,
          learningResources: [],
          deleted: false,
          type: 'assessment',
          solutionDetails: {
            type: 'assessment',
            subType: 'institutional',
            _id: '5d0a0cf11e724f059a0d8f10',
            isReusable: true,
            externalId: 'EF-DCPCR-2018-001-TEMPLATE',
            name: 'DCPCR Assessment Framework 2018',
          },
          projectTemplateId: '5fc4f056ed1ae1783770692f',
          name: 'REJNEESH ASSESSMENT1',
          externalId: 'REJNEESH-ASSESSMENT1',
          description: 'Task-1 Description',
          updatedAt: '2020-12-01T17:20:04.953Z',
          createdAt: '2020-11-30T13:23:33.880Z',
          __v: 0,
          status: 'notStarted',
          isImportedFromLibrary: false,
          lastSync: '2020-12-01T17:20:04.953Z',
        },
        {
          _id: '67fb7c47-44e2-437f-97f2-e367ec9c4ea8',
          createdBy: 'f449823a-06bb-4a3f-9d49-edbe1524ebbb',
          updatedBy: 'f449823a-06bb-4a3f-9d49-edbe1524ebbb',
          isDeleted: false,
          isDeleteable: false,
          taskSequence: [],
          children: [],
          visibleIf: [],
          hasSubTasks: false,
          learningResources: [],
          deleted: false,
          type: 'assessment',
          solutionDetails: {
            type: 'assessment',
            subType: 'institutional',
            _id: '5b98fa069f664f7e1ae7498c',
            isReusable: false,
            externalId: 'EF-DCPCR-2018-001',
            name: 'DCPCR Assessment Framework 2018',
          },
          projectTemplateId: '5fc4f056ed1ae1783770692f',
          name: 'REJNEESH ASSESSMENT2',
          externalId: 'REJNEESH-ASSESSMENT2',
          description: 'Task-3 Description',
          updatedAt: '2020-11-30T14:18:46.647Z',
          createdAt: '2020-11-30T13:23:33.886Z',
          __v: 0,
          status: 'notStarted',
          isImportedFromLibrary: true,
          lastSync: '2020-11-30T14:18:46.647Z',
          submissionDetails: {
            entityId: '5beaa888af0065f0e0a10515',
            programId: '5fc4ad7a4f96e8623deacda9',
            solutionId: '5b98fa069f664f7e1ae7498c',
          },
        },
        {
          _id: '4f61c97a-571c-4dcc-b58e-1872230940dc',
          createdBy: 'f449823a-06bb-4a3f-9d49-edbe1524ebbb',
          updatedBy: 'f449823a-06bb-4a3f-9d49-edbe1524ebbb',
          isDeleted: false,
          isDeleteable: false,
          taskSequence: [],
          children: [],
          visibleIf: [],
          hasSubTasks: false,
          learningResources: [],
          deleted: false,
          type: 'observation',
          solutionDetails: {
            type: 'observation',
            subType: 'school',
            _id: '5d0a0cf11e724f059a0d8f11',
            isReusable: false,
            externalId: 'CRO-2019-TEMPLATE',
            name: 'CRO-2019',
          },
          projectTemplateId: '5fc4f056ed1ae1783770692f',
          name: 'REJNEESH OBSERVATION2',
          externalId: 'REJNEESH-OBSERVATION2',
          description: 'Task-2 Description',
          updatedAt: '2020-11-30T14:18:46.647Z',
          createdAt: '2020-11-30T13:23:33.890Z',
          __v: 0,
          status: 'notStarted',
          isImportedFromLibrary: true,
          lastSync: '2020-11-30T14:18:46.647Z',
        },
      ],
      learningResources: [
        {
          name: 'Copy Feature',
          link: 'https://dev.bodh.shikshalokam.org/resources/play/content/do_113059727462957056137',
          app: 'bodh',
          id: 'do_113059727462957056137',
        },
      ],
      deleted: false,
      title: 'REJNEESH-TEST',
      description: 'improving community library',
      updatedAt: '2020-12-01T17:20:04.954Z',
      createdAt: '2020-11-30T13:15:02.824Z',
      lastDownloadedAt: '2020-12-11T04:10:37.799Z',
      lastSync: '2020-12-01T17:20:04.953Z',
      entityId: '5beaa888af0065f0e0a10515',
      entityName: 'Apple School',
      programId: '5fc4ad7a4f96e8623deacda9',
      programName: 'Project -30-nov',
      rationale: '',
      primaryAudience: ['teachers', 'head master'],
      _id: '5fc4ff46ed1ae17837706937',
      _rev: '1-28270c873915239807bd35fde4d4157f',
    };
  }
}
