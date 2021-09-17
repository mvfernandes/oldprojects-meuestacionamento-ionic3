import { Component, ViewChild } from '@angular/core';
import {
  IonicPage, NavController,
  NavParams, MenuController, Content,
  AlertController, LoadingController, ToastController,
} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { DatePipe } from '@angular/common';

import { StateProvider } from '../../providers/state/state';
import { PatioProvider } from '../../providers/patio/patio';
import { AdmobProvider } from '../../providers/admob/admob';

@IonicPage()
@Component({
  selector: 'page-config',
  templateUrl: 'config.html',
})
export class ConfigPage {
  @ViewChild(Content) content: Content;

  public categorias: any = [];
  public quantidade_vagas: any = 0;
  public patio_current: any = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public state: StateProvider,
    public menu: MenuController,
    public alertCtrl: AlertController,
    public patio: PatioProvider,
    public store: Storage,
    public datepipe: DatePipe,
    public loadingCtrl: LoadingController,
    public toast: ToastController,
    public admob: AdmobProvider,
  ) { }

  async reloadScreen() {
    const loader = this.loadingCtrl.create({
      content: "Carregando dados...",
    });
    loader.present();

    setTimeout(() => {
      (async () => {
        this.categorias = await this.patio.getCategoriasVeiculos();
        this.quantidade_vagas = await this.patio.getQuantidadeVagas();
        this.patio_current = await this.store.get('patio') || [];

        loader.dismiss();
      })();
    }, 750);
  }

  estaNoPatio(tipo) {
    return this.patio_current.find(item => item.tipo === tipo);
  }

  ionViewWillLeave() {
    this.menu.enable(true);
    this.admob.showCounterToAds();
  }

  async ionViewDidLoad() {
    this.menu.enable(false);
    await this.reloadScreen();
  }

  newCategorie() {
    this.categorias = [
      ...this.categorias,
      {
        tipo: "",
        valor: "",
        modo_pagamento: 'saida',
        tolerancia: 0
      }
    ];
    setTimeout(() => {
      this.content.scrollToBottom();
    }, 300);
  }

  removeItem(index) {
    this.categorias = this.categorias.filter((item, i) => i !== index);
  }

  salvarAlteracoes() {
    const vagas = parseInt(this.quantidade_vagas);

    const validos = this.categorias.filter(valido => valido.tipo && valido.valor)
      .map((item, index, array) => {
        return {
          ...item,
          valor: parseFloat(item.valor).toFixed(2),
          tolerancia: !item.tolerancia ? 0 : parseInt(item.tolerancia),
        }
      });

    const lista_valida_str = validos.reduce((str, item, index, array) => {
      const virgula = array.length - 1 > index ? ", " : "";
      return str + item.tipo + virgula;
    }, "");

    this.alertCtrl.create({
      enableBackdropDismiss: false,
      title: 'Salvar alterações?',
      subTitle: `Quantidade de vagas: ${vagas}, Categorias: ${lista_valida_str}`,
      message: 'Os campos com categoria/tipo ou valor em branco serão desconsiderados, verifique se está incluindo categorias duplicadas, isso pode te atrapalhar nas operações',
      buttons: [
        {
          text: 'Cancelar',
          cssClass: 'color-danger',
        },
        {
          text: 'Confirmar',
          cssClass: '',
          handler: () => {
            const loader = this.loadingCtrl.create({
              content: "Um momento...",
            });
            loader.present();

            setTimeout(() => {
              (async () => {
                await this.patio.setQuantidadeVagas(vagas);
                await this.patio.setCategoriasVeiculos(validos);
                await this.reloadScreen();
                loader.dismiss();
              })();
            }, 1000);
          }
        }
      ]
    }).present();
  }

}
