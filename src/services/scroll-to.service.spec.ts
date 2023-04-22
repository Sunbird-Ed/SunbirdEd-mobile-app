import {ScrollToService} from '../services/scroll-to.service';

describe('Scroll-to-service', () => {
    let scrollToService: ScrollToService;

    scrollToService = new ScrollToService();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of scroll-to-service', () => {
        expect(scrollToService).toBeTruthy();
    });

    describe('scroll-to test cases', () => {
        it('should scroll-to element returns null ', () => {
            // arrange
            const element = document.getElementById('sample-element-id');
            // act
            scrollToService.scrollTo('sample-element-id');
            // assert
            expect(element).toBe(null);
        });

        it('should return element by smooth position ', () => {
            // arrange
            const data = jest.fn();
            jest.spyOn(document, 'getElementById').mockReturnValue({data: 'element', scrollIntoView: data});
            // act
            scrollToService.scrollTo('element');
            // assert
            expect(data).toHaveBeenCalledWith({behavior: 'smooth'});
        });
    });

    it('should call scrollToWithinContent  when called upon ion-content', () => {
        // arrange
        const sampleFn = {scrollToPoint: jest.fn(() => Promise.resolve())};
        jest.spyOn(document, 'getElementById').mockReturnValue({data: 'element', scrollToPoint: sampleFn, offsetTop: {}});
        // act
        scrollToService.scrollToWithinContent(sampleFn, 'element');
        // assert
        expect(sampleFn.scrollToPoint).toHaveBeenCalled();
    });
});
