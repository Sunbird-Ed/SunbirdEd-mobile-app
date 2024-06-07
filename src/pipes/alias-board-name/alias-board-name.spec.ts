import {AliasBoardName} from '../../pipes/alias-board-name/alias-board-name';
import {FormAndFrameworkUtilService} from '../../services';

describe('alias-board-name', () => {
    let aliasBoardName: AliasBoardName;
    const mockFromAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        getBoardAliasName: (() => Promise.reject())
    };
    beforeAll(() => {
        aliasBoardName = new AliasBoardName(
            mockFromAndFrameworkUtilService as FormAndFrameworkUtilService
        );
        mockFromAndFrameworkUtilService.getBoardAliasName = jest.fn(() => Promise.resolve([]))
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create instance of aliasBoardName', () => {
        // assert
        expect(aliasBoardName).toBeTruthy();
    });

    describe('transform', () => {
        beforeEach(() => {
            mockFromAndFrameworkUtilService.getBoardAliasName = jest.fn(() => Promise.resolve([{
                name: 'CBSE',
                code: 'ekstep-ncert-12',
                aliased: 'CBSE/NCERT'
            }]))
            aliasBoardName = new AliasBoardName(
                mockFromAndFrameworkUtilService as FormAndFrameworkUtilService
            );
        })

        it('should take string and check in aliasedCached and find the value', () => {
            // act
            aliasBoardName.transform('CBSE');
        });

        it('should take string and check in aliasedCached and find the value', () => {
            mockFromAndFrameworkUtilService.getBoardAliasName = jest.fn(() => Promise.resolve([]))
            // act
            aliasBoardName.transform('State(Andhra pradesh)');
        });
    })
});


