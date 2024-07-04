import { PopoverController, Platform } from '@ionic/angular';
import { Events } from '../../../../util/events';
import { SbGenericPopoverComponent } from '../sb-generic-popover/sb-generic-popover.component';

describe('SbGenericPopoverComponent', () => {
    let sbGenericPopoverComponent: SbGenericPopoverComponent;

    const mockEventsResponse = { selectedContents: ['do_1234'] };
    const mockEvents: Partial<Events> = {
        subscribe: jest.fn(() => mockEventsResponse),
        unsubscribe: jest.fn()
    };

    const mockPopOverController: Partial<PopoverController> = {
        dismiss: jest.fn()
    };

    const mockPlatform: Partial<Platform> = {
        backButton: {
            subscribeWithPriority: jest.fn()
        } as Partial<BackButtonEmitter> as BackButtonEmitter,
    };

    beforeAll(() => {
        sbGenericPopoverComponent = new SbGenericPopoverComponent(
            mockPopOverController as PopoverController,
            mockPlatform as Platform,
            mockEvents as Events
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of SbGenericPopoverComponent', () => {
        expect(sbGenericPopoverComponent).toBeTruthy();
    });

    it('should subscribe to back button and events subscription', () => {
        // arrange
        const mockButtonSubscription = {
            unsubscribe: jest.fn(() => Promise.resolve())
        };
        const subscribeWithPriorityData = jest.fn((_, fn) => {
            setTimeout(() => {
                fn();
            });
            return mockButtonSubscription;
        });
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,
        } as any;
        mockEvents.subscribe = jest.fn((topic, fn) => {
            if(topic == 'selectedContents:changed') {
                fn({selectedContents: {}})
        }});
        // act
        sbGenericPopoverComponent.ngOnInit();
        // assert
        setTimeout(() => {
            expect(mockPopOverController.dismiss).toHaveBeenCalledWith({ isLeftButtonClicked: null });
        }, 0);
    });

    it('should unsubscribe to back button and events on ngOnDestroy', () => {
        // arrange
        sbGenericPopoverComponent.backButtonFunc = {
            unsubscribe: jest.fn(),
        } as any;
        // act
        sbGenericPopoverComponent.ngOnDestroy();
        // assert
        expect(mockEvents.unsubscribe).toHaveBeenCalledWith('selectedContents:changed');
        // expect(sbGenericPopoverComponent.selectedContents).toEqual(mockEventsResponse);
        expect(sbGenericPopoverComponent.backButtonFunc.unsubscribe).toHaveBeenCalled();
    });

    it('should dismiss the popup on closePopOver', () => {
        // arrange
        // act
        sbGenericPopoverComponent.closePopover();
        // assert
        expect(mockPopOverController.dismiss).toHaveBeenCalledWith({ isLeftButtonClicked: null });
    });

    it('should dismiss the popup on deleteContent', () => {
        // arrange
        // act
        sbGenericPopoverComponent.deleteContent(1);
        // assert
        expect(mockPopOverController.dismiss).toHaveBeenCalledWith({ isLeftButtonClicked: false });
    });

    it('should dismiss the popup on deleteContent, buttonIndex default', () => {
        // arrange
        // act
        sbGenericPopoverComponent.deleteContent();
        // assert
        expect(mockPopOverController.dismiss).toHaveBeenCalledWith({ isLeftButtonClicked: true });
    });

});
