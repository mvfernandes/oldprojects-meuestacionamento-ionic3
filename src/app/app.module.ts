import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { AdMobFree } from '@ionic-native/admob-free';
import { HttpModule } from '@angular/http';

import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { DatePipe } from '@angular/common';
import { PatioProvider } from '../providers/patio/patio';
import { StateProvider } from '../providers/state/state';
import { AdmobProvider } from '../providers/admob/admob';

@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicStorageModule.forRoot({
      name: 'com.stfy.parkmanager',
      driverOrder: [
        'sqlite',
        'indexeddb',
        'websql',
      ]
    }),
    IonicModule.forRoot(MyApp, {
      modalEnter: 'modal-slide-in',
      modalLeave: 'modal-slide-out',
      pageTransition: 'ios-transition',
      menuType: 'push',
    }),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    DatePipe,
    PatioProvider,
    StateProvider,
    AdmobProvider,
    AdMobFree,
  ]
})
export class AppModule { }
