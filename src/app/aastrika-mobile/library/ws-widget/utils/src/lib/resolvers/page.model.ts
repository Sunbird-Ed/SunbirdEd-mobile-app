import { ThemePalette } from '@angular/material'
import { NsWidgetResolver } from '../../../../resolver/src/public-api'
import { NsAppsConfig } from '../services/configurations.model'

export namespace NsPage {
  export interface IPage {
    contentType: string
    navigationBar: INavBar
    pageLayout: NsWidgetResolver.IRenderConfigWithAnyData
    tourGuide?: string[][]
  }

  export interface INavBar {
    links: NsWidgetResolver.IRenderConfigWithTypedData<INavLink>[]
    xsmallNonMenuLinks: NsWidgetResolver.IRenderConfigWithTypedData<INavLink>[]
    pageBackLink: string
    pageTitle: string
    background: INavBackground
  }
  export interface INavBackground {
    color: 'primary' | 'accent' | 'warn' | 'default'
    styles: { [id: string]: string }
  }

  export interface INavLink {
    config: Pick<INavLinkConfig<'card-full' | 'card-small'>, 'type' | 'hideStatus'> |
    Pick<INavLinkConfig<'mat-icon-button' | 'mat-fab' | 'mat-mini-fab' | 'card-mini'>, 'type'> |
    Pick<INavLinkConfig<'mat-button' | 'mat-raised-button' | 'mat-flat-button' | 'mat-stroked-button'>, 'type' | 'hideIcon' | 'hideTitle'> |
    Pick<INavLinkConfig<'mat-menu-item'>, 'type'> |
    Pick<INavLinkConfig<'feature-item'>, 'type' | 'useShortName' | 'iconColor' | 'treatAsCard' | 'hidePin'>
    actionBtnId?: string
    actionBtn?: NsAppsConfig.IFeature
    actionBtnName?: string
  }

  export interface INavLinkConfig<T> {
    type: T
    hideIcon?: boolean
    hideTitle?: boolean
    hideStatus?: boolean
    hidePin?: boolean
    iconColor?: ThemePalette
    treatAsCard?: boolean
    useShortName?: boolean
  }

}
