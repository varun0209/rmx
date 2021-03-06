import { Directive, Input, ElementRef } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';

@Directive({
  selector: '[appMatTableAutoScroll]'
})
export class MatTableAutoScrollDirective {

  @Input('appMatTableAutoScroll') actualContainer: string;
  originalElement: ElementRef<HTMLElement>;

  constructor(cdkDrag: CdkDrag) {
    cdkDrag._dragRef.beforeStarted.subscribe( () => {
      var cdkDropList = cdkDrag.dropContainer;
      if (!this.originalElement) {
        this.originalElement = cdkDropList.element;
      }

      if ( this.actualContainer ) {
        const element = this.originalElement.nativeElement.closest(this.actualContainer) as HTMLElement;
        cdkDropList._dropListRef.element = element;
        cdkDropList.element = new ElementRef<HTMLElement>(element);
      } else {
        cdkDropList._dropListRef.element = cdkDropList.element.nativeElement;
        cdkDropList.element = this.originalElement;
      }
    });
  }

}
