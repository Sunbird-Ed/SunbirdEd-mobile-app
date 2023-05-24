import { AnimationBuilder, createAnimation } from '@ionic/core';

export const animationShrinkOutTopRight: AnimationBuilder = (baseEl: HTMLElement) => {

    const baseAnimation = createAnimation();

    const backdropAnimation = createAnimation();
    backdropAnimation.addElement(baseEl.shadowRoot.querySelector('ion-backdrop'));

    const wrapperAnimation = createAnimation();
    const wrapperEl = baseEl.shadowRoot.querySelector('.popover-wrapper');
    wrapperAnimation.addElement(wrapperEl);

    wrapperAnimation
        .beforeStyles({
            'transform-origin': 'right top'
        })
        .fromTo('transform', 'scaleX(1) scaleY(1)', 'scaleX(0.1) scaleY(0.1)')
        .fromTo('opacity', 1, 0);

    backdropAnimation.fromTo('opacity', 0.4, 0.0);

    return baseAnimation
        .addElement(baseEl)
        .easing('cubic-bezier(0.36,0.66,0.04,1)')
        .duration(800)
        .addAnimation(backdropAnimation)
        .addAnimation(wrapperAnimation);

}