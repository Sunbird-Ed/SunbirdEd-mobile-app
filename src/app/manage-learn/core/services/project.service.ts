import { Injectable } from '@angular/core';
import { urlConstants } from '../constants/urlConstants';
import { KendraApiService } from './kendra-api.service';
import { LoaderService } from '../../core';
import { UtilsService } from './utils.service';
import { DbService } from './db.service';
import { RouterLinks } from '@app/app/app.constant';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  filterForReport: any;

  constructor(
    private kendra: KendraApiService,
    private utils: UtilsService,
    private loader: LoaderService,
    private db: DbService,
    private router: Router
  ) { }
  async getTemplateBySoluntionId(id) {
    let payload = await this.utils.getProfileInfo();
    const config = {
      url: urlConstants.API_URLS.TEMPLATE_DETAILS + id,
      payload: payload,
    };
    return this.kendra.post(config).toPromise();
  }

  async getProjectDetails({projectId = '', solutionId, isProfileInfoRequired = false, programId}) {
    this.loader.startLoader();
    let payload = isProfileInfoRequired ? await this.utils.getProfileInfo() : {};
    const url = `/${projectId}?${solutionId ? ('solutionId=' + solutionId) : ''}`;
    const config = {
      url: urlConstants.API_URLS.GET_PROJECT + url,
      payload: payload
    }
    this.kendra.post(config).subscribe(success => {
      this.loader.stopLoader();
      let projectDetails = success.result;
      let newCategories = [];
      for (const category of projectDetails.categories) {
        if (category._id || category.name) {
          const obj = {
            label: category.name || category.label,
            value: category._id
          }
          newCategories.push(obj)
        }
      }
      projectDetails.categories = newCategories.length ? newCategories : projectDetails.categories;
      if (projectDetails.tasks) {
        projectDetails.tasks.map(t => {
          if ((t.type == 'observation' || t.type == 'assessment') && t.submissionDetails && t.submissionDetails.status) {
            if (t.submissionDetails.status != t.status) {
              t.status = t.submissionDetails.status
              t.isEdit = true;
              projectDetails.isEdit = true
            }
          }
        })
      }
      const navObj = {
        projectId: success.result._id,
        programId: programId,
        solutionId: solutionId
      }
      this.db.create(success.result).then(successData => {
        this.navigateToProjectDetails(navObj);
      }).catch(error => {
        if (error.status === 409) {
          this.navigateToProjectDetails(navObj);
        }
      })
    }, error => {
      this.loader.stopLoader();
    })
  }

  navigateToProjectDetails({projectId,programId, solutionId}) {
    this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
      queryParams: {
        projectId: projectId,
        programId: programId,
        solutionId: solutionId,
      }, replaceUrl: true
    })
  }

  
}