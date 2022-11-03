import {PbHorizontalComponent} from './pb-horizontal.component';

describe('PbHorizontalComponent', () => {
    let pbHorizontalComponent: PbHorizontalComponent;
    beforeAll(() => {
        pbHorizontalComponent = new PbHorizontalComponent(
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of pb horizontal Component', () => {
        expect(pbHorizontalComponent).toBeTruthy();
    });

})