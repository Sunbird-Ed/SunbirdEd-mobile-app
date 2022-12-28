import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout'
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class ValueService {

  constructor(
    private breakpointObserver: BreakpointObserver,
  ) { }

  public isXSmall$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.XSmall])
    .pipe(map((res: BreakpointState) => res.matches))
  public isLtMedium$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.XSmall, Breakpoints.Small])
    .pipe(map((res: BreakpointState) => res.matches))

}
