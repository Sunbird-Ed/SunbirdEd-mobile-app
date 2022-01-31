import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { ProjectService, statusType, ToastService, UtilsService } from '@app/app/manage-learn/core';
import { urlConstants } from '@app/app/manage-learn/core/constants/urlConstants';
import { UnnatiDataService } from '@app/app/manage-learn/core/services/unnati-data.service';
import { CommonUtilService } from '@app/services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
})
export class TaskCardComponent implements OnInit {
@Input() project :any;
@Input() enableClickEvent : boolean = false;
statuses =statusType;
networkFlag: boolean;
private _networkSubscription: Subscription;
allStrings;
  constructor( private router : Router,
    private toast : ToastService,
    private commonUtilService : CommonUtilService,
    private projectService :ProjectService,
    private unnatiService:UnnatiDataService,
    private utils : UtilsService ) { 
      this.networkFlag = this.commonUtilService.networkInfo.isNetworkAvailable;
      this._networkSubscription = this.commonUtilService.networkAvailability$.subscribe(async (available: boolean) => {
        this.networkFlag = available;
      })
    }

  ngOnInit() {}
  openTask(task){
    this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.TASK_VIEW}`, this.project._id, task._id]);
  }
  async startAssessment(task) {
    if (!this.networkFlag) {
      this.toast.showMessage('FRMELEMNTS_MSG_YOU_ARE_WORKING_OFFLINE_TRY_AGAIN', 'danger');
      return;
    }
    let payload = await this.utils.getProfileInfo();
     const config = {
       url: urlConstants.API_URLS.START_ASSESSMENT + `${this.project._id}?taskId=${task._id}`,
       payload:payload
     };
     this.unnatiService.post(config).subscribe(
      async (success) => {
         if (!success.result) {
           this.toast.showMessage(this.allStrings["FRMELEMNTS_MSG_CANNOT_GET_PROJECT_DETAILS"], "danger");
           return;
         }
         let data = success.result;

         if(!data?.observationId){
           let resultdata: any = await this.projectService.getTemplateBySoluntionId(data?.solutionDetails?._id);
           if (
             resultdata.assessment.evidences.length > 1 ||
             resultdata.assessment.evidences[0].sections.length > 1 ||
             (resultdata.solution.criteriaLevelReport && resultdata.solution.isRubricDriven)
           ) {
             this.router.navigate([RouterLinks.DOMAIN_ECM_LISTING], { state: resultdata });
           } else {
             this.router.navigate([RouterLinks.QUESTIONNAIRE], {
               queryParams: {
                 evidenceIndex: 0,
                 sectionIndex: 0,
               },
                 state: resultdata,
             });
           }
           return;
         }

         this.router.navigate([`/${RouterLinks.OBSERVATION}/${RouterLinks.OBSERVATION_SUBMISSION}`], {
           queryParams: {
             programId: data.programId,
             solutionId: data.solutionId,
             observationId: data.observationId,
             entityId: data.entityId,
             entityName: data.entityName,
           },
         });
       },
       (error) => {
         this.toast.showMessage(this.allStrings["FRMELEMNTS_MSG_CANNOT_GET_PROJECT_DETAILS"], "danger");
       }
     );
 }

 getProjectTaskStatus() {
  if (!this.project.tasks && !this.project.tasks.length) {
    return
  }
  let taskIdArr = this.getAssessmentTypeTaskId()

  if (!taskIdArr.length) {
    return
  }
  if (!this.networkFlag) {
     return;
  }
  const config = {
    url: urlConstants.API_URLS.PROJCET_TASK_STATUS + `${this.project._id}`,
    payload: {
      taskIds: taskIdArr,
    },
  };
  this.unnatiService.post(config).subscribe(
    (success) => {
      if (!success.result) {
        return;
      }
      this.updateAssessmentStatus(success.result);
    },
    (error) => {
    }
  );
 }

 updateAssessmentStatus(data) {
  // if task type is assessment or observation then check if it is submitted and change the status and update in db
  let isChnaged = false
  this.project.tasks.map((t) => {
    data.map((d) => {
      if (d.type == 'assessment' || d.type == 'observation') {//check if type is observation or assessment 
        if (d._id == t._id && d.submissionDetails.status) {
          // check id matches and task details has submissionDetails
          if (!t.submissionDetails || t.submissionDetails.status != d.submissionDetails.status) {
            t.submissionDetails = d.submissionDetails;
            t.isEdit = true
            isChnaged = true;
            t.isEdit = true
            this.project.isEdit = true
          }
        }
      }

    });
  });
  // isChnaged ? this.updateEvent('taskStatusUpdated') : null// if any assessment/observatiom task status is changed then only update 
}

getAssessmentTypeTaskId() {
  const assessmentTypeTaskIds = [];
  for (const task of this.project.tasks) {
    task.type === "assessment" || task.type === "observation" ? assessmentTypeTaskIds.push(task._id) : null;
  }
  return assessmentTypeTaskIds;
}

  checkReport(task){

  }
  openResources(task){

  }
}
