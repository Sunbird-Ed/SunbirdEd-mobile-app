import { TestBed } from '@angular/core/testing';
import { ContentService, TelemetryObject } from '@project-sunbird/sunbird-sdk';

import { QumlPlayerService } from './quml-player.service';

describe('PrintPdfService', () => {
    let qumlPlayerService: QumlPlayerService;
    const mockContentService: Partial<ContentService> = {
        getQuestionList : jest.fn(),
        getQuestionSetHierarchy: jest.fn()
    };
  
    beforeAll(() => {
      qumlPlayerService = new QumlPlayerService(
        mockContentService as ContentService,
      );
    });
  
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    });

    it('should be created', () => {
        expect(qumlPlayerService).toBeTruthy();
      });

    it('should get questions', () => {
        const questionIds = ['1','2','3','4','5','6'];
        const questions = qumlPlayerService.getQuestions(questionIds);
        expect(questions).toBe(undefined);
    })

    it('should get questions', () => {
        const questionId = '1';
        const questions = qumlPlayerService.getQuestion(questionId);
        expect(questions).toBe(undefined);
    })

    it('should get question set', () => {
      const questionId = '1';
      const qSet = qumlPlayerService.getQuestionSet(questionId);
      expect(qSet).toBe(undefined);
  })

});
