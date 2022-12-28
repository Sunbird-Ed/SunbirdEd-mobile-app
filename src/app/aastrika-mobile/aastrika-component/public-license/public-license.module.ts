import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PipeDurationTransformModule } from '../../library/ws-widget/utils/src/public-api'
import { IonicModule } from '@ionic/angular'
import { MatCardModule, MatTabsModule } from '@angular/material'
import { UserImageModule } from '../user-image/user-image.module'
import { PublicLicenseComponent } from './public-license.component'
import { AppTocService } from '../../project/ws/app/src/lib/routes/app-toc/services/app-toc.service'

@NgModule({
  declarations: [PublicLicenseComponent],
  imports: [
    CommonModule,
    IonicModule,
    MatTabsModule,
    MatCardModule,
    PipeDurationTransformModule,
    UserImageModule
  ],
  exports: [PublicLicenseComponent],
  providers: [AppTocService]
})
export class PublicLicenseModule { }
