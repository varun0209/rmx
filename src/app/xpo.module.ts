import { NgModule } from '@angular/core';
import { XpoAutofocusModule } from '@xpo/ngx-core/autofocus';
import { XpoButtonModule } from '@xpo/ngx-core/button';
import { XpoCardModule } from '@xpo/ngx-core/card';
import { XpoChipsModule } from '@xpo/ngx-core/chips';
import { XpoClockModule } from '@xpo/ngx-core/clock';
import { XpoConfirmDialogModule } from '@xpo/ngx-core/confirm-dialog';
import { XpoContextualHeaderModule } from '@xpo/ngx-core/contextual-header';
import { XpoDialogModule } from '@xpo/ngx-core/dialog';
import { XpoDownloadButtonModule } from '@xpo/ngx-core/download-button';
import { XpoEmptyStateModule } from '@xpo/ngx-core/empty-state';
import { XpoFeedbackModule } from '@xpo/ngx-core/feedback';
import { XpoIconModule } from '@xpo/ngx-core/icon';
import { XpoInlineSearchModule } from '@xpo/ngx-core/inline-search';
import { XpoMessagingPopoverModule } from '@xpo/ngx-core/messaging-popover';
import { XpoPopoverModule } from '@xpo/ngx-core/popover';
import { XpoRangeSliderModule } from '@xpo/ngx-core/range-slider';
import { XpoShellModule } from '@xpo/ngx-core/shell';
import { XpoSnackBarModule } from '@xpo/ngx-core/snack-bar';
import { XpoStatusIndicatorModule } from '@xpo/ngx-core/status-indicator';
import { XpoStepperModule } from '@xpo/ngx-core/stepper';
import { XpoTabDrawerModule } from '@xpo/ngx-core/tab-drawer';
import { XpoTabsModule } from '@xpo/ngx-core/tabs';
import { XpoUploadModule } from '@xpo/ngx-core/upload';
import { XpoViewModule } from '@xpo/ngx-core/view';

@NgModule({
  imports: [
    XpoViewModule,
    XpoShellModule,
    XpoButtonModule,
    XpoCardModule,
    XpoChipsModule,
    XpoClockModule,
    XpoContextualHeaderModule,
    XpoDialogModule,
    XpoConfirmDialogModule,
    XpoDownloadButtonModule,
    XpoEmptyStateModule,
    XpoFeedbackModule,
    XpoInlineSearchModule,
    XpoMessagingPopoverModule,
    XpoPopoverModule,
    XpoRangeSliderModule,
    XpoSnackBarModule,
    XpoStatusIndicatorModule,
    XpoStepperModule,
    XpoTabsModule,
    XpoUploadModule,
    XpoAutofocusModule,
    XpoIconModule,
    // XpoAppSwitcherPopoverModule,
    XpoTabDrawerModule
  ],
  exports: [
    XpoShellModule,
    XpoButtonModule,
    XpoCardModule,
    XpoChipsModule,
    XpoContextualHeaderModule,
    XpoClockModule,
    XpoDialogModule,
    XpoConfirmDialogModule,
    XpoDownloadButtonModule,
    XpoEmptyStateModule,
    XpoFeedbackModule,
    XpoInlineSearchModule,
    XpoMessagingPopoverModule,
    XpoPopoverModule,
    XpoRangeSliderModule,
    XpoSnackBarModule,
    XpoStatusIndicatorModule,
    XpoStepperModule,
    XpoTabsModule,
    XpoUploadModule,
    XpoAutofocusModule,
    XpoIconModule,
    // XpoAppSwitcherPopoverModule,
    XpoTabDrawerModule
  ]

})

export class XpoModule { }
