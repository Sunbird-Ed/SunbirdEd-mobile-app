import { PopoverController, Platform } from '@ionic/angular';
import { Events } from '../../../../util/events';
import { GroupGuideLinesPopoverComponent } from './group-guidelines-popup.component';
import { CommonUtilService, UtilityService } from '../../../../services';
import { Location } from '@angular/common';

describe('SbGenericPopoverComponent', () => {
    let groupGuideLinesPopoverComponent: GroupGuideLinesPopoverComponent;

    const mockCommonUtilService: Partial<CommonUtilService> = {
    };

    const mockPopOverController: Partial<PopoverController> = {
        dismiss: jest.fn()
    };

    const mockPlatform: Partial<Platform> = {};
    const mockUtilityService: Partial<UtilityService> = {};
    const mockLocation: Partial<Location> = {
        back: jest.fn()
    };

    beforeAll(() => {
        groupGuideLinesPopoverComponent = new GroupGuideLinesPopoverComponent(
            mockPopOverController as PopoverController,
            mockPlatform as Platform,
            mockUtilityService as UtilityService,
            mockCommonUtilService as CommonUtilService,
            mockLocation as Location
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of SbGenericPopoverComponent', () => {
        expect(groupGuideLinesPopoverComponent).toBeTruthy();
    });

    it('should subscribe to back button and events subscription', () => {
        // arrange
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,
        } as any;

        const unsubscribeFn = jest.fn();
        groupGuideLinesPopoverComponent.backButtonFunc = {
            unsubscribe: unsubscribeFn,
        } as any;
        mockCommonUtilService.getAppName = jest.fn(() => 'sunbird');
        groupGuideLinesPopoverComponent.shouldUpdateUserLevelGroupTnc = false
        // act
        groupGuideLinesPopoverComponent.ngOnInit();
        // assert
        setTimeout(() => {
            expect(mockPopOverController.dismiss).toHaveBeenCalledWith({ isLeftButtonClicked: null });
            expect(unsubscribeFn).toHaveBeenCalled();
        });
    });

    it('should subscribe to back button and events subscription', () => {
        // arrange
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,
        } as any;

        const unsubscribeFn = jest.fn();
        groupGuideLinesPopoverComponent.backButtonFunc = {
            unsubscribe: unsubscribeFn,
        } as any;
        mockCommonUtilService.getAppName = jest.fn(() => 'sunbird');
        groupGuideLinesPopoverComponent.shouldUpdateUserLevelGroupTnc = true
        // act
        groupGuideLinesPopoverComponent.ngOnInit();
        // assert
        setTimeout(() => {
            expect(mockLocation.back).toHaveBeenCalled()
            expect(unsubscribeFn).toHaveBeenCalled();
        });
    });

    it('should unsubscribe to back button and events on ngOnDestroy', () => {
        // arrange
        groupGuideLinesPopoverComponent.backButtonFunc = {
            unsubscribe: jest.fn(),
        } as any;
        // act
        groupGuideLinesPopoverComponent.ngOnDestroy();
        // assert
        // expect(groupGuideLinesPopoverComponent.selectedContents).toEqual(mockEventsResponse);
        expect(groupGuideLinesPopoverComponent.backButtonFunc.unsubscribe).toHaveBeenCalled();
    });

    it('should dismiss the popup on closePopOver', () => {
        // arrange
        // act
        groupGuideLinesPopoverComponent.closePopover();
        // assert
        expect(mockPopOverController.dismiss).toHaveBeenCalledWith({ isLeftButtonClicked: null });
    });

    it('should dismiss the popup on continue if agreedToGroupGuidelines', () => {
        // arrange
        groupGuideLinesPopoverComponent.agreedToGroupGuidelines = true;
        // act
        groupGuideLinesPopoverComponent.continue();
        // assert
        expect(mockPopOverController.dismiss).toHaveBeenCalledWith({ isLeftButtonClicked: true });
    });

    it('should dismiss the popup on continue if not agreedToGroupGuidelines', () => {
        // arrange
        groupGuideLinesPopoverComponent.agreedToGroupGuidelines = false;
        // act
        groupGuideLinesPopoverComponent.continue();
        // assert
        expect(groupGuideLinesPopoverComponent.showGroupGuideLinesError).toBe(true);
    });

    it('openTermsOfUse', () => {
        //arrange
        mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('TOU_BASE_URL'));
        //act
        groupGuideLinesPopoverComponent.openTermsOfUse();
        //assert
        setTimeout(() => {
            expect(mockUtilityService.getBuildConfigValue).toHaveBeenCalledWith('TOU_BASE_URL');
        }, 0);
    });

});
