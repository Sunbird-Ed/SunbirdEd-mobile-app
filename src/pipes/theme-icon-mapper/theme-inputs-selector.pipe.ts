import {Pipe, PipeTransform} from '@angular/core';

interface Theme {
    component: string;
    inputs?: {
        [attribute: string]: any;
    };
    inputsMap?: {
        [attribute: string]: {
            [matcher: string]: any;
        } | undefined
    };
    children?: {
        [component: string]: {
            inputs?: {
                [attribute: string]: any;
            };
            inputsMap?: {
                [attribute: string]: {
                    [matcher: string]: any;
                } | undefined
            }
        }
    };
}

@Pipe({
    name: 'themeInputsSelector',
    pure: true
})
export class ThemeInputsSelectorPipe implements PipeTransform {
    transform(arg: {component: string, input: string}, theme?: Theme, matcher?: string): any {
        if (matcher) {
            matcher = matcher.toLowerCase().trim().replace(/\s/g, "");
        }
        const {component, input} = arg;

        if (!theme) {
            return undefined;
        }

        if (theme.component === component) {
            if (
                matcher &&
                theme.inputsMap &&
                theme.inputsMap[input] &&
                theme.inputsMap[input][matcher]
            ) {
                return theme.inputsMap[input][matcher];
            }

            if (theme.inputs && theme.inputs[input]) {
                return theme.inputs[input];
            }
        }

        if (theme.children && theme.children[component]) {
            if (
                matcher &&
                theme.children[component].inputsMap &&
                theme.children[component].inputsMap[input] &&
                theme.children[component].inputsMap[input][matcher]
            ) {
                return theme.children[component].inputsMap[input][matcher];
            }

            if (theme.children[component].inputs && theme.children[component].inputs[input]) {
                return theme.children[component].inputs[input];
            }
        }

        return undefined;
    }
}
