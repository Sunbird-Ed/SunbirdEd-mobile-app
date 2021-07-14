import { Component, Input } from '@angular/core';
import { RemarksModalComponent } from '@app/app/manage-learn/questionnaire/remarks-modal/remarks-modal.component';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-remarks',
  templateUrl: './remarks.component.html',
  styleUrls: ['./remarks.component.scss'],
})
export class RemarksComponent {

  @Input() data: any;

  constructor(private modal: ModalController) { }


  async openUpdateRemarks() {
    const remarks = await this.modal.create({
      component: RemarksModalComponent,
      componentProps: { data: JSON.parse(JSON.stringify(this.data)) }
    });
    await remarks.present();
    const { data } = await remarks.onDidDismiss();
    if (data) {
      this.data.remarks = data;
    }

  }

}
