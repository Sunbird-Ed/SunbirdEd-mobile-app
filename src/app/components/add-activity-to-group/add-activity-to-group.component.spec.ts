import { AddActivityToGroupComponent } from './add-activity-to-group.component';
import { GroupHandlerService } from '@app/services';

describe('AddActivityToGroupComponent', () => {
    let addActivityToGroupComponent: AddActivityToGroupComponent;
    const mockGroupHandlerService: GroupHandlerService = {};

    beforeAll(() => {
        addActivityToGroupComponent = new AddActivityToGroupComponent(
            mockGroupHandlerService as GroupHandlerService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('Should instanciate AddActivityToGroupComponent', () => {
        expect(addActivityToGroupComponent).toBeTruthy();
    });

    it('addActivityToGroup', (done) => {
        // arrange
        addActivityToGroupComponent.data = {
            groupId: 'group_id',
            activityId: 'some_identifier',
            activityType: 'some_type',
            pageId: 'some_page_id',
            corRelationList: []
        };
        mockGroupHandlerService.addActivityToGroup = jest.fn();
        // act
        addActivityToGroupComponent.addActivityToGroup();
        // assert
        setTimeout(() => {
            expect(mockGroupHandlerService.addActivityToGroup).toHaveBeenCalledWith('group_id', 'some_identifier',
                'some_type', 'some_page_id', []);
            done();
        }, 0);
    });
});
