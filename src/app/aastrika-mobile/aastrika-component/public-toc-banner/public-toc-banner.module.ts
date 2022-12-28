import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PublicTocBannerComponent } from './public-toc-banner.component'
import { PipeDurationTransformModule } from '../../library/ws-widget/utils/src/public-api'
import { IonicModule } from '@ionic/angular'
import { MatCardModule, MatTabsModule } from '@angular/material'
import { UserImageModule } from '../user-image/user-image.module'
import { PublicLicenseModule } from '../public-license/public-license.module'

@NgModule({
  declarations: [PublicTocBannerComponent],
  imports: [
    CommonModule,
    IonicModule,
    MatTabsModule,
    MatCardModule,
    PipeDurationTransformModule,
    UserImageModule,
    PublicLicenseModule
  ],
  exports: [PublicTocBannerComponent],
})
export class PublicTocBannerModule { }
