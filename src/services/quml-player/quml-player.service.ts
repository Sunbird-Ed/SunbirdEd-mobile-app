import { Inject, Injectable } from '@angular/core';
import { CsModule } from '@project-sunbird/client-services';
import { QuestionCursor } from '@project-sunbird/sunbird-quml-player-v8';
import { ContentService } from '@project-sunbird/sunbird-sdk';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

  getQuestions(questionIds: string[]): Observable<any> {
    return this.contentService.getQuestionList(questionIds);
  }

  getQuestionSetHierarchy(data) {
    return this.contentService.getQuestionSetHierarchy(data);
  }
}


