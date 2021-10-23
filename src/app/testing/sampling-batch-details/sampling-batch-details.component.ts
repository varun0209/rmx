import { Component, OnInit, OnChanges } from '@angular/core';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';

@Component({
    selector: 'sampling-batch-details',
    templateUrl: './sampling-batch-details.component.html',
    styleUrls: ['./sampling-batch-details.component.css']
})
export class SamplingBatchDetailsComponent implements OnInit, OnChanges {

    constructor(
        public masterPageService: MasterPageService

    ) { }

    ngOnInit() {
    }

    ngOnChanges() {
    }

}
