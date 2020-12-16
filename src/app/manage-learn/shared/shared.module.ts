import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProgramSolutionComponent } from "./program-solution/program-solution.component";
import { HttpClientModule } from "@angular/common/http";
import { IonicModule } from "@ionic/angular";
import { CamelToTitlePipe } from "./pipe/camel-to-title.pipe";
import { UtilsService } from "../core/services/utils.service";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonListCardComponent } from "./components";

@NgModule({
  declarations: [CamelToTitlePipe, CommonListCardComponent, ProgramSolutionComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule, //TODO:remove
    IonicModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [CamelToTitlePipe, CommonListCardComponent, ProgramSolutionComponent, HttpClientModule],
})
export class SharedModule {}
