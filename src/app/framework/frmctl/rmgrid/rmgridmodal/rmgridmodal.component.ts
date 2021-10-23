import { Component, OnInit } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";

@Component({
    selector: 'modal-content',
    templateUrl: './rmgridmodal.component.html'
})

export class RmgridmodalComponent implements OnInit {
    title: string;
    submitBtnName: string;
    rowcolumns: any[] = [];
    rowtoedit: any = {};

    constructor(public bsModalRef: BsModalRef) { }

    ngOnInit() {
        
    }
}