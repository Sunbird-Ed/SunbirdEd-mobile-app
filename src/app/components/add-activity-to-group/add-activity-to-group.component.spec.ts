import { AddActivityToGroupComponent } from './add-activity-to-group.component';
import { GroupHandlerService, CommonUtilService } from '@app/services';

describe('AddActivityToGroupComponent', () => {
    let addActivityToGroupComponent: AddActivityToGroupComponent;
    const mockGroupHandlerService: GroupHandlerService = {};
    const mockCommonUtilService: CommonUtilService = {
        showToast: jest.fn()
    };

    beforeAll(() => {
        addActivityToGroupComponent = new AddActivityToGroupComponent(
            mockGroupHandlerService as GroupHandlerService,
            mockCommonUtilService as CommonUtilService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('Should instanciate AddActivityToGroupComponent', () => {
        expect(addActivityToGroupComponent).toBeTruthy();
    });

    // describe('ngOninit', () => {
    //     beforeEach(() => {
    //         const state = {
    //             pageIds: [],
    //             params: {}
    //         };
    //         jest.spyOn(CsGroupAddableBloc.instance, 'state', 'get').mockReturnValue(state);
    //     });
    // });

    describe('addActivityToGroup', () => {
        it('should addActivityToGroup', (done) => {
            // arrange
            const data = {
                pageIds: [],
                params: {
                    groupId: 'group_id',
                    activityId: 'some_identifier',
                    activityType: 'some_type',
                    pageId: 'some_page_id',
                    corRelationList: [],
                    noOfPagesToRevertOnSuccess: -3,
                    activityList: [{
                        id: 'some_identifier1'
                    }]
                }
            };
            addActivityToGroupComponent.identifier = 'some_identifier';
            addActivityToGroupComponent.pageId = 'some_page_id';
            mockGroupHandlerService.addActivityToGroup = jest.fn();
            // act
            addActivityToGroupComponent.addActivityToGroup(data);
            // assert
            setTimeout(() => {
                expect(mockGroupHandlerService.addActivityToGroup).toHaveBeenCalledWith('group_id', 'some_identifier',
                    'some_type', 'some_page_id', [], -3);
                done();
            }, 0);
        });

        it('should show message if activity already exists', () => {
            // arrange
            const data = {
                pageIds: [],
                params: {
                    groupId: 'group_id',
                    activityId: 'some_identifier',
                    activityType: 'some_type',
                    pageId: 'some_page_id',
                    corRelationList: [],
                    noOfPagesToRevertOnSuccess: -3,
                    activityList: [{
                        id: 'some_identifier'
                    }]
                }
            };
            addActivityToGroupComponent.identifier = 'some_identifier';
            addActivityToGroupComponent.pageId = 'some_page_id';
            mockGroupHandlerService.addActivityToGroup = jest.fn();
            // act
            addActivityToGroupComponent.addActivityToGroup(data);
            // assert
            expect(mockCommonUtilService.showToast).toHaveBeenCalled();
        });
    });

});
