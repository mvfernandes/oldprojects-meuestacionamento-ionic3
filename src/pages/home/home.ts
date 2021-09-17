import { Component } from '@angular/core';
import { NavController, AlertController, IonicPage, ToastController } from 'ionic-angular';
import { PatioProvider } from '../../providers/patio/patio';
import { StateProvider } from '../../providers/state/state';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(
    public navCtrl: NavController,
    public alert: AlertController,
    public patio: PatioProvider,
    public state: StateProvider,
    public store: Storage,
    public toast: ToastController,

  ) { }


  showaAlerta(title = "", subTitle = "") {
    this.alert.create({
      title,
      subTitle,
      buttons: ['Ok']
    }).present();
  }

  public infoApp() {
    this.showaAlerta(
      "Meu Estacionamento v1",
      ""
    );
  }

  async pushPagePlaca(type) {
    const veiculos_no_patio = await this.store.get('patio') || [];
    if (type === 'saida') {
      if (!veiculos_no_patio.length) {
        this.showaAlerta("Nenhum veículo no pátio");
        return;
      }
    }
    if (type === 'entrada') {
      const vagas = await this.patio.getQuantidadeVagas();

      if (veiculos_no_patio.length >= vagas) {
        this.showaAlerta("Vagas esgotadas", "Para aumentar a quantidade de vagas acesse menu > ajustes");
        return;
      }
    }
    this.navCtrl.push('RegistraPlacaPage', { type });
  }

  async toRelatorioPage() {
    const relatorio = await this.store.get('relatorio_hoje') || [];
    const caixas_fechados = await this.store.get('caixas_fechados') || [];

    if (!relatorio.length && !caixas_fechados.length) {
      this.showaAlerta("Nenhuma movimentação");
      return;
    }

    this.navCtrl.push('RelatorioPage')
  }
}
