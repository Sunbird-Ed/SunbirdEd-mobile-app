/* import { Component, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReadMoreDirective } from './read-more';
import { By } from '@angular/platform-browser';


@Component({
    template: `<p readMore [length]="10" [showMoreText]="'READ_MORE'" [showLessText]="'READ_LESS'">test here test here test here</p>`
})

class TestReadMoreComponent {
}

describe('Directive: ReadMore', () => {
    let component: TestReadMoreComponent;
    let fixture: ComponentFixture<TestReadMoreComponent>;
    let inputEl: DebugElement;
    let expectedLength: number;
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ReadMoreDirective, TestReadMoreComponent]
        });
        fixture = TestBed.createComponent(TestReadMoreComponent);
        component = fixture.componentInstance;
        inputEl = fixture.debugElement.query(By.css('p'));

        // mock the hero supplied by the parent component
        expectedLength = 10;

        // simulate the parent setting the input property with that hero
        component['maxLength'] = expectedLength;

        // trigger initial data binding
        fixture.detectChanges();
    });

    xit('should raise selected event when clicked', () => {
        //inputEl.triggerEventHandler('click', null);
        console.log("inputEl", inputEl);
        const readMoreElement: HTMLElement = fixture.nativeElement;
        const p = readMoreElement.querySelector('p');
        console.log("readMoreElement", p.innerHTML);
        expect(true).toBe(true);
        expect(p.textContent).toContain('READ_LESS');
    });
}); */
