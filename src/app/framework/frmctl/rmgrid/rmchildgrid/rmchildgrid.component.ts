import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { RmgridmodalComponent } from '../rmgridmodal/rmgridmodal.component';
import { RmgridService } from '../rmgrid.service';

@Component({
  selector: 'rmchildgrid',
  templateUrl: './rmchildgrid.component.html',
  styleUrls: ['./rmchildgrid.component.css']
})
export class RmchildgridComponent implements OnInit, OnChanges {
  varchildelements: any[];
  childcolumns: any[] = [];
  childcolumnwidth: number;
  @Output() childelementsChange: EventEmitter<any>;
  @Input() isGridRearranged = false;
  @Output() emitChildEditDetails = new EventEmitter();
  @Output() emitChildRowDetails = new EventEmitter();
  @Input()
  get childelements() {
    return this.varchildelements;
  };
  set childelements(value) {
    this.varchildelements = value;
    this.childelementsChange.emit(this.varchildelements);
    if (this.varchildelements.length > 0) {
      this.childcolumns = [];
      for (let column in this.varchildelements[0]) {
        let col = {
          name: column
          // width: column.length
        };
        this.childcolumns.push(col);
      }
    }
  }
  @Input() showPopOver;
  @Input() Isshowchild: boolean;
  @Input() editvisible: boolean;
  @Input() editHighlight: boolean = true;
  @Input() deletevisible: boolean;
  //highlight Mode Properties
  @Input() selectedChild;
  @Input() parentEditMode: boolean =false;

  constructor( public rmgridService: RmgridService) {
    this.childelementsChange = new EventEmitter();
  }

  ngOnInit(){  }

  ngOnChanges() {
      //highlight Mode Changes
    if(this.parentEditMode){
      this.selectedChild = {};
    }
  }

  editrow(rowtoedit,i) {
    // const initialState = {
    //   rowcolumns: this.childcolumns,
    //   rowtoedit: rowtoedit,
    //   title: 'EDIT DETAILS'
    // };
    // this.bsModalRef = this.modalService.show(RmgridmodalComponent, { initialState });
    // this.bsModalRef.content.submitBtnName = 'Save';
       rowtoedit.Index=i;
       this.emitChildEditDetails.emit(rowtoedit);
      //highlight Mode Changes
       this.selectedChild = rowtoedit;
       this.parentEditMode = false;
  }
  deleterow(i) {
    this.varchildelements.splice(i, 1);
  }
  childRowView(element){
    this.emitChildRowDetails.emit(element);
  }
}
