import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AdmobProvider } from '../providers/admob/admob';
import { StateProvider } from '../providers/state/state';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = 'HomePage';

  pages: Array<{ title: string, component: any, ico: string }>;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public admob: AdmobProvider,
    public toast: ToastController,
    public state: StateProvider,
  ) {
    this.initializeApp();

    this.pages = [
      { title: 'Ajustes', component: 'ConfigPage', ico: 'settings' },
    ];

  }

  initializeApp() {
    this.platform.ready().then(async () => {

      if (this.platform.is('cordova')) {


        this.statusBar.styleLightContent();
        this.statusBar.backgroundColorByHexString('#488aff');
        this.splashScreen.hide();

        await this.admob.runBanner();
      }
    });
  }

  openPage(page) {
    this.nav.push(page.component);
  }

  fechar() {
    this.state.fecharApp();
  }
}
