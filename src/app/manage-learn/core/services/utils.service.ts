import { Injectable } from "@angular/core";
import { v4 as uuidv4 } from 'uuid'
import * as moment from "moment";
import * as _ from "underscore";
import { statusType } from '@app/app/manage-learn/core/constants/statuses.constant';

@Injectable()
export class UtilsService {
  constructor() {}

  generateFileName(name: string[] = []) {
    const d = new Date();
    const fullTime = moment(d).format("DD-MM-YYYY-hh-mm-ss");

    name.push(fullTime);
    return name.join("_");
  }

  cameltoNormalCase(word) {
    return word.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
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
    let query = "";
    for (let d in data) query += encodeURIComponent(d) + "=" + encodeURIComponent(data[d]) + "&";
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
      isDeletable: true,
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
        tasks: [],
      },
      today: {
        label: "LABELS.TODAY",
        tasks: [],
      },
      thisWeek: {
        label: "LABELS.THIS_WEEK",
        tasks: [],
      },
      thisMonth: {
        label: "LABELS.THIS_MONTH",
        tasks: [],
      },
      thisQuarter: {
        label: "LABELS.THIS_QUARTER",
        tasks: [],
      },
      upcoming: {
        label: "LABELS.UPCOMING",
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
      if (task.type == "assessment" || task.type == "observation") {
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
        if (!task.submissionDetails  && !task.children.length) {
          task.status = statusType.notStarted;
        }
       /*  if (!task.submissionDetails  && task.children.length) {
          task.status = statusType.inProgress;
        } */
      }

      console.log(task.status);
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
    const validchildArray =  _.filter(items, function (el) {
      return !el.isDeleted;
    });
    if (completedList.length === validchildArray.length) {
      status = statusType.completed;
    } else if (inProgressList.length || completedList.length) {
      status = statusType.inProgress;
    } else {
      status = statusType.notStarted;
    }
    return validchildArray.length ? status : statusType.notStarted
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

  getProjectData() {
    return {"userId":"01c04166-a65e-4e92-a87b-a9e4194e771d","status":"inProgress","isDeleted":false,"categories":[{"value":"5fc48155b9335656a106c068","label":"Teachers"}],"tasks":[{"_id":"1d8fb75f-db4c-44ab-8780-c868433c29aa","name":"no. of working computer...","createdAt":"2020-11-30T05:22:20+00:00","updatedAt":"2020-12-01T17:48:06.674Z","createdBy":"SYSTEM","updatedBy":"01c04166-a65e-4e92-a87b-a9e4194e771d","isDeleted":false,"isDeleteable":false,"children":[],"visibleIf":[],"taskSequence":[],"learningResources":[],"deleted":false,"type":"simple","externalId":"6bef4191-3f96-4ebe-b9ad-2949cc0a153f","description":"","hasSubTasks":true,"projectTemplateId":"5fc4818cb016ad56ce6b552d","status":"notStarted","isImportedFromLibrary":false,"lastSync":"2020-12-01T17:48:06.674Z","attachments":[]},{"_id":"aa44c157-1c85-482a-a912-eb1eb2e480b0","status":"inProgress","name":"Description","endDate":"2020-12-02T17:22:22.815-00:00","assignee":"!@#1","type":"simple","attachments":[],"startDate":"","children":[{"_id":"83b5405a-622d-4d48-a46a-77f51e363e63","status":"inProgress","name":"test 1","endDate":"","assignee":"","type":"simple","attachments":[],"startDate":"","isNew":true,"isEdit":true,"isDeleted":false},{"_id":"cd0a0da2-ef0c-4e0d-9cba-3f22fb3ffa12","status":"notStarted","name":"test 2","endDate":"","assignee":"","type":"simple","attachments":[],"startDate":"","isNew":true,"isEdit":true,"isDeleted":false}],"isDeleted":false,"externalId":"description","isDeleteable":false,"createdAt":"2020-12-01T17:48:06.674Z","updatedAt":"2020-12-01T17:48:06.674Z","isImportedFromLibrary":false,"lastSync":"2020-12-01T17:48:06.674Z","updatedBy":"01c04166-a65e-4e92-a87b-a9e4194e771d","isEdit":true}],"learningResources":[],"deleted":false,"title":"Computer Lab","description":"how many computers  are working ","createdAt":"2020-11-30T05:22:20.000Z","updatedAt":"2020-12-21T05:47:35.219Z","lastDownloadedAt":"2020-12-11T04:10:37.799Z","lastSync":"2020-12-01T17:48:06.674Z","entityId":"5bfe53ea1d0c350d61b78d0a","entityName":"Sachdeva Convent School, Street No.-5 Sangam Vihar (Wazirabad - Jagatpur Road), Delhi","programId":"5fc4ad7a4f96e8623deacda9","programName":"Project -30-nov","supportingDocuments":[""],"primaryAudience":[""],"isEdit":true,"_id":"5fc67bc24ee14a6d349434ce","_rev":"4-6e8402e416fe83bd0766c794d2856992"}
    //return {"userId":"01c04166-a65e-4e92-a87b-a9e4194e771d","status":"notStarted","isDeleted":false,"categories":[{"value":"5fc48155b9335656a106c06a","label":"Infrastructure"}],"tasks":[{"_id":"668fd6e2-9c06-458d-a286-6d4f642d3605","createdBy":"f449823a-06bb-4a3f-9d49-edbe1524ebbb","updatedBy":"01c04166-a65e-4e92-a87b-a9e4194e771d","isDeleted":false,"isDeleteable":false,"taskSequence":[],"children":[{"_id":"e08afef0-3857-42d5-9850-8ee882bf8631","status":"notStarted","name":"te","endDate":"","assignee":"","type":"simple","attachments":[],"startDate":"","isDeleted":false,"externalId":"tesstostyurssdtyureany ","isDeleteable":false,"createdAt":"2020-12-01T15:29:07.334Z","updatedAt":"2020-12-01T17:20:04.953Z","isImportedFromLibrary":false,"lastSync":"2020-12-01T17:20:04.953Z","children":[]}],"visibleIf":[],"hasSubTasks":false,"learningResources":[],"deleted":false,"type":"assessment","solutionDetails":{"type":"assessment","subType":"institutional","_id":"5d0a0cf11e724f059a0d8f10","isReusable":true,"externalId":"EF-DCPCR-2018-001-TEMPLATE","name":"DCPCR Assessment Framework 2018"},"projectTemplateId":"5fc4f056ed1ae1783770692f","name":"REJNEESH ASSESSMENT1","externalId":"REJNEESH-ASSESSMENT1","description":"Task-1 Description","updatedAt":"2020-12-01T17:20:04.953Z","createdAt":"2020-11-30T13:23:33.880Z","__v":0,"status":"notStarted","isImportedFromLibrary":false,"lastSync":"2020-12-01T17:20:04.953Z"},{"_id":"67fb7c47-44e2-437f-97f2-e367ec9c4ea8","createdBy":"f449823a-06bb-4a3f-9d49-edbe1524ebbb","updatedBy":"f449823a-06bb-4a3f-9d49-edbe1524ebbb","isDeleted":false,"isDeleteable":false,"taskSequence":[],"children":[],"visibleIf":[],"hasSubTasks":false,"learningResources":[],"deleted":false,"type":"assessment","solutionDetails":{"type":"assessment","subType":"institutional","_id":"5b98fa069f664f7e1ae7498c","isReusable":false,"externalId":"EF-DCPCR-2018-001","name":"DCPCR Assessment Framework 2018"},"projectTemplateId":"5fc4f056ed1ae1783770692f","name":"REJNEESH ASSESSMENT2","externalId":"REJNEESH-ASSESSMENT2","description":"Task-3 Description","updatedAt":"2020-11-30T14:18:46.647Z","createdAt":"2020-11-30T13:23:33.886Z","__v":0,"status":"notStarted","isImportedFromLibrary":true,"lastSync":"2020-11-30T14:18:46.647Z","submissionDetails":{"entityId":"5beaa888af0065f0e0a10515","programId":"5fc4ad7a4f96e8623deacda9","solutionId":"5b98fa069f664f7e1ae7498c"}},{"_id":"4f61c97a-571c-4dcc-b58e-1872230940dc","createdBy":"f449823a-06bb-4a3f-9d49-edbe1524ebbb","updatedBy":"f449823a-06bb-4a3f-9d49-edbe1524ebbb","isDeleted":false,"isDeleteable":false,"taskSequence":[],"children":[],"visibleIf":[],"hasSubTasks":false,"learningResources":[],"deleted":false,"type":"observation","solutionDetails":{"type":"observation","subType":"school","_id":"5d0a0cf11e724f059a0d8f11","isReusable":false,"externalId":"CRO-2019-TEMPLATE","name":"CRO-2019"},"projectTemplateId":"5fc4f056ed1ae1783770692f","name":"REJNEESH OBSERVATION2","externalId":"REJNEESH-OBSERVATION2","description":"Task-2 Description","updatedAt":"2020-11-30T14:18:46.647Z","createdAt":"2020-11-30T13:23:33.890Z","__v":0,"status":"notStarted","isImportedFromLibrary":true,"lastSync":"2020-11-30T14:18:46.647Z"}],"learningResources":[{"name":"Copy Feature","link":"https://dev.bodh.shikshalokam.org/resources/play/content/do_113059727462957056137","app":"bodh","id":"do_113059727462957056137"}],"deleted":false,"title":"REJNEESH-TEST","description":"improving community library","updatedAt":"2020-12-01T17:20:04.954Z","createdAt":"2020-11-30T13:15:02.824Z","lastDownloadedAt":"2020-12-11T04:10:37.799Z","lastSync":"2020-12-01T17:20:04.953Z","entityId":"5beaa888af0065f0e0a10515","entityName":"Apple School","programId":"5fc4ad7a4f96e8623deacda9","programName":"Project -30-nov","rationale":"","primaryAudience":["teachers","head master"],"_id":"5fc4ff46ed1ae17837706937","_rev":"1-28270c873915239807bd35fde4d4157f"};
  }
}
