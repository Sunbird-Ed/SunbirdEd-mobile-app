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

    it('should addActivityToGroup', (done) => {
        // arrange
        addActivityToGroupComponent.data = {
            groupId: 'group_id',
            activityId: 'some_identifier',
            activityType: 'some_type',
            pageId: 'some_page_id',
            corRelationList: [],
            activityList: [{
                activityId: 'id'
            }],
            noOfPagesToRevertOnSuccess: -3
        };
        mockGroupHandlerService.addActivityToGroup = jest.fn();
        // act
        addActivityToGroupComponent.addActivityToGroup();
        // assert
        setTimeout(() => {
            expect(mockGroupHandlerService.addActivityToGroup).toHaveBeenCalledWith('group_id', 'some_identifier',
                'some_type', 'some_page_id', [], -3);
            done();
        }, 0);
    });

    it('should show message if activity already exists', () => {
        // arrange
        addActivityToGroupComponent.data = {
            groupId: 'group_id',
            activityId: 'some_identifier',
            activityType: 'some_type',
            pageId: 'some_page_id',
            corRelationList: [],
            activityList: [{
                id: 'some_identifier'
            }]
        };
        mockGroupHandlerService.addActivityToGroup = jest.fn();
        // act
        addActivityToGroupComponent.addActivityToGroup();
        // assert
        expect(mockCommonUtilService.showToast).toHaveBeenCalled();
    });
});
