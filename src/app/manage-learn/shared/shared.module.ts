import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { CamelToTitlePipe } from './pipe/camel-to-title.pipe';
import { UtilsService } from '../core/services/utils.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  CommonListCardComponent, MultipleTypeInputComponent, AttchmentsComponent, AudioListComponent,
  CommonHeaderComponent, DateTypeInputComponent, FooterButtonsComponent, ImageUploadComponent, ItemListCardComponent,
  MatrixTypeInputComponent, PageQuestionsComponent, QuestionHeadingComponent, RadioTypeInputComponent, SliderTypeInputComponent,
  RemarksComponent, PopoverComponent, EntityfilterComponent, TextTypeInputComponent
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

@NgModule({

  declarations: [
    CamelToTitlePipe, CommonListCardComponent, ItemListCardComponent,
    CommonHeaderComponent, MultipleTypeInputComponent, RadioTypeInputComponent, RemarksComponent,
    DateTypeInputComponent, AttchmentsComponent, AudioListComponent, FooterButtonsComponent, ImageUploadComponent,
    MatrixTypeInputComponent, PageQuestionsComponent, QuestionHeadingComponent, SliderTypeInputComponent, EntityfilterComponent,
    PopoverComponent, TextTypeInputComponent, CreateTaskComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [CamelToTitlePipe, CommonListCardComponent, ItemListCardComponent,
    CommonHeaderComponent, MultipleTypeInputComponent, RadioTypeInputComponent, RemarksComponent,
    DateTypeInputComponent, AttchmentsComponent, AudioListComponent, FooterButtonsComponent, ImageUploadComponent,
    MatrixTypeInputComponent, PageQuestionsComponent, QuestionHeadingComponent, SliderTypeInputComponent, EntityfilterComponent,
    PopoverComponent, TextTypeInputComponent, CreateTaskComponent],
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
    HttpClientModule, //TODO:remove after api integration
    ReactiveFormsModule,
  ],
  entryComponents: [EntityfilterComponent, PopoverComponent, CreateTaskComponent],
})
export class SharedModule { }
