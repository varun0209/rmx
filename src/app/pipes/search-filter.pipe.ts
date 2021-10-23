import { Pipe, PipeTransform } from '@angular/core';
import { Receivegrid } from '../models/receiving/Receipt';
import { AppService } from '../utilities/rlcutl/app.service';
@Pipe({
  name: 'searchFilter',
  pure: false
})
export class SearchFilterPipe implements PipeTransform {

  constructor(private appService: AppService ) {}
  transform(items: Receivegrid[], filter: Receivegrid): Receivegrid[] {
    if (!items || !filter) {
      return items;
    }
    return items.filter((item: Receivegrid) => this.applyFilter(item, filter));
  }

  applyFilter(receive: Receivegrid, filter: Receivegrid): boolean {
    for (let field in filter) {
      if (filter[field]) {
        if (typeof filter[field] === 'string') {
          if (!this.appService.checkNullOrUndefined(receive[field]) && receive[field] != '') {
            if (receive[field].toString().toLowerCase().indexOf(filter[field].toString().toLowerCase()) === -1) {
              return false;
            }
          } else {
            return false;
          }
        } else if (typeof filter[field] === 'number') {
          if (receive[field] !== filter[field]) {
            return false;
          }
        }
      }
    }
    return true;
  }


}