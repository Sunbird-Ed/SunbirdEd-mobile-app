import { PopoverController, Platform } from '@ionic/angular';
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
    let subscribeWithPriorityCallback;
    const mockBackBtnFunc = {unsubscribe: jest.fn()};
    const subscribeWithPriorityData = jest.fn((val, callback) => {
        subscribeWithPriorityCallback = callback;
        return mockBackBtnFunc;
    });
    mockPlatform.backButton = {
        subscribeWithPriority: subscribeWithPriorityData,
    } as any;
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

    it('should subscribe to back button and events subscription', (done) => {
        // arrange
        const mockBackBtnFunc = {unsubscribe: jest.fn()};
        const subscribeWithPriorityData = jest.fn((_, fn) => {
            setTimeout(() => {
                fn();
            });
            return mockBackBtnFunc;
        });
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,
        } as any;
        mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('sunbird'));
        groupGuideLinesPopoverComponent.shouldUpdateUserLevelGroupTnc = false
        // act
        groupGuideLinesPopoverComponent.ngOnInit();
        // assert
        setTimeout(() => {
            // expect(mockPopOverController.dismiss).toHaveBeenCalledWith({ isLeftButtonClicked: null });
            done()
        });
    });

    it('should subscribe to back button and events subscription', (done) => {
        // arrange
        let subscribeWithPriorityCallback;
        const mockBackBtnFunc = {unsubscribe: jest.fn()};
        const subscribeWithPriorityData = jest.fn((_, fn) => {
            setTimeout(() => {
                fn();
            });
            return mockBackBtnFunc;
        });
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,
        } as any;
        mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('sunbird'));
        mockLocation.back = jest.fn()
        groupGuideLinesPopoverComponent.shouldUpdateUserLevelGroupTnc = true
        // act
        groupGuideLinesPopoverComponent.ngOnInit();
        // assert
        setTimeout(() => {
            expect(mockLocation.back).toHaveBeenCalled()
            expect(mockBackBtnFunc.unsubscribe).toHaveBeenCalled();
            done()
        });
    });

    it('should subscribe to back button and events subscription', (done) => {
        // arrange
        let subscribeWithPriorityCallback;
        const mockBackBtnFunc = {unsubscribe: jest.fn()};
        const subscribeWithPriorityData = jest.fn((_, fn) => {
            setTimeout(() => {
                fn();
            });
            return mockBackBtnFunc;
        });
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,
        } as any;
        mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('sunbird'));
        mockLocation.back = jest.fn()
        groupGuideLinesPopoverComponent.shouldUpdateUserLevelGroupTnc = false
        // act
        groupGuideLinesPopoverComponent.ngOnInit();
        // assert
        setTimeout(() => {
            expect(mockBackBtnFunc.unsubscribe).toHaveBeenCalled();
            done()
        });
    });

    it('should unsubscribe to back button and events on ngOnDestroy', (done) => {
        // arrange
        let subscribeWithPriorityCallback;
        const mockBackBtnFunc = {unsubscribe: jest.fn()};
        const subscribeWithPriorityData = jest.fn((_, fn) => {
            setTimeout(() => {
                fn();
            });
            return mockBackBtnFunc;
        });
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,
        } as any;
        // act
        groupGuideLinesPopoverComponent.ngOnDestroy();
        // assert
        // expect(groupGuideLinesPopoverComponent.selectedContents).toEqual(mockEventsResponse);
        setTimeout(() => {
            expect(groupGuideLinesPopoverComponent.backButtonFunc.unsubscribe).toHaveBeenCalled();
            done()
        }, 0);
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
