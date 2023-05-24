import {Pipe, PipeTransform} from '@angular/core';
import {FormAndFrameworkUtilService} from '../../services/formandframeworkutil.service';

@Pipe({
    name: 'aliased',
    pure: true
})
export class AliasBoardName implements PipeTransform {
    private static cachedAliases: { name: string, code: string, alias: string }[];
    constructor(
        private formAndFrameworkUtilService: FormAndFrameworkUtilService
    ) {
        if (AliasBoardName.cachedAliases) {
            return;
        }
        this.formAndFrameworkUtilService.getBoardAliasName().then((fields) => {
            AliasBoardName.cachedAliases = fields;
        }).catch(err => console.error(err));
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
