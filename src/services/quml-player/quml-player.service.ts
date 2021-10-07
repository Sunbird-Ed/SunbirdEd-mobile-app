import { Inject, Injectable } from '@angular/core';
import { QuestionCursor } from '@project-sunbird/sunbird-quml-player-v9';
import { ContentService } from '@project-sunbird/sunbird-sdk';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QumlPlayerService implements QuestionCursor {
  
  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
  ) {}

  getQuestion(questionId: string): Observable<any> {
    return this.contentService.getQuestionList([questionId]);
  }

  getQuestions(questionIds: string[], parentId: string): Observable<any> {
    return this.contentService.getQuestionList(questionIds, parentId);
  }

  getQuestionSetHierarchy(data) {
    return this.contentService.getQuestionSetHierarchy(data);
  }

  getQuestionSet(identifier: string) {
    return this.contentService.getQuestionSetHierarchy(identifier);
  }

  getAllQuestionSet(identifiers: string[]) {
    return of({});
  }
}


