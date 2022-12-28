import { Type } from '@angular/core'
import { SafeStyle } from '@angular/platform-browser'
type TUrl = undefined | 'none' | 'back' | string
export namespace NsWidgetResolver {
  export type UnitPermissionPrimitive = undefined | null | string
  export interface IUnitPermissionObject {
    all: UnitPermissionPrimitive | string[]
    none: UnitPermissionPrimitive | string[]
    some: UnitPermissionPrimitive | string[]
  }
  export type UnitPermission =
    | UnitPermissionPrimitive
    | string[]
    | IUnitPermissionObject
    | Pick<IUnitPermissionObject, 'all'>
    | Pick<IUnitPermissionObject, 'none'>
    | Pick<IUnitPermissionObject, 'some'>
    | Exclude<IUnitPermissionObject, 'all'>
    | Exclude<IUnitPermissionObject, 'none'>
    | Exclude<IUnitPermissionObject, 'some'>
  export interface IPermissions {
    enabled: boolean
    available: boolean
    roles?: UnitPermission
    features?: UnitPermission
    groups?: UnitPermission
  }

  export interface IBaseConfig {
    widgetType: string
    widgetSubType: string
  }

  export interface IRegistrationConfig extends IBaseConfig {
    component: Type<IWidgetData<any>>
  }

  export interface IRegistrationsPermissionConfig extends IBaseConfig {
    widgetPermission?: IPermissions
  }

  export interface IRenderConfigWithTypedData<T> extends IRegistrationsPermissionConfig {
    widgetData: T
    widgetInstanceId?: string
    widgetHostClass?: string
    widgetHostStyle?: { [key: string]: string }
  }
  export type IRenderConfigWithAnyData = IRenderConfigWithTypedData<any>
  export interface IWidgetData<T>
    extends Omit<IRenderConfigWithTypedData<T>, 'widgetPermission' | 'widgetHostStyle'> {
    widgetSafeStyle?: SafeStyle
    updateBaseComponent: (
      widgetType: string,
      widgetSubType: string,
      widgetInstanceId?: string,
      widgetHostClass?: string,
      widgetSafeStyle?: SafeStyle,
    ) => void
  }
  export interface ITitle {
    title: string,
    url: TUrl
  }
}
