import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, AlertController, Platform, Keyboard } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { DatePipe } from '@angular/common';

@IonicPage()
@Component({
  selector: 'page-relatorio',
  templateUrl: 'relatorio.html',
})
export class RelatorioPage {
  searchIsOpen = false;

  public footerClosed = false;

  public relatorios_hoje: any = [];
  public caixas_fechados: any = [];

  public array_render: any = [];
  public list_relatorio: any = [];

  public data_selecionada: any;

  public total_arrecadado = 0;

  public isCaixaAberto = true;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public store: Storage,
    public datepipe: DatePipe,
    public menu: MenuController,
    public alertCtrl: AlertController,
    public platform: Platform,
    public keyboard: Keyboard,
  ) { }

  async buscarPlaca(event) {
    // const data = await this.store.get('relatorio_hoje') || [];
    // if (!event) {
    //   this.array_render = data;
    // }
    // const e = data.filter(item => item.placa.includes(event.toUpperCase()));
    // this.array_render = e
  }

  tranformData(date = new Date()) {
    return {
      data: this.datepipe.transform(new Date(date), "dd/MM/yy"),
      hora: this.datepipe.transform(new Date(date), "HH:mm:ss")
    };
  }

  ionViewWillLeave() {
    this.menu.enable(true);
  }

  async ionViewDidLoad() {

    this.menu.enable(false);

    this.relatorios_hoje = await this.store.get('relatorio_hoje') || [];

    this.array_render = this.relatorios_hoje;

    this.caixas_fechados = await this.store.get('caixas_fechados') || [];


    if (!this.relatorios_hoje && !this.caixas_fechados) {
      this.menu.enable(true);
      this.alertCtrl.create({
        title: "Nada registrado ainda",
        buttons: ['Ok']
      }).present();
      this.navCtrl.pop();
      return false;
    }

    this.list_relatorio = this.relatorios_hoje;

    this.total_arrecadado = this.relatorios_hoje
      .reduce((item, valor) => item + parseFloat(valor.valor_pago), 0);
  }

  async selectData(e) {
    if (e === 'default') {
      this.array_render = await this.store.get('relatorio_hoje') || [];
      this.total_arrecadado = this.array_render
        .reduce((item, valor) => item + parseFloat(valor.valor_pago), 0);

      console.log(e)
      this.isCaixaAberto = true;
      return;
    }
    this.isCaixaAberto = false;
    this.array_render = e.list;

    console.log(e)
    // this.list_relatorio = (this.array_render.find(item => item.data_key === e)).list;

    this.total_arrecadado = e.list
      .reduce((item, valor) => item + parseFloat(valor.valor_pago), 0);
  }

  async fecharCaixa() {


    if (!this.relatorios_hoje) {
      return;
    }

    const caixas_fechados = await this.store.get('caixas_fechados') || []

    this.alertCtrl.create({
      enableBackdropDismiss: false,
      title: "Confirma fechamento?",
      inputs: [
        {
          name: "operador",
          placeholder: 'Operador (Opcional)'
        }
      ],
      buttons: [
        { text: 'Cancelar', cssClass: 'text-danger' },
        {
          text: 'Fechar',
          handler: (value) => {
            const data_agora = this.tranformData();

            const data_to_save = {
              id: data_agora.data.replace(/\//g, '').concat(data_agora.hora.replace(/:/g, '')),
              operador: value.operador,
              data_fechamento: data_agora.data,
              hora_fechamento: data_agora.hora,
              list: this.relatorios_hoje
            };

            this.caixas_fechados = [...caixas_fechados, data_to_save,]
            this.store.set('caixas_fechados', this.caixas_fechados);

            this.array_render = [];
            this.store.set('relatorio_hoje', []);
          }
        }
      ],
    }).present();

  }

}
