import { NgModule , CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { CamelToTitlePipe } from './pipe/camel-to-title.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MultipleTypeInputComponent,
  CommonHeaderComponent,
  DateTypeInputComponent,
  FooterButtonsComponent,
  ImageUploadComponent,
  ItemListCardComponent,
  MatrixTypeInputComponent,
  PageQuestionsComponent,
  QuestionHeadingComponent,
  RadioTypeInputComponent,
  SliderTypeInputComponent,
  RemarksComponent,
  PopoverComponent,
  EntityfilterComponent,
  TextTypeInputComponent,
  ProgressBarComponent,
  NoDataComponent,
  CreateTaskFormComponent,
  PrivacyPolicyAndTCComponent,
  ProjectMetadataCardComponent,
  ProjectTaskListComponent,
  MetadataDetailsComponent,
  MetadataActionsComponent,
  ProjectDetailsCardComponent,
  AccordionListComponent,
  TaskCardComponent,
  AddLinkModalComponent,
  AttachmentCardComponent,
  AttachmentListsComponent,
  ReportListComponent,
  StartImprovementComponent
  
} from './components';
import { TranslateModule } from '@ngx-translate/core';
import { Camera } from '@ionic-native/camera/ngx';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Media } from '@ionic-native/media/ngx';
import { CreateTaskComponent } from './components/create-task/create-task.component';
import { GetLabelsPipe } from './pipe/get-labels.pipe';
import { ReportsTextComponent } from './components/reports-text/reports-text.component';
import { PieChartComponent } from './components/pie-chart/pie-chart.component';
import { BarChartComponent } from './components/bar-chart/bar-chart.component';
import { MatrixChartComponent } from './components/matrix-chart/matrix-chart.component';
import { AttachmentComponent } from './components/attachment/attachment.component';
import { ReportModalFilter } from './components/report-modal-filter/report.modal.filter';
import { DownloadShareComponent } from './components/download-share/download-share.component';
import { GraphCircleComponent } from './components/graph-circle/graph-circle.component';
import { FilterModalComponent } from './components/filter-modal/filter-modal.component';
import { SubmissionActionsComponent } from './components/submission-actions/submission-actions.component';
import { ViewDetailComponent } from './components/view-detail/view-detail.component';
import { ScatterChartComponent } from './components/scatter-chart/scatter-chart.component';
import { SearchPipe } from './pipe/search.pipe';
import { HintComponent } from './components/hint/hint.component';
import { SurveyMsgComponent } from './components/survey-msg/survey-msg.component';
import { ChartsModule, ThemeService } from 'ng2-charts';
import { SurveyProviderService } from '../core/services/survey-provider.service';
import { RemarksModalComponent } from '../questionnaire/remarks-modal/remarks-modal.component';
import { PercentageColumnChartsComponent } from './components/percentage-column-charts/percentage-column-charts.component';
import { ExpansionPanelComponent } from './components/expansion-panel/expansion-panel.component';
import { ExpansionTableComponent } from './components/expansion-table/expansion-table.component';
import { GenericPopUpService } from './generic.popup';
import { HTTP } from '@ionic-native/http/ngx';

@NgModule({
  declarations: [
    CreateTaskComponent,
    MultipleTypeInputComponent,
    RadioTypeInputComponent,
    RemarksComponent,
    DateTypeInputComponent,
    FooterButtonsComponent,
    ImageUploadComponent,
    MatrixTypeInputComponent,
    PageQuestionsComponent,
    QuestionHeadingComponent,
    SliderTypeInputComponent,
    TextTypeInputComponent,
    CamelToTitlePipe,
    ItemListCardComponent,
    CommonHeaderComponent,
    EntityfilterComponent,
    PopoverComponent,
    ProgressBarComponent,
    GetLabelsPipe,
    ReportsTextComponent,
    PieChartComponent,
    BarChartComponent,
    ScatterChartComponent,
    MatrixChartComponent,
    AttachmentComponent,
    ReportModalFilter,
    DownloadShareComponent,
    GraphCircleComponent,
    FilterModalComponent,
    SubmissionActionsComponent,
    ViewDetailComponent,
    NoDataComponent,
    SearchPipe,
    SurveyMsgComponent,
    CreateTaskFormComponent,
    HintComponent,
    RemarksModalComponent,
    PercentageColumnChartsComponent,
    ExpansionPanelComponent,
    ExpansionTableComponent,
    PrivacyPolicyAndTCComponent,
    ProjectMetadataCardComponent,
    ProjectTaskListComponent,
    MetadataDetailsComponent,
    MetadataActionsComponent,
    ProjectDetailsCardComponent,
    AccordionListComponent,
    TaskCardComponent,
    AddLinkModalComponent,
    AttachmentCardComponent,
    AttachmentListsComponent,
    ReportListComponent,
    StartImprovementComponent
  ],

  imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule, TranslateModule, ChartsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    CreateTaskComponent,
    MultipleTypeInputComponent,
    RadioTypeInputComponent,
    RemarksComponent,
    DateTypeInputComponent,
    FooterButtonsComponent,
    ImageUploadComponent,
    MatrixTypeInputComponent,
    PageQuestionsComponent,
    QuestionHeadingComponent,
    SliderTypeInputComponent,
    CamelToTitlePipe,
    ItemListCardComponent,
    CommonHeaderComponent,
    EntityfilterComponent,
    PopoverComponent,
    TextTypeInputComponent,
    ProgressBarComponent,
    GetLabelsPipe,
    AttachmentComponent,
    ReportsTextComponent,
    PieChartComponent,
    BarChartComponent,
    ScatterChartComponent,
    MatrixChartComponent,
    ReportModalFilter,
    DownloadShareComponent,
    GraphCircleComponent,
    FilterModalComponent,
    SubmissionActionsComponent,
    ViewDetailComponent,
    NoDataComponent,
    SearchPipe,
    SurveyMsgComponent,
    HintComponent,
    ChartsModule,
    CreateTaskFormComponent,
    PercentageColumnChartsComponent,
    ExpansionPanelComponent,
    ExpansionTableComponent,
    PrivacyPolicyAndTCComponent,
    ProjectMetadataCardComponent,
    ProjectTaskListComponent,
    MetadataDetailsComponent,
    MetadataActionsComponent,
    ProjectDetailsCardComponent,
    AccordionListComponent,
    TaskCardComponent,
    AddLinkModalComponent,
    AttachmentCardComponent,
    AttachmentListsComponent,
    StartImprovementComponent
  ],
  providers: [
    Camera,
    ImagePicker,
    PhotoLibrary,
    FilePath,
    FileChooser,
    FileOpener,
    AndroidPermissions,
    Diagnostic,
    Media,
    CommonModule,
    HttpClientModule, 
    ReactiveFormsModule,
    ThemeService,
    SurveyProviderService,
    GenericPopUpService,
    HTTP
  ],
  entryComponents: [
    EntityfilterComponent,
    PopoverComponent,
    CreateTaskComponent,
    ReportModalFilter,
    DownloadShareComponent,
    FilterModalComponent,
    SubmissionActionsComponent,
    ViewDetailComponent,
    HintComponent,
    SurveyMsgComponent,
    CreateTaskFormComponent,
    RemarksModalComponent,
    PrivacyPolicyAndTCComponent,
    ProjectMetadataCardComponent,
    ProjectTaskListComponent,
    AddLinkModalComponent,
    ReportListComponent,
    StartImprovementComponent
  ],
  
})
export class SharedModule {}
