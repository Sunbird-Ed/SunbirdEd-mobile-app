import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatIcon, MatIconModule } from "@angular/material";
import { IonicModule } from "@ionic/angular";
import { UserImageComponent } from "./user-image.component";

@NgModule({
    declarations: [UserImageComponent],
    imports: [
      CommonModule,
      IonicModule,
      MatIconModule
    ],
    exports: [UserImageComponent],
  })
  export class UserImageModule { }