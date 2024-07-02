import {DiscussionService,} from '@project-sunbird/sunbird-sdk';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DiscussionTelemetryService } from '../../../services/discussion/discussion-telemetry.service';
import { AccessDiscussionComponent } from './access-discussion.component';
import { AppHeaderService, CommonUtilService } from '../../../services';
import { AppGlobalService, TelemetryGeneratorService } from '../../../services';

describe('GroupDetailsPage', () => {
    let accessDiscussionComponent: AccessDiscussionComponent;
    const mockCommonUtilService: Partial<CommonUtilService> = {
       showToast: jest.fn()
    };
    const mockRouter: Partial<Router> = {
        navigate: jest.fn()
    };
    const mockDiscussionService: Partial<DiscussionService> = {};
    const mockDiscussionTelemetryService: Partial<DiscussionTelemetryService> = {};
    const mockHeaderService: Partial<AppHeaderService> = {
        hideHeader: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn()
    };

    beforeAll(() => {
        accessDiscussionComponent = new AccessDiscussionComponent(
            mockDiscussionService as DiscussionService,
            mockRouter as Router,
            mockCommonUtilService as CommonUtilService,
            mockDiscussionTelemetryService as DiscussionTelemetryService,
            mockHeaderService as AppHeaderService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppGlobalService as AppGlobalService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be create a instance of groupDetailsPage', () => {
        expect(accessDiscussionComponent).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should check for forumIds', () => {
            // arrange
            mockAppGlobalService.isForumEnabled = true;
            mockDiscussionService.getForumIds = jest.fn(() => throwError({ error: 'error' })) as any;
            // act
            accessDiscussionComponent.ngOnInit()
            // assert
            expect(mockDiscussionService.getForumIds).toHaveBeenCalled();
            expect(accessDiscussionComponent.isForumEnabled).toBe(true);
        });

        it('should check for forumIds, not enabled', () => {
            // arrange
            mockAppGlobalService.isForumEnabled = false;
            mockDiscussionService.getForumIds = jest.fn(() => throwError({ error: 'error' })) as any;
            // act
            accessDiscussionComponent.ngOnInit()
            // assert
            expect(mockDiscussionService.getForumIds).toHaveBeenCalled();
            expect(accessDiscussionComponent.isForumEnabled).toBe(true);
        });
    })

    describe('checkAccess', () => {
        it('should check for access for DF', (done) => {
            // arrange
            accessDiscussionComponent.fetchForumIdReq = {
                identifier: ['some_id'],
                type: 'group'
            }
            const res = {
                result: [
                    {
                        cid: 'some_cid'
                    }
                ]
            }
            mockDiscussionService.getForumIds = jest.fn(() => of(res) as any);
            // act
            accessDiscussionComponent.fetchForumIds()
            // assert
            expect(mockDiscussionService.getForumIds).toHaveBeenCalled();
            setTimeout(() => {
                expect(accessDiscussionComponent.forumDetails).toEqual(res.result[0]);
                expect(accessDiscussionComponent.isForumEnabled).toBe(true);
                done()
            });
        })

        it('should check for access for DF', (done) => {
            // arrange
            accessDiscussionComponent.fetchForumIdReq = {
                identifier: ['some_id'],
                type: 'group'
            }
            const res = {
                result: [
                ]
            }
            mockDiscussionService.getForumIds = jest.fn(() => of(res) as any);
            // act
            accessDiscussionComponent.fetchForumIds()
            // assert
            expect(mockDiscussionService.getForumIds).toHaveBeenCalled();
            setTimeout(() => {
                expect(accessDiscussionComponent.isForumEnabled).toBe(false);
                done()
            });
        })
    });
    
    describe('openDiscussionForum', () => {
        it('hould redirect to DF route', (done) => {
            // arrange
            accessDiscussionComponent.fetchForumIdReq = {
                identifier: ['some_id'],
                type: 'group'
            }
            accessDiscussionComponent.createUserReq = {
                username: 'some_username',
                identifier: 'some_identifier'
            }
            accessDiscussionComponent.forumDetails = {
                cid: 'some_cid'
            }
            const res = {
                result: {
                    userName: 'some_user',
                    userId: {
                        uid: 1
                    }
                }
            }
            mockDiscussionService.createUser = jest.fn(() => of(res) as any);
            // act
            accessDiscussionComponent.openDiscussionForum()
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalledWith(
                    ['/discussion-forum'],
                    {
                        queryParams: {
                            categories: JSON.stringify({result:['some_cid']}),
                            userId: 1
                        }
                    }
                );
                done()
            })
        })
        it('should redirect to DF route', (done) => {
            // arrange
            accessDiscussionComponent.forumDetails = {
                cid: 'some_cid'
            }
            const res = {
                result: {
                    userName: 'some_user',
                    userId: {
                        uid: 1
                    }
                }
            }
            mockDiscussionService.createUser = jest.fn(() => throwError('err') as any);
            // act
            accessDiscussionComponent.openDiscussionForum()
            // assert
            setTimeout(() => {
                expect(mockDiscussionService.createUser).toHaveBeenCalled()
                done()
            })
        });
    })

});
