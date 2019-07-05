import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SearchComponent } from './search.component';
import { TranslateModule } from '@ngx-translate/core';
// migration-TODO
// import { FilterPage } from './filters/filter';
// import { FilterOptions } from './filters/options/options';
import { IonicImageLoader } from 'ionic-image-loader';
import { Network } from '@ionic-native/network/ngx';
import { PipesModule } from '../../pipes/pipes.module';
import { ComponentsModule } from '../components/components.module';


@NgModule({
  declarations: [
    SearchComponent,
    // migration-TODO
    // FilterPage,
    // FilterOptions
  ],
  imports: [
    CommonModule,
    IonicModule.forRoot({
      scrollPadding: false,
      scrollAssist: true,
      // autoFocusAssist: false
    }),
    IonicImageLoader,
    PipesModule,
    ComponentsModule
  ],
  entryComponents: [
    // migration-TODO
    // FilterPage,
    // FilterOptions
  ],
  providers: [
    Network,
  ]
})
export class SearchModule { }
