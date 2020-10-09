import {Inject, Pipe, PipeTransform} from '@angular/core';
import {FormService} from 'sunbird-sdk';
import {FormAndFrameworkUtilService} from '@app/services';

@Pipe({
    name: 'aliased',
    pure: true
})
export class AliasBoardName implements PipeTransform {
    private static cachedAliases: { name: string, code: string, alias: string }[];
    constructor(
        @Inject('FORM_SERVICE') private formService: FormService,
        private formAndFrameworkUtilService: FormAndFrameworkUtilService
    ) {
        if (AliasBoardName.cachedAliases) {
            return;
        }
        this.formAndFrameworkUtilService.getBoardAliasName().then((fields) => {
            AliasBoardName.cachedAliases = fields;
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
