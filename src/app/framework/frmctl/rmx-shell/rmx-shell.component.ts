import { MasterPageService } from './../../../utilities/rlcutl/master-page.service';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { BreakpointObserver } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

export interface XpoShellRoute {
  AppEnabled: boolean;
  Category: string;
  HasSubMenu: boolean;
  IsExpandable: boolean;
  Module: string;
  OperationId: string;
  ParentName: string;
  Rank: number;
  RouterLink: string;
  SubMenu: XpoShellRoute[];
  Title: string;
}

@Directive({
  selector: 'rmx-shell-sidebar-actions',
  host: { class: 'rmx-Shell-sidebar-actions' },
})
export class RmxShellSidebarActions { }

@Directive({
  selector: 'rmx-shell-ribbon',
  host: { class: 'rmx-Shell-ribbon' },
})
export class RmxShellRibbon { }

@Component({
  selector: 'rmx-shell',
  templateUrl: './rmx-shell.component.html',
  styleUrls: ['./rmx-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'rmx-Shell' },
})
export class RmxShellComponent implements OnInit, OnDestroy {

  

  /** Whether or not we're in tablet mode or not */
  isTablet = false;

  /** Observable Cleanup */
  private destroyed$ = new Subject<void>();

  /** The routes for the application */
  @Input()
  get routes(): XpoShellRoute[] {
    return this.routesValue;
  }
  set routes(value: XpoShellRoute[]) {
    this.routesValue = value;
    // When routes are received, open drawer if the its not set to drawerClosedByDefault
    if (!this.drawerClosedByDefault) {
      this.isDrawerOpen = !this.isTablet && this.hasRoutes;
    }
  }
  private routesValue: XpoShellRoute[] = [];
  /**
   * Whether or not to remove the padding that is placed on the tab drawer content.
   * This is set to true if your app is going to use the xpo-view component as a wrapper around all of your views
   */
  // @HostBinding('class.xpo-Shell--withoutContentPadding')
  // @Input()
  // get withoutContentPadding(): boolean {
  //   return this.withoutContentPaddingValue;
  // }
  // set withoutContentPadding(value: boolean) {
  //   this.withoutContentPaddingValue = coerceBooleanProperty(value);
  // }
  // private withoutContentPaddingValue = false;
  
  /** Whether or not the sidebar should be closed by default */
  @Input()
  get drawerClosedByDefault(): boolean {
    return this.drawerClosedByDefaultValue;
  }
  set drawerClosedByDefault(value: boolean) {
    this.drawerClosedByDefaultValue = coerceBooleanProperty(value);
    if (this.drawerClosedByDefaultValue) {
      this.isDrawerOpen = false;
    }
  }
  private drawerClosedByDefaultValue = false;

  /** The version number of the application */
  @Input()
  get versionNumber(): string {
    return this.versionNumberValue;
  }
  set versionNumber(value: string) {
    this.versionNumberValue = value;
  }
  private versionNumberValue: string;

  /** Whether or not the drawer is open */
  @Input()
  get isDrawerOpen(): boolean {
    return this.isDrawerOpenValue;
  }
  set isDrawerOpen(value: boolean) {
    const v = coerceBooleanProperty(value);
    if (v !== this.isDrawerOpenValue) {
      this.isDrawerOpenValue = v;
      this.isDrawerOpenChange.emit(v);
    }
  }
  private isDrawerOpenValue = true;

  @Output()
  isDrawerOpenChange = new EventEmitter<boolean>();

  /** The path to the logo (assets/foo/logo.png) */
  @Input()
  logoPath: string;

  /** The width of the logo. Defaults to 126px */
  @Input()
  logoWidth: string = '126px';

  @Input()
  environment: string;

  get hasRoutes(): boolean {
    return !!this.routes && !!this.routes.length;
  }

  constructor(
    private breakpointObserver: BreakpointObserver,
    private changeDetectionRef: ChangeDetectorRef,
    public masterPageService: MasterPageService,
    private router: Router,
    private eRef: ElementRef
  ) { }

  ngOnInit(): void {
    this.subscribeToBreakpointChanges();
    this.subscribeToNavigationEndChanges();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  /** When a link is clicked when in tablet mode, close the drawer */
  handleLinkClick(item): void {
    // if (this.isTablet) {
    //   this.isDrawerOpen = false;
    // }
    this.isDrawerOpen = false;
    this.masterPageService.routeCategory = item.Category;
    // if (item.Module === 'BAX') {
    //   window.open(item.RouterLink, '_blank');
    // } else {
    //   // this.resetCaretRotation();
    //   this.router.navigate([item.RouterLink]);
    // }
  }

  // mainMenu(item) {
  //   if (item.Module === 'BAX') {
  //     window.open(item.RouterLink, '_blank');
  //   } else {
  //     // this.resetCaretRotation();
  //     this.router.navigate([item.RouterLink]);
  //   }
  // }

  /** Open the drawer if the drawer is closed and if there is routes available */
  onMenuClick(): void {
    this.isDrawerOpen = this.hasRoutes && !this.isDrawerOpen;
  }

  private subscribeToBreakpointChanges(): void {
    // If viewport is less than a tablet, hide the drawer on default
    this.breakpointObserver
      .observe('(max-width: 1024px)') // FIXME: width width width
      .pipe(takeUntil(this.destroyed$))
      .subscribe((result) => {
        this.isTablet = result.matches;
        /**
         * Open drawer when the view is not the size of a tablet, there is
         * routes available, and if the shell is not set to have the
         * menu closed on default
         */
        this.isDrawerOpen = !this.isTablet && this.hasRoutes && !this.drawerClosedByDefault;
        this.changeDetectionRef.markForCheck();
      });
  }

  /**
   * Since some routes are lazy loaded, `routerLinkActive` does
   * not get updated to make the link look active, Need to manually
   * trigger change detection when a navigation end event triggers.
   * https://github.com/angular/angular/issues/19934
   */
  private subscribeToNavigationEndChanges(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => this.changeDetectionRef.markForCheck());
  }



  // navigatetoPage(routeLink, item) {
  //   // this.resetcaret();
  //   this.masterPageService.routeCategory = item.Category;
  //   this.router.navigate([routeLink]);
  // }

  // resetcaret() {
  //   if (!checkNullOrUndefined(this.appService.menu)) {
  //     this.appService.menu.forEach(element => {
  //       element.isExpandable = false;
  //     });
  //   }
  // }

  imageErrorHandler(item, event) {
    event.target.src =  `assets/images/navbaricons/${item}.png`;
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (!this.eRef.nativeElement.contains(event.target)) {  
      this.isDrawerOpen = false;
    }
  }
}
