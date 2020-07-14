import {Animation} from '@ionic/core';

export const animationGrowInFromEvent = (event) => {
    return function animationGrowInTopRight(AnimationC: Animation, baseEl: HTMLElement): Promise<Animation> {

        const baseAnimation = new AnimationC();

        const backdropAnimation = new AnimationC();
        backdropAnimation.addElement(baseEl.querySelector('ion-backdrop'));

        const wrapperAnimation = new AnimationC();
        wrapperAnimation.addElement(baseEl.querySelector('.popover-wrapper'));

        const transformOrigin = `${event.target.getBoundingClientRect().left + (event.target.getBoundingClientRect().width / 2)}px ${event.target.getBoundingClientRect().top + (event.target.getBoundingClientRect().height / 2)}px`;

        wrapperAnimation
            .fromTo('transform', 'scaleX(0.1) scaleY(0.1)', 'translateX(0%) scaleX(1) scaleY(1)')
            .fromTo('transform-origin', transformOrigin, transformOrigin)
            .fromTo('opacity', 0, 1);

        backdropAnimation.fromTo('opacity', 0.01, 0.4);

        return Promise.resolve(baseAnimation
            .addElement(baseEl)
            .easing('cubic-bezier(0.36,0.66,0.04,1)')
            .duration(800)
            .beforeAddClass('tutorial-popover')
            .add(backdropAnimation)
            .add(wrapperAnimation));
    };
};
