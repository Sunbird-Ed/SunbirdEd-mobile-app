import { Component, OnInit } from '@angular/core';
import { AttachmentService, ToastService, UtilsService } from '@app/app/manage-learn/core';
import { ModalController } from '@ionic/angular';
import { GenericPopUpService } from '../../generic.popup';

@Component({
  selector: 'app-create-task-form',
  templateUrl: './create-task-form.component.html',
  styleUrls: ['./create-task-form.component.scss'],
})
export class CreateTaskFormComponent implements OnInit {
  newTask;
  currentYear = new Date().getFullYear();
  today
  constructor(
    private modalCtrl: ModalController,
    private utils: UtilsService,
    private attachmentService: AttachmentService,
    private toast: ToastService,
    private popupService: GenericPopUpService
  ) { }

  ngOnInit() {
    this.prepareTaskMeta();
  }
  prepareTaskMeta() {
    this.newTask = JSON.parse(JSON.stringify(this.utils.getMetaData('task')));
  }
  close() {
    this.modalCtrl.dismiss();
  }
  openAction() {
    this.attachmentService.selectImage().then(data => {
      !this.newTask.attachments ? this.newTask.attachments = [] : '';
      data.data ? this.newTask.attachments.push(data.data) : ''
    })
  }

  doAction() {
    this.popupService.showPPPForProjectPopUp('FRMELEMNTS_LBL_EVIDENCES_CONTENT_POLICY', 'FRMELEMNTS_LBL_EVIDENCES_CONTENT_POLICY_TEXT', 'FRMELEMNTS_LBL_EVIDENCES_CONTENT_POLICY_LABEL', 'FRMELEMNTS_LBL_UPLOAD_EVIDENCES', 'https://diksha.gov.in/term-of-use.html', 'contentPolicy').then((data: any) => {
      if (data.isClicked) {
        data.isChecked ? this.openAction() : this.toast.showMessage('FRMELEMNTS_MSG_EVIDENCES_CONTENT_POLICY_REJECT', 'danger');
      }
    })
  }

  addTask() {
    this.newTask.name ? this.modalCtrl.dismiss(this.newTask) : this.toast.showMessage('FRMELEMNTS_MSG_REQUIRED_FIELDS', 'danger');
  }

  share() {
    this.toast.showMessage('FRMELEMNTS_MSG_COMING_SOON', 'danger');
  }
}
