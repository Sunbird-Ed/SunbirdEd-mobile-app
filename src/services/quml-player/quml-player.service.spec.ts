import {ContentService} from '@project-sunbird/sunbird-sdk';

import {QumlPlayerService} from './quml-player.service';
import {of} from 'rxjs';

describe('PrintPdfService', () => {
    let qumlPlayerService: QumlPlayerService;
    const mockContentService: Partial<ContentService> = {
        getQuestionList: jest.fn(),
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
        const questionIds = ['1', '2', '3', '4', '5', '6'];
        const questions = qumlPlayerService.getQuestions(questionIds);
        expect(questions).toBe(undefined);
    });

    it('should get questions', () => {
        const questionId = '1';
        const questions = qumlPlayerService.getQuestion(questionId);
        expect(questions).toBe(undefined);
    });

    it('should get question set', () => {
        const questionId = '1';
        const qSet = qumlPlayerService.getQuestionSet(questionId);
        expect(qSet).toBe(undefined);
    });

    it('should call getQuestionSetHierarchy', () => {
        // arrange
        mockContentService.getQuestionSetHierarchy = jest.fn(() => of('sample'));
        // act
        qumlPlayerService.getQuestionSetHierarchy('sampleData');
        // assert
        expect(mockContentService.getQuestionSetHierarchy).toHaveBeenCalledWith('sampleData');
    });

    it('should call getAllQuestionSet with array of identifiers', () => {
        // arrange
        jest.spyOn(qumlPlayerService, 'getAllQuestionSet').getMockImplementation();
        // act
        qumlPlayerService.getAllQuestionSet(['do123', 'do1234']);
        // assert
        expect(qumlPlayerService.getAllQuestionSet).toHaveBeenCalledWith(['do123', 'do1234']);
    });

});
