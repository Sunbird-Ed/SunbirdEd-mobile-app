import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { AastrikaFooterComponent } from "./aastrika-footer/aastrika-footer.component";
import { AastrikaHeaderComponent } from "./aastrika-header/aastrika-header.component";
import { PublicLicenseModule } from "./public-license/public-license.module";
import { PublicTocBannerModule } from "./public-toc-banner/public-toc-banner.module";
import { UserImageModule } from "./user-image/user-image.module";

@NgModule ({
  declarations: [],
  exports: [PublicTocBannerModule, UserImageModule, PublicLicenseModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]  
})

export class AastrikaComponentModule {}