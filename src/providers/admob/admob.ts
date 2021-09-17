import { Injectable } from '@angular/core';
import {
  AdMobFree,
  AdMobFreeBannerConfig,
  AdMobFreeInterstitialConfig
} from '@ionic-native/admob-free';
import { Platform, Events, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import { DatePipe } from '@angular/common';

@Injectable()
export class AdmobProvider {
  private API_URL = 'http://galva.ga/propaganda.php?admob=18';

  public banner = "ca-app-pub-6930029783909088/2476552585";
  public inter = "ca-app-pub-6930029783909088/8008080868";

  public admob_api: any = {
    banner: "",
    inter: "",
    roda_banner: true,
    roda_inter: true,
  };
  public hoje: any;
  public admobTest = false;
  public sair = false;

  constructor(
    private admobFree: AdMobFree,
    public platform: Platform,
    public event: Events,
    public toast: ToastController,
    public store: Storage,
    public http: Http,
    public datepipe: DatePipe,
  ) {
    document.addEventListener('admob.interstitial.events.CLOSE', () => {
      // this.platform.registerBackButtonAction(() => {});
    });
    this.hoje = this.datepipe.transform(new Date(), 'dd-MM-y');
  }

  async runBanner() {
    const admob_api = await this.getApiAdmob();

    if (admob_api) {

      this.admob_api = admob_api;
      this.configInter();

      if (this.admob_api.banner && this.admob_api.roda_banner) {

        const bannerConfig: AdMobFreeBannerConfig = {
          id: this.admob_api.banner,
          isTesting: this.admobTest,
          autoShow: true
        };

        this.admobFree.banner.config(bannerConfig);

        this.admobFree.banner.prepare();

      }
    }
  }


  configInter() {
    if (this.admob_api.inter) {
      const interConfig: AdMobFreeInterstitialConfig = {
        id: this.admob_api.inter,
        isTesting: this.admobTest,
      };
      this.admobFree.interstitial.config(interConfig);
    }
  }

  runInter(sair: Boolean = false) {
    if (!this.admob_api.inter || !this.admob_api.roda_inter) return;
    this.admobFree.interstitial.prepare()
      .then((s) => {
        if (sair) {
          this.sair = true
        }
      })
      .catch(e => {
        if (sair) {
          this.platform.exitApp();
        }
      });
  }

  async showCounterToAds() {
    if ((!this.admob_api.inter || !this.admob_api.roda_inter)) return;
    this.toast.create({
      message: 'Talvez um anúncio será exibido em alguns segundos',
      duration: 4000,
      position: 'bottom'
    }).present();
    await this.runInter();
  }


  async getApiAdmob() {

    const ads_today = "admob_hoje";
    const bkp = "bkp_admob";
    const hoje = await this.store.get(ads_today);
    if (hoje) {
      if (hoje.current && (hoje.current === this.hoje) && hoje.data) {
        return hoje.data;
      }
    }
    return new Promise((resolve, reject) => {
      this.http.get(this.API_URL)
        .subscribe(async (result: any) => {
          const data = result.json();
          if (data) {
            this.store.set(bkp, data);
            this.store.set(ads_today, { current: this.hoje, data });
            return resolve(data);
          } else {
            const alternativa = await this.store.get(bkp);
            this.store.set(ads_today, { current: this.hoje, data: alternativa });
            if (alternativa) {
              return resolve(alternativa);
            } else {
              return resolve(false);
            }
          }
        }, (error) => {
          reject(false);
        });
    });
  }


}
