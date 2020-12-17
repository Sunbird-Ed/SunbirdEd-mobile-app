import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ObservationService {
  private programIndex;
  private solutionIndex;
  private entityIndex;

  constructor() {}

  public setIndex(programIndex = null, solutionIndex = null, entityIndex = null) {
    this.programIndex = programIndex;
    this.solutionIndex = solutionIndex;
    this.entityIndex = entityIndex;
  }

  public getProgramIndex() {
    return this.programIndex;
  }

  public getSolutionIndex() {
    return this.solutionIndex;
  }
  public getEntityIndex() {
    return this.entityIndex;
  }
}
