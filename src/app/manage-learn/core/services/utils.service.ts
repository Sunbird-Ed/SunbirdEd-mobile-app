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
}
