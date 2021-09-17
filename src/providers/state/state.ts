import { Injectable } from '@angular/core';
import { AlertController, Platform } from 'ionic-angular';

@Injectable()
export class StateProvider {

  public contador = 0;

  constructor(
    public alertCtrl: AlertController,
    public platform: Platform,
  ) { }

  fecharApp() {
    this.alertCtrl.create({
      enableBackdropDismiss: false,
      title: "Fechar Aplicativo?",
      buttons: [
        {
          text: 'Cancelar',
          cssClass: 'text-danger'
        },
        {
          text: 'Sim',
          handler: () => {
            this.platform.exitApp();
          }
        }
      ]
    }).present()
  }

}
