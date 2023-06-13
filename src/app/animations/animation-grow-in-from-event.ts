import { createAnimation } from '@ionic/core';

export const animationGrowInFromEvent = (event) => {
    return (baseEl: HTMLElement) => {
        const baseAnimation = createAnimation();

        const backdropAnimation = createAnimation();
        backdropAnimation.addElement(baseEl.shadowRoot.querySelector('ion-backdrop'));

        const wrapperAnimation = createAnimation();
        wrapperAnimation.addElement(baseEl.shadowRoot.querySelector('.popover-wrapper'));

        const transformOrigin = `${event.target.getBoundingClientRect().left + (event.target.getBoundingClientRect().width / 2)}px ${event.target.getBoundingClientRect().top + (event.target.getBoundingClientRect().height / 2)}px`;

        wrapperAnimation
            .beforeStyles({
                'transform-origin': transformOrigin
            })
            .fromTo('transform', 'scaleX(0.1) scaleY(0.1)', 'translateX(0%) scaleX(1) scaleY(1)')
            .fromTo('opacity', 0, 1);

        backdropAnimation.fromTo('opacity', 0.01, 0.4);

        return baseAnimation
            .addElement(baseEl)
            .easing('cubic-bezier(0.36,0.66,0.04,1)')
            .duration(800)
            .beforeAddClass('tutorial-popover')
            .addAnimation(backdropAnimation)
            .addAnimation(wrapperAnimation);
    };
};
