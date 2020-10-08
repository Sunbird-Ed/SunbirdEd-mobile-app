import {Inject, Pipe, PipeTransform} from '@angular/core';
import {FormRequest, FormService} from 'sunbird-sdk';

@Pipe({
    name: 'aliased',
    pure: true
})
export class AliasBoardName implements PipeTransform {
    private static cachedAliases: { name: string, code: string, alias: string }[];
    constructor(
        @Inject('FORM_SERVICE') private formService: FormService,
    ) {
        if (AliasBoardName.cachedAliases) {
            return;
        }
        const formRequest: FormRequest = {
            type: 'config',
            subType: 'boardAlias',
            action: 'get',
            component: 'app'
        };
        this.formService.getForm(formRequest).toPromise().then((r) => {
            AliasBoardName.cachedAliases = r.form.data.fields;
        });
    }
    transform(val: string): string {
        if (!AliasBoardName.cachedAliases) {
            return val;
        }
        const alias = AliasBoardName.cachedAliases.find(a => a.name === val);
        if (alias) {
            return alias.alias;
        }
        return val;
    }
}
