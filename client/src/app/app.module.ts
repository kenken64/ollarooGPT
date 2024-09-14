import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BottomSheetOverviewSendMsgSheet, ChatComponent } from './chat/chat.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AlignSendButtonPipe } from './shared/alignsend.btn.pipe';
import { AlignUploadButtonPipe } from './shared/alignupload.btn.pipe';
import { AlignSendMusicButtonPipe } from './shared/alignsendMusic.btn.pipe';
import { AlignLogoutButtonPipe } from './shared/alignlogout.btn.pipe';
import { LoginComponent } from './security/login/login.component';
import { OrderByPipe } from './shared/orderby.pipe';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';

@NgModule({ declarations: [
        AppComponent,
        ChatComponent,
        LoginComponent,
        BottomSheetOverviewSendMsgSheet,
        AlignSendButtonPipe,
        AlignUploadButtonPipe,
        AlignSendMusicButtonPipe,
        AlignLogoutButtonPipe,
        OrderByPipe,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatSidenavModule,
        MatListModule,
        MatButtonModule,
        MatCardModule,
        MatGridListModule,
        FormsModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatBottomSheetModule,
        MatTooltipModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }
