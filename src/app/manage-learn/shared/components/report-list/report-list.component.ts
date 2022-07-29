import { Component, Input, OnInit } from '@angular/core';
import { DhitiApiService } from '@app/app/manage-learn/core/services/dhiti-api.service';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss'],
})
export class ReportListComponent implements OnInit {
@Input() data;
@Input() config;
@Input() element;
@Input() questionNumber;
page = 1;
completedDate;
  constructor(
    private dhiti: DhitiApiService,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData(){
    this.dhiti.post(this.config).subscribe(resp =>{
    this.completedDate = resp.completedDate;
    this.element.answers = [...this.element.answers, ...resp.answers];
    })
  }
  loadMoreReports(){
    this.config.payload.completedDate = this.completedDate
    this.loadData();
  }
  close() {
    this.modalCtrl.dismiss();
  }
}
