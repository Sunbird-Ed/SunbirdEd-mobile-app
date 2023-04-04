import { TextbookTocService } from "./textbook-toc-service";

describe('textbookTocService', () => {
    let textbookTocService: TextbookTocService;

    beforeEach(() => {
        textbookTocService = new TextbookTocService()
    });

    beforeEach(() => {
        jest.clearAllMocks()
    });

    it('should create a instance of textbookTocService', () => {
        expect(textbookTocService).toBeTruthy();
    });

    describe('setTextbookIds', () => {
        it('should setTextbookIds', () => {
            // arrange
            const textbookIds = {
                contentId: undefined,
                rootUnitId: undefined,
                unit: undefined,
                content: undefined
            }
            // act
            textbookTocService.setTextbookIds(textbookIds)
            // assert
        });

        describe('resetTextbookIds', () => {
            it('should reset TextbookIds', () => {
                // arrange
                const textbookIds = {
                    contentId: undefined,
                    rootUnitId: undefined,
                    unit: undefined,
                    content: undefined
                }
                // act
                textbookTocService.resetTextbookIds();
                // assert
            })
        })
    })
})