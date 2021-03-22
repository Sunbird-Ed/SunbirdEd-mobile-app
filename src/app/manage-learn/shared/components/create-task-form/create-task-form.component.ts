import { Component, OnInit } from '@angular/core';
import { AttachmentService, ToastService, UtilsService } from '@app/app/manage-learn/core';
import { ModalController } from '@ionic/angular';

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
    private toast: ToastService
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

  addTask() {
    this.newTask.name ? this.modalCtrl.dismiss(this.newTask) : this.toast.showMessage('FRMELEMNTS_MSG_REQUIRED_FIELDS', 'danger');
  }

  share() {
    this.toast.showMessage('FRMELEMNTS_MSG_COMING_SOON', 'danger');
  }
}
