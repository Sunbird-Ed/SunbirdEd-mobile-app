import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable()
export class SearchEventsService {
  private _searchSubmit = new Subject<string>();
  private _searchInput = new Subject<string>();
  private _searchCancel = new Subject<boolean>();
  private _openFilter = new Subject<boolean>();
  
  public searchSubmit$ = this._searchSubmit.asObservable();
  public searchInput$ = this._searchInput.asObservable();
  public searchCancel$ = this._searchCancel.asObservable();
  public openFilter$ = this._openFilter.asObservable();

  public setSearchSubmit(searchKeywords: string) {
    this._searchSubmit.next(searchKeywords);
  }

  public setSearchInput(searchKeywords: string) {
    this._searchInput.next(searchKeywords);
  }

  public triggerSearchCancel() {
    this._searchCancel.next(true);
  }

  public triggerOpenFilter() {
    this._openFilter.next(true);
  }

  public clear() {
    this._searchSubmit.complete();
    this._searchInput.complete();
    this._searchCancel.complete();
    this._openFilter.complete();
  }
}