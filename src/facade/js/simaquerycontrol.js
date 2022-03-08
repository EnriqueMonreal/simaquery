/* eslint-disable no-console */

/**
 * @module M/control/SimaQueryControl
 */

import SimaQueryImplControl from 'impl/simaquerycontrol';
import template from 'templates/simaquery';

export default class SimaQueryControl extends M.Control {
  /**
   * @classdesc
   * Main constructor of the class. Creates a PluginControl
   * control
   *
   * @constructor
   * @extends {M.Control}
   * @api stable
   */
  constructor(config) {
    // 1. checks if the implementation can create PluginControl
    if (M.utils.isUndefined(SimaQueryImplControl)) {
      M.exception('La implementación usada no puede crear controles SimaQueryControl');
    }
    // 2. implementation of this control
    const impl = new SimaQueryImplControl();
    super(impl, 'SimaQuery');
    this.config = config;
  }

  /**
   * This function creates the view
   *
   * @public
   * @function
   * @param {M.Map} map to add the control
   * @api stable
   */
  createView(map) {

    return new Promise((success, fail) => {
      const html = M.template.compileSync(template);
      // Añadir código dependiente del DOM
      this.addEvents(html);
      success(html);
    });
  }

  addEvents(html) {

    this.map_.on(M.evt.COMPLETED, () => {

      let cargando = document.createElement('div');
      cargando.innerHTML = '<img src="../../../src/facade/assets/images/loading-6.gif"/><p>Cargando datos</p>';
      cargando.className = 'loading';
      let nodo = document.querySelectorAll('div#mapjs')[0];

      document.body.insertBefore(cargando, nodo);




      document.querySelectorAll('div.m-panel.m-leyenda>div.m-panel-controls')[0].innerHTML = "<div class='leyenda-title'></div><div class='leyenda'><div class='cuadro'></div></div>";

      document.querySelectorAll('div.m-areas>div.m-area.m-top.m-right>div.m-panel.collapsed')[0].addEventListener('click', () => {
        this.map_.getPanels('legend')[0].collapse();
      });
      document.querySelectorAll('div.m-areas>div.m-area.m-top.m-right>div.m-panel.m-leyenda.collapsed')[0].addEventListener('click', () => {
        this.map_.getPanels('panelSimaQuery')[0].collapse();
      });

      this.menuLogic(html);
      this.config.limitesMunicipales.on(M.evt.SELECT_FEATURES, (features) => {
        this.config.munSelect = features[0];

        let municipios = this.map_.getLayers({ name: 'Municipios de Andalucía' })[0].getFeatures();
        for (let i = 0; i < municipios.length; i++) {
          municipios[i].setStyle(this.config.styles.estiloMunicipio);
        }

        features[0].setStyle(this.config.styles.municipioSeleccionado);

        if (this.config.statusServer == true) {
          document.querySelectorAll('div.leyenda-title')[0].innerHTML = features[0].getImpl().getAttribute('nombre') + ' (' + features[0].getImpl().getAttribute('provincia') + ')';
          this.map_.getPanels('legend')[0].open();
          this.map_.getPanels('panelSimaQuery')[0].collapse();

          this.responseData(features[0].getImpl().getAttribute('cod_mun'));

        }
      });

      this.config.limitesProvincia.on(M.evt.HOVER_FEATURES, () => {

        document.querySelectorAll('div.container.m-mapea-container')[0].setAttribute('style', 'cursor: pointer !important;');

      });

      this.config.limitesProvincia.on(M.evt.LEAVE_FEATURES, () => {

        document.querySelectorAll('div.container.m-mapea-container')[0].setAttribute('style', 'cursor: default !important;');

      });

      //Añadimos eventos de funcionalidad a los formularios del menu


      for (let i = 0; i < html.querySelectorAll('form').length; i++) {
        html.querySelectorAll('form')[i].addEventListener('change', (evt) => {
          let units;
          if (evt.target.checked) {
            for (let i = 0; i < this.config.queryList.length; i++) {
              if (this.config.queryList[i][0] == evt.srcElement.id) {
                units = evt.srcElement.value;
                this.queryFunction(this.config.queryList[i][1], true, units);
                //this.responseData(this.config.munSelect.getImpl().getAttribute('cod_mun'));
                // let municipios = this.map_.getLayers({name: 'Municipios de Andalucía'})[0].getFeatures();
                // for(let i =0; i<municipios.length;i++){
                //   municipios[i].setStyle(this.config.styles.estiloMunicipio);
                // }
                // this.map_.getFeatureHandler().unselectFeatures([this.config.munSelect], this.config.limitesMunicipales, {});
              }
            }
          } else {
            for (let i = 0; i < this.config.queryList.length; i++) {
              if (this.config.queryList[i][0] == evt.srcElement.id) {
                units = evt.srcElement.value;
                this.queryFunction(this.config.queryList[i][1], false, units);
                if (this.config.munSelect != '') {
                  this.responseData(this.config.munSelect.getImpl().getAttribute('cod_mun'));
                }
              }
            }



          }
        });

      }

    });

  }

  /**
   * This function is called on the control activation
   *
   * @public
   * @function
   * @api stable
   */
  activate() {
    // calls super to manage de/activation
    super.activate();

  }
  /**
   * This function is called on the control deactivation
   *
   * @public
   * @function
   * @api stable
   */
  deactivate() {
    // calls super to manage de/activation
    super.deactivate();

  }
  /**
   * This function gets activation button
   *
   * @public
   * @function
   * @param {HTML} html of control
   * @api stable
   */
  getActivationButton(html) {
    return html.querySelector('.m-simaquery button');
  }

  /**
   * This function compares controls
   *
   * @public
   * @function
   * @param {M.Control} control to compare
   * @api stable
   */
  equals(control) {
    return control instanceof SimaQueryControl;
  }

  // Add your own functions
  menuLogic(html) {
    const menu_entornoFisico = html.querySelectorAll('h3#title_entornoFisico')[0];
    const menu_demografia = html.querySelectorAll('h3#title_demografia')[0];
    const menu_sociedad = html.querySelectorAll('h3#title_sociedad')[0];
    const menu_economia = html.querySelectorAll('h3#title_economia')[0];
    const menu_trabajo = html.querySelectorAll('h3#title_trabajo')[0];
    const menu_hacienda = html.querySelectorAll('h3#title_hacienda')[0];

    const menu_entornoFisico_territorio = html.querySelectorAll('li#territorio')[0];
    const menu_entornoFisico_medioAmbiente = html.querySelectorAll('li#medioAmbiente')[0];
    const menu_demografia_cifrasPoblacion = html.querySelectorAll('li#cifrasPoblacion')[0];
    const menu_demografia_cifrasPoblacion_poblacion = html.querySelectorAll('li#cifrasPoblacion_poblacion')[0];
    const menu_demografia_cifrasPoblacion_poblacion_padron = html.querySelectorAll('li#cifrasPoblacion_poblacion_padron')[0];
    const menu_demografia_cifrasPoblacion_poblacion_censo = html.querySelectorAll('li#cifrasPoblacion_poblacion_censo')[0];
    const menu_demografia_cifrasPoblacion_poblacion_censoA = html.querySelectorAll('li#cifrasPoblacion_poblacion_censoA')[0];
    const menu_demografia_cifrasPoblacion_hogar = html.querySelectorAll('li#cifrasPoblacion_hogar')[0]
    const menu_demografia_movimientoPoblacion = html.querySelectorAll('li#movimientoPoblacion')[0];
    const menu_demografia_migraciones = html.querySelectorAll('li#migraciones')[0];
    const menu_demografia_indicadoresDemograficos = html.querySelectorAll('li#indicadoresDemograficos')[0];
    const menu_sociedad_enseñanza = html.querySelectorAll('li#enseñanza')[0];
    const menu_sociedad_sanitariosSalud = html.querySelectorAll('li#sanitariosSalud')[0];
    const menu_sociedad_edificiosViviendas = html.querySelectorAll('li#edificiosViviendas')[0];
    const menu_sociedad_elecciones = html.querySelectorAll('li#elecciones')[0];
    const menu_sociedad_culturaTiempoLibre = html.querySelectorAll('li#culturaTiempoLibre')[0];
    const menu_sociedad_serviciosProteccionSocial = html.querySelectorAll('li#serviciosProteccionSocial')[0];
    const menu_sociedad_infraestructurasEquipamientos = html.querySelectorAll('li#infraestructurasEquipamientos')[0];
    const menu_economia_agricultura = html.querySelectorAll('li#agricultura')[0];
    const menu_economia_ganaderia = html.querySelectorAll('li#ganaderia')[0];
    const menu_economia_pesca = html.querySelectorAll('li#pesca')[0];
    const menu_economia_energia = html.querySelectorAll('li#energia')[0];
    const menu_economia_turismo = html.querySelectorAll('li#turismo')[0];
    const menu_economia_construccion = html.querySelectorAll('li#construccion')[0];
    const menu_economia_transporte = html.querySelectorAll('li#transporte')[0];
    const menu_economia_comunicaciones = html.querySelectorAll('li#comunicaciones')[0];
    const menu_economia_inversiones = html.querySelectorAll('li#inversiones')[0];
    const menu_economia_financiero = html.querySelectorAll('li#financiero')[0];
    const menu_economia_empresarial = html.querySelectorAll('li#empresarial')[0];
    const menu_trabajo_trabPoblacion = html.querySelectorAll('li#trabPoblacion')[0];
    const menu_trabajo_trabActividad = html.querySelectorAll('li#trabActividad')[0];
    const menu_trabajo_trabEmpleo = html.querySelectorAll('li#trabEmpleo')[0];
    const menu_trabajo_trabParo = html.querySelectorAll('li#trabParo')[0];
    const menu_trabajo_trabPensiones = html.querySelectorAll('li#trabPensiones')[0];
    const menu_hacienda_cuentas = html.querySelectorAll('li#cuentas')[0];
    const menu_hacienda_estCatastrales = html.querySelectorAll('li#estCatastrales')[0];
    const menu_hacienda_iae = html.querySelectorAll('li#iae')[0];
    const menu_hacienda_irpf = html.querySelectorAll('li#irpf')[0];
    const entornoFisico_territorio_1 = html.querySelectorAll('li#entornoFisico_territorio_1')[0];
    const entornoFisico_territorio_2 = html.querySelectorAll('li#entornoFisico_territorio_2')[0];
    const entornoFisico_territorio_3 = html.querySelectorAll('li#entornoFisico_territorio_3')[0];
    const menu_sociedad_enseñanza_centrosEducativos = html.querySelectorAll('li#sociedad_enseñanza_centrosEducativos')[0];
    const menu_sociedad_enseñanza_centrosEducativos_centrosPublicos = html.querySelectorAll('li#sociedad_enseñanza_centrosEducativos_centrosPublicos')[0];
    const menu_sociedad_enseñanza_centrosEducativos_centrosPrivados = html.querySelectorAll('li#sociedad_enseñanza_centrosEducativos_centrosPrivados')[0];
    const menu_sociedad_enseñanza_alumnado = html.querySelectorAll('li#sociedad_enseñanza_alumnado')[0];
    const menu_sociedad_enseñanza_alumnado_centrosPublicos = html.querySelectorAll('li#sociedad_enseñanza_alumnado_centrosPublicos')[0];
    const menu_sociedad_enseñanza_alumnado_centrosPrivados = html.querySelectorAll('li#sociedad_enseñanza_alumnado_centrosPrivados')[0];
    const menu_sociedad_enseñanza_profesorado = html.querySelectorAll('li#sociedad_enseñanza_profesorado')[0];
    const menu_sociedad_enseñanza_profesorado_centrosPublicos = html.querySelectorAll('li#sociedad_enseñanza_profesorado_centrosPublicos')[0];
    const menu_sociedad_enseñanza_profesorado_centrosPrivados = html.querySelectorAll('li#sociedad_enseñanza_profesorado_centrosPrivados')[0];
    const menu_sociedad_enseñanza_unidadesGrupos = html.querySelectorAll('li#sociedad_enseñanza_unidadesGrupos')[0];
    const menu_sociedad_sanitariosSalud_recursos = html.querySelectorAll('li#sociedad_sanitariosSalud_recursos')[0];
    const menu_sociedad_sanitariosSalud_estado = html.querySelectorAll('li#sociedad_sanitariosSalud_estado')[0];
    const menu_sociedad_edificiosViviendas_edificios = html.querySelectorAll('li#sociedad_edificiosViviendas_edificios')[0];
    const menu_sociedad_edificiosViviendas_viviendas = html.querySelectorAll('li#sociedad_edificiosViviendas_viviendas')[0];
    const menu_sociedad_edificiosViviendas_establecimientos = html.querySelectorAll('li#sociedad_edificiosViviendas_establecimientos')[0];
    const menu_sociedad_elecciones_generales = html.querySelectorAll('li#sociedad_elecciones_generales')[0];
    const menu_sociedad_elecciones_andalucia = html.querySelectorAll('li#sociedad_elecciones_andalucia')[0];
    const menu_sociedad_elecciones_locales = html.querySelectorAll('li#sociedad_elecciones_locales')[0];

    const menu_sociedad_culturaTiempoLibre_equipamiento = html.querySelectorAll('li#sociedad_culturaTiempoLibre_equipamiento')[0];
    const menu_sociedad_culturaTiempoLibre_equipamiento_cine = html.querySelectorAll('li#sociedad_culturaTiempoLibre_equipamiento_cine')[0];
    const menu_sociedad_culturaTiempoLibre_equipamiento_bibliotecas = html.querySelectorAll('li#sociedad_culturaTiempoLibre_equipamiento_bibliotecas')[0];
    const menu_sociedad_culturaTiempoLibre_equipamiento_deporte = html.querySelectorAll('li#sociedad_culturaTiempoLibre_equipamiento_deporte')[0];
    const menu_sociedad_culturaTiempoLibre_patrimonioHistorico = html.querySelectorAll('li#sociedad_culturaTiempoLibre_patrimonioHistorico')[0];
    const menu_sociedad_serviciosProteccionSocial_mapa = html.querySelectorAll('li#sociedad_serviciosProteccionSocial_mapa')[0];
    const menu_economia_agricultura_distribucion = html.querySelectorAll('li#economia_agricultura_distribucion')[0];
    const menu_economia_agricultura_censo = html.querySelectorAll('li#economia_agricultura_censo')[0];
    const menu_economia_agricultura_censoAnterior = html.querySelectorAll('li#economia_agricultura_censoAnterior')[0];
    const menu_economia_turismo_hoteles = html.querySelectorAll('li#economia_turismo_hoteles')[0];
    const menu_economia_turismo_apartamentos = html.querySelectorAll('li#economia_turismo_apartamentos')[0];
    const menu_economia_turismo_campamentos = html.querySelectorAll('li#economia_turismo_campamentos')[0];
    const menu_economia_turismo_establecimientos = html.querySelectorAll('li#economia_turismo_establecimientos')[0];
    const menu_economia_turismo_restaurantes = html.querySelectorAll('li#economia_turismo_restaurantes')[0];
    const menu_economia_transporte_transporte = html.querySelectorAll('li#economia_transporte_transporte')[0];
    const menu_economia_transporte_transporte_vehiculos = html.querySelectorAll('li#economia_transporte_transporte_vehiculos')[0];
    const menu_economia_transporte_transporte_matriculaciones = html.querySelectorAll('li#economia_transporte_transporte_matriculaciones')[0];
    const menu_economia_transporte_transporte_conductores = html.querySelectorAll('li#economia_transporte_transporte_conductores')[0];
    const menu_economia_transporte_autorizaciones = html.querySelectorAll('li#economia_transporte_autorizaciones')[0];
    const menu_economia_empresarial_empresas = html.querySelectorAll('li#economia_empresarial_empresas')[0];
    const menu_economia_empresarial_establecimientos = html.querySelectorAll('li#economia_empresarial_establecimientos')[0];
    const menu_economia_empresarial_social = html.querySelectorAll('li#economia_empresarial_social')[0];
    const menu_economia_empresarial_social_cooperativas = html.querySelectorAll('li#economia_empresarial_social_cooperativas')[0];
    const menu_economia_empresarial_social_sociedades = html.querySelectorAll('li#economia_empresarial_social_sociedades')[0];
    const menu_trabajo_trabPoblacion_censos = html.querySelectorAll('li#trabajo_trabPoblacion_censos')[0];
    const menu_trabajo_trabActividad_censos = html.querySelectorAll('li#trabajo_trabActividad_censos')[0];
    const menu_trabajo_trabEmpleo_censos = html.querySelectorAll('li#trabajo_trabEmpleo_censos')[0];
    const menu_trabajo_trabEmpleo_contratos = html.querySelectorAll('li#trabajo_trabEmpleo_contratos')[0];
    const menu_trabajo_trabEmpleo_afiliados = html.querySelectorAll('li#trabajo_trabEmpleo_afiliados')[0];
    const menu_trabajo_trabEmpleo_afiliados_trabajo = html.querySelectorAll('li#trabajo_trabEmpleo_afiliados_trabajo')[0];
    const menu_trabajo_trabEmpleo_afiliados_residencia = html.querySelectorAll('li#trabajo_trabEmpleo_afiliados_residencia')[0];
    const menu_trabajo_trabParo_censos = html.querySelectorAll('li#trabajo_trabParo_censos')[0];
    const menu_trabajo_trabParo_paro = html.querySelectorAll('li#trabajo_trabParo_paro')[0];
    const menu_trabajo_trabParo_trabajadores = html.querySelectorAll('li#trabajo_trabParo_trabajadores')[0];
    const menu_trabajo_trabParo_demandantes = html.querySelectorAll('li#trabajo_trabParo_demandantes')[0];
    const menu_trabajo_trabParo_indicadores = html.querySelectorAll('li#trabajo_trabParo_indicadores')[0];
    const menu_trabajo_trabPensiones_contributivas = html.querySelectorAll('li#trabajo_trabPensiones_contributivas')[0];
    const menu_trabajo_trabPensiones_noContributivas = html.querySelectorAll('li#trabajo_trabPensiones_noContributivas')[0];
    const menu_hacienda_cuentas_locales = html.querySelectorAll('li#hacienda_cuentas_locales')[0];
    const menu_hacienda_estCatastrales_urbana = html.querySelectorAll('li#hacienda_estCatastrales_urbana')[0];
    const menu_hacienda_estCatastrales_rustica = html.querySelectorAll('li#hacienda_estCatastrales_rustica')[0];
    const menu_hacienda_estCatastrales_parcelas = html.querySelectorAll('li#hacienda_estCatastrales_parcelas')[0];

    menu_entornoFisico.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#entornoFisico')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#entornoFisico')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#entornoFisico')[0].setAttribute("style", "display:none;");
      }
    });

    menu_demografia.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#demografia')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#demografia')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#demografia')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#sociedad')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#sociedad')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#sociedad')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#economia')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#economia')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#economia')[0].setAttribute("style", "display:none;");
      }
    });
    menu_trabajo.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#trabajo')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#trabajo')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#trabajo')[0].setAttribute("style", "display:none;");
      }
    });
    menu_hacienda.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#hacienda')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#hacienda')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#hacienda')[0].setAttribute("style", "display:none;");
      }
    });



    menu_entornoFisico_territorio.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#entornoFisico_territorio')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#entornoFisico_territorio')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#entornoFisico_territorio')[0].setAttribute("style", "display:none;");
      }
    });
    menu_entornoFisico_medioAmbiente.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_entornoFisico_medioAmbiente')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_entornoFisico_medioAmbiente')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_entornoFisico_medioAmbiente')[0].setAttribute("style", "display:none;");
      }
    });
    menu_demografia_cifrasPoblacion_poblacion.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#demografia_cifrasPoblacion_poblacion')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#demografia_cifrasPoblacion_poblacion')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#demografia_cifrasPoblacion_poblacion')[0].setAttribute("style", "display:none;");
      }
    });
    menu_demografia_cifrasPoblacion_poblacion_padron.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#demografia_cifrasPoblacion_poblacion_padron')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#demografia_cifrasPoblacion_poblacion_padron')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#demografia_cifrasPoblacion_poblacion_padron')[0].setAttribute("style", "display:none;");
      }
    });
    menu_demografia_cifrasPoblacion_poblacion_censo.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#demografia_cifrasPoblacion_poblacion_censo')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#demografia_cifrasPoblacion_poblacion_censo')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#demografia_cifrasPoblacion_poblacion_censo')[0].setAttribute("style", "display:none;");
      }
    });
    menu_demografia_cifrasPoblacion_poblacion_censoA.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#demografia_cifrasPoblacion_poblacion_censoA')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#demografia_cifrasPoblacion_poblacion_censoA')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#demografia_cifrasPoblacion_poblacion_censoA')[0].setAttribute("style", "display:none;");
      }
    });
    menu_demografia_cifrasPoblacion_hogar.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#demografia_cifrasPoblacion_hogar')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#demografia_cifrasPoblacion_hogar')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#demografia_cifrasPoblacion_hogar')[0].setAttribute("style", "display:none;");
      }
    });
    menu_demografia_cifrasPoblacion.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#demografia_cifrasPoblacion')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#demografia_cifrasPoblacion')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#demografia_cifrasPoblacion')[0].setAttribute("style", "display:none;");
      }
    });
    menu_demografia_movimientoPoblacion.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#demografia_movimientoPoblacion')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#demografia_movimientoPoblacion')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#demografia_movimientoPoblacion')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_enseñanza_centrosEducativos.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_sociedad_enseñanza_centrosEducativos')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_sociedad_enseñanza_centrosEducativos')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_sociedad_enseñanza_centrosEducativos')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_enseñanza_centrosEducativos_centrosPublicos.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_sociedad_enseñanza_centrosEducativos_centrosPublicos')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_sociedad_enseñanza_centrosEducativos_centrosPublicos')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_sociedad_enseñanza_centrosEducativos_centrosPublicos')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_enseñanza_centrosEducativos_centrosPrivados.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_sociedad_enseñanza_centrosEducativos_centrosPrivados')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_sociedad_enseñanza_centrosEducativos_centrosPrivados')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_sociedad_enseñanza_centrosEducativos_centrosPrivados')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_enseñanza_alumnado_centrosPublicos.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_sociedad_enseñanza_alumnado_centrosPublicos')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_sociedad_enseñanza_alumnado_centrosPublicos')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_sociedad_enseñanza_alumnado_centrosPublicos')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_enseñanza_alumnado_centrosPrivados.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_sociedad_enseñanza_alumnado_centrosPrivados')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_sociedad_enseñanza_alumnado_centrosPrivados')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_sociedad_enseñanza_alumnado_centrosPrivados')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_enseñanza_alumnado.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_sociedad_enseñanza_alumnado')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_sociedad_enseñanza_alumnado')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_sociedad_enseñanza_alumnado')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_enseñanza_profesorado_centrosPublicos.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_sociedad_enseñanza_profesorado_centrosPublicos')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_sociedad_enseñanza_profesorado_centrosPublicos')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_sociedad_enseñanza_profesorado_centrosPublicos')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_enseñanza_profesorado_centrosPrivados.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_sociedad_enseñanza_profesorado_centrosPrivados')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_sociedad_enseñanza_profesorado_centrosPrivados')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_sociedad_enseñanza_profesorado_centrosPrivados')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_enseñanza_profesorado.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_sociedad_enseñanza_profesorado')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_sociedad_enseñanza_profesorado')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_sociedad_enseñanza_profesorado')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_enseñanza_unidadesGrupos.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_sociedad_enseñanza_unidadesGrupos')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_sociedad_enseñanza_unidadesGrupos')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_sociedad_enseñanza_unidadesGrupos')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_sanitariosSalud_recursos.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_sociedad_sanitariosSalud_recursos')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_sociedad_sanitariosSalud_recursos')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_sociedad_sanitariosSalud_recursos')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_sanitariosSalud_estado.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_sociedad_sanitariosSalud_estado')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_sociedad_sanitariosSalud_estado')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_sociedad_sanitariosSalud_estado')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_edificiosViviendas_edificios.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_sociedad_edificiosViviendas_edificios')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_sociedad_edificiosViviendas_edificios')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_sociedad_edificiosViviendas_edificios')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_edificiosViviendas_viviendas.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_sociedad_edificiosViviendas_viviendas')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_sociedad_edificiosViviendas_viviendas')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_sociedad_edificiosViviendas_viviendas')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_edificiosViviendas_establecimientos.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_sociedad_edificiosViviendas_establecimientos')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_sociedad_edificiosViviendas_establecimientos')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_sociedad_edificiosViviendas_establecimientos')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_elecciones_generales.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_sociedad_elecciones_generales')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_sociedad_elecciones_generales')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_sociedad_elecciones_generales')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_elecciones_andalucia.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_sociedad_elecciones_andalucia')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_sociedad_elecciones_andalucia')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_sociedad_elecciones_andalucia')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_elecciones_locales.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_sociedad_elecciones_locales')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_sociedad_elecciones_locales')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_sociedad_elecciones_locales')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_culturaTiempoLibre_equipamiento_cine.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_sociedad_culturaTiempoLibre_equipamiento_cine')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_sociedad_culturaTiempoLibre_equipamiento_cine')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_sociedad_culturaTiempoLibre_equipamiento_cine')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_culturaTiempoLibre_equipamiento_bibliotecas.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_sociedad_culturaTiempoLibre_equipamiento_bibliotecas')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_sociedad_culturaTiempoLibre_equipamiento_bibliotecas')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_sociedad_culturaTiempoLibre_equipamiento_bibliotecas')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_culturaTiempoLibre_equipamiento_deporte.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_sociedad_culturaTiempoLibre_equipamiento_deporte')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_sociedad_culturaTiempoLibre_equipamiento_deporte')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_sociedad_culturaTiempoLibre_equipamiento_deporte')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_culturaTiempoLibre_patrimonioHistorico.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_sociedad_culturaTiempoLibre_patrimonioHistorico')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_sociedad_culturaTiempoLibre_patrimonioHistorico')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_sociedad_culturaTiempoLibre_patrimonioHistorico')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_serviciosProteccionSocial_mapa.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_sociedad_serviciosProteccionSocial_mapa')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_sociedad_serviciosProteccionSocial_mapa')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_sociedad_serviciosProteccionSocial_mapa')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_agricultura_distribucion.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_economia_agricultura_distribucion')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_economia_agricultura_distribucion')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_economia_agricultura_distribucion')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_agricultura_censo.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_economia_agricultura_censo')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_economia_agricultura_censo')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_economia_agricultura_censo')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_agricultura_censoAnterior.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_economia_agricultura_censoAnterior')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_economia_agricultura_censoAnterior')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_economia_agricultura_censoAnterior')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_turismo_hoteles.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_economia_turismo_hoteles')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_economia_turismo_hoteles')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_economia_turismo_hoteles')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_turismo_apartamentos.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_economia_turismo_apartamentos')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_economia_turismo_apartamentos')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_economia_turismo_apartamentos')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_turismo_campamentos.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_economia_turismo_campamentos')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_economia_turismo_campamentos')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_economia_turismo_campamentos')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_turismo_establecimientos.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_economia_turismo_establecimientos')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_economia_turismo_establecimientos')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_economia_turismo_establecimientos')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_turismo_restaurantes.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_economia_turismo_restaurantes')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_economia_turismo_restaurantes')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_economia_turismo_restaurantes')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_transporte_transporte.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_economia_transporte_transporte')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_economia_transporte_transporte')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_economia_transporte_transporte')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_transporte_transporte_vehiculos.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_economia_transporte_transporte_vehiculos')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_economia_transporte_transporte_vehiculos')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_economia_transporte_transporte_vehiculos')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_transporte_transporte_matriculaciones.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_economia_transporte_transporte_matriculaciones')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_economia_transporte_transporte_matriculaciones')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_economia_transporte_transporte_matriculaciones')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_transporte_transporte_conductores.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_economia_transporte_transporte_conductores')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_economia_transporte_transporte_conductores')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_economia_transporte_transporte_conductores')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_transporte_autorizaciones.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_economia_transporte_autorizaciones')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_economia_transporte_autorizaciones')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_economia_transporte_autorizaciones')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_empresarial_empresas.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_economia_empresarial_empresas')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_economia_empresarial_empresas')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_economia_empresarial_empresas')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_empresarial_establecimientos.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_economia_empresarial_establecimientos')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_economia_empresarial_establecimientos')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_economia_empresarial_establecimientos')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_empresarial_social.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_economia_empresarial_social')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_economia_empresarial_social')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_economia_empresarial_social')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_empresarial_social_cooperativas.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_economia_empresarial_social_cooperativas')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_economia_empresarial_social_cooperativas')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_economia_empresarial_social_cooperativas')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_empresarial_social_sociedades.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_economia_empresarial_social_sociedades')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_economia_empresarial_social_sociedades')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_economia_empresarial_social_sociedades')[0].setAttribute("style", "display:none;");
      }
    });
    menu_trabajo_trabPoblacion_censos.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_trabajo_trabPoblacion_censos')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_trabajo_trabPoblacion_censos')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_trabajo_trabPoblacion_censos')[0].setAttribute("style", "display:none;");
      }
    });
    menu_trabajo_trabActividad_censos.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_trabajo_trabActividad_censos')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_trabajo_trabActividad_censos')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_trabajo_trabActividad_censos')[0].setAttribute("style", "display:none;");
      }
    });
    menu_trabajo_trabEmpleo_censos.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_trabajo_trabEmpleo_censos')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_trabajo_trabEmpleo_censos')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_trabajo_trabEmpleo_censos')[0].setAttribute("style", "display:none;");
      }
    });
    menu_trabajo_trabEmpleo_contratos.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_trabajo_trabEmpleo_contratos')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_trabajo_trabEmpleo_contratos')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_trabajo_trabEmpleo_contratos')[0].setAttribute("style", "display:none;");
      }
    });
    menu_trabajo_trabEmpleo_afiliados.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_trabajo_trabEmpleo_afiliados')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_trabajo_trabEmpleo_afiliados')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_trabajo_trabEmpleo_afiliados')[0].setAttribute("style", "display:none;");
      }
    });
    menu_trabajo_trabEmpleo_afiliados_trabajo.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_trabajo_trabEmpleo_afiliados_trabajo')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_trabajo_trabEmpleo_afiliados_trabajo')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_trabajo_trabEmpleo_afiliados_trabajo')[0].setAttribute("style", "display:none;");
      }
    });
    menu_trabajo_trabEmpleo_afiliados_residencia.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_trabajo_trabEmpleo_afiliados_residencia')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_trabajo_trabEmpleo_afiliados_residencia')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_trabajo_trabEmpleo_afiliados_residencia')[0].setAttribute("style", "display:none;");
      }
    });
    menu_trabajo_trabParo_censos.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_trabajo_trabParo_censos')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_trabajo_trabParo_censos')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_trabajo_trabParo_censos')[0].setAttribute("style", "display:none;");
      }
    });
    menu_trabajo_trabParo_paro.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_trabajo_trabParo_paro')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_trabajo_trabParo_paro')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_trabajo_trabParo_paro')[0].setAttribute("style", "display:none;");
      }
    });
    menu_trabajo_trabParo_trabajadores.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_trabajo_trabParo_trabajadores')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_trabajo_trabParo_trabajadores')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_trabajo_trabParo_trabajadores')[0].setAttribute("style", "display:none;");
      }
    });
    menu_trabajo_trabParo_demandantes.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_trabajo_trabParo_demandante')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_trabajo_trabParo_demandante')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_trabajo_trabParo_demandante')[0].setAttribute("style", "display:none;");
      }
    });
    menu_trabajo_trabParo_indicadores.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_trabajo_trabParo_indicadores')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_trabajo_trabParo_indicadores')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_trabajo_trabParo_indicadores')[0].setAttribute("style", "display:none;");
      }
    });
    menu_trabajo_trabPensiones_contributivas.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_trabajo_trabPensiones_contributivas')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_trabajo_trabPensiones_contributivas')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_trabajo_trabPensiones_contributivas')[0].setAttribute("style", "display:none;");
      }
    });
    menu_trabajo_trabPensiones_noContributivas.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_trabajo_trabPensiones_noContributivas')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_trabajo_trabPensiones_noContributivas')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_trabajo_trabPensiones_noContributivas')[0].setAttribute("style", "display:none;");
      }
    });
    menu_hacienda_cuentas_locales.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_hacienda_cuentas_locales')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_hacienda_cuentas_locales')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_hacienda_cuentas_locales')[0].setAttribute("style", "display:none;");
      }
    });
    menu_hacienda_estCatastrales_urbana.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_hacienda_estCatastrales_urbana')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_hacienda_estCatastrales_urbana')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_hacienda_estCatastrales_urbana')[0].setAttribute("style", "display:none;");
      }
    });
    menu_hacienda_estCatastrales_rustica.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_hacienda_estCatastrales_rustica')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_hacienda_estCatastrales_rustica')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_hacienda_estCatastrales_rustica')[0].setAttribute("style", "display:none;");
      }
    });
    menu_hacienda_estCatastrales_parcelas.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_hacienda_estCatastrales_parcelas')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_hacienda_estCatastrales_parcelas')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_hacienda_estCatastrales_parcelas')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_culturaTiempoLibre_equipamiento.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_sociedad_culturaTiempoLibre_equipamiento')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_sociedad_culturaTiempoLibre_equipamiento')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_sociedad_culturaTiempoLibre_equipamiento')[0].setAttribute("style", "display:none;");
      }
    });
    menu_demografia_migraciones.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#demografia_migraciones')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#demografia_migraciones')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#demografia_migraciones')[0].setAttribute("style", "display:none;");
      }
    });
    menu_demografia_indicadoresDemograficos.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#demografia_indicadoresDemograficos')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#demografia_indicadoresDemograficos')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#demografia_indicadoresDemograficos')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_enseñanza.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#sociedad_enseñanza')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#sociedad_enseñanza')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#sociedad_enseñanza')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_sanitariosSalud.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#sociedad_sanitariosSalud')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#sociedad_sanitariosSalud')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#sociedad_sanitariosSalud')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_edificiosViviendas.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#sociedad_edificiosViviendas')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#sociedad_edificiosViviendas')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#sociedad_edificiosViviendas')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_elecciones.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#sociedad_elecciones')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#sociedad_elecciones')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#sociedad_elecciones')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_culturaTiempoLibre.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#sociedad_culturaTiempoLibre')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#sociedad_culturaTiempoLibre')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#sociedad_culturaTiempoLibre')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_serviciosProteccionSocial.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#sociedad_serviciosProteccionSocial')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#sociedad_serviciosProteccionSocial')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#sociedad_serviciosProteccionSocial')[0].setAttribute("style", "display:none;");
      }
    });
    menu_sociedad_infraestructurasEquipamientos.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#sociedad_infraestructurasEquipamientos')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#sociedad_infraestructurasEquipamientos')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#sociedad_infraestructurasEquipamientos')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_agricultura.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#economia_agricultura')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#economia_agricultura')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#economia_agricultura')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_ganaderia.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#economia_ganaderia')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#economia_ganaderia')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#economia_ganaderia')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_pesca.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#economia_pesca')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#economia_pesca')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#economia_pesca')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_energia.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#economia_energia')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#economia_energia')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#economia_energia')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_turismo.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#economia_turismo')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#economia_turismo')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#economia_turismo')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_construccion.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#economia_construccion')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#economia_construccion')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#economia_construccion')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_transporte.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#economia_transporte')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#economia_transporte')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#economia_transporte')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_comunicaciones.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#economia_comunicaciones')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#economia_comunicaciones')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#economia_comunicaciones')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_inversiones.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#economia_inversiones')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#economia_inversiones')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#economia_inversiones')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_financiero.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#economia_financiero')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#economia_financiero')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#economia_financiero')[0].setAttribute("style", "display:none;");
      }
    });
    menu_economia_empresarial.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#economia_empresarial')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#economia_empresarial')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#economia_empresarial')[0].setAttribute("style", "display:none;");
      }
    });
    menu_trabajo_trabPoblacion.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#trabajo_trabPoblacion')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#trabajo_trabPoblacion')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#trabajo_trabPoblacion')[0].setAttribute("style", "display:none;");
      }
    });
    menu_trabajo_trabActividad.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#trabajo_trabActividad')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#trabajo_trabActividad')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#trabajo_trabActividad')[0].setAttribute("style", "display:none;");
      }
    });
    menu_trabajo_trabEmpleo.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#trabajo_trabEmpleo')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#trabajo_trabEmpleo')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#trabajo_trabEmpleo')[0].setAttribute("style", "display:none;");
      }
    });
    menu_trabajo_trabParo.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#trabajo_trabParo')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#trabajo_trabParo')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#trabajo_trabParo')[0].setAttribute("style", "display:none;");
      }
    });
    menu_trabajo_trabPensiones.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#trabajo_trabPensiones')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#trabajo_trabPensiones')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#trabajo_trabPensiones')[0].setAttribute("style", "display:none;");
      }
    });
    menu_hacienda_cuentas.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#hacienda_cuentas')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#hacienda_cuentas')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#hacienda_cuentas')[0].setAttribute("style", "display:none;");
      }
    });
    menu_hacienda_estCatastrales.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#hacienda_estCatastrales')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#hacienda_estCatastrales')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#hacienda_estCatastrales')[0].setAttribute("style", "display:none;");
      }
    });
    menu_hacienda_iae.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#hacienda_iae')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#hacienda_iae')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#hacienda_iae')[0].setAttribute("style", "display:none;");
      }
    });
    menu_hacienda_irpf.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#hacienda_irpf')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#hacienda_irpf')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#hacienda_irpf')[0].setAttribute("style", "display:none;");
      }
    });
    entornoFisico_territorio_1.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_entornoFisico_territorio_1')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_entornoFisico_territorio_1')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_entornoFisico_territorio_1')[0].setAttribute("style", "display:none;");
      }
    });
    entornoFisico_territorio_2.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_entornoFisico_territorio_2')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_entornoFisico_territorio_2')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_entornoFisico_territorio_2')[0].setAttribute("style", "display:none;");
      }
    });
    entornoFisico_territorio_3.addEventListener('click', () => {
      if (window.getComputedStyle(html.querySelectorAll('div#div_entornoFisico_territorio_3')[0]).getPropertyValue('display') == 'none') {
        html.querySelectorAll('div#div_entornoFisico_territorio_3')[0].setAttribute("style", "display:block;");
      } else {
        html.querySelectorAll('div#div_entornoFisico_territorio_3')[0].setAttribute("style", "display:none;");
      }
    });

  }

  queryFunction(query, visual, units) {

    let queryGo = true;
    document.querySelectorAll('div.loading')[0].setAttribute("style", "display: block;");

    document.querySelectorAll('div.cuadro')[0].innerHTML = ''; // elimina las tablas al generar una busqueda

    for (let i = 0; i < this.config.queryResult.length; i++) {
      if (this.config.queryResult[i][0] == query) {
        this.config.queryResult[i][4] = visual;
        document.querySelectorAll('div.loading')[0].setAttribute("style", "display: none;");
        if (this.config.munSelect != '') {
          this.responseData(this.config.munSelect.getImpl().getAttribute('cod_mun'));
        }
        queryGo = false;
      }
    }

    if (queryGo == true) {


      let municipios = this.map_.getLayers({ name: 'Municipios de Andalucía' })[0].getFeatures();
      for (let i = 0; i < municipios.length; i++) {
        municipios[i].setStyle(this.config.styles.estiloMunicipio);
      }

      this.map_.getFeatureHandler().unselectFeatures([this.config.munSelect], this.config.limitesMunicipales, {});
      this.config.timeResponse = new Date();
      this.map_.getPanels('legend')[0].collapse();
      this.config.statusServer = false;
      const request = new XMLHttpRequest();
      request.open('GET', 'https://www.ieca.junta-andalucia.es/intranet/admin/rest/v1.0/consulta/' + query);
      request.responseType = 'json';

      request.send();

      request.onload = () => {
        console.log(request.response);

        //request.response.setCharacterEncoding("UTF-8");
        let tipData = new Array();
        let respuesta = new Array();
        let ignore = new Array();
        let year = new Array();
        let indexYear;

        for (let i = 0; i < request.response.hierarchies.length; i++) {
          let registro = new Array();
          registro.push(request.response.hierarchies[i].des);
          registro.push(request.response.hierarchies[i].order);
          registro.push(request.response.hierarchies[i].position);

          tipData.push(registro);
        }

        for (let i = 0; i < request.response.measures.length; i++) {
          let registro = new Array();
          registro.push(request.response.measures[i].des);
          registro.push(request.response.measures[i].order);
          registro.push(request.response.measures[i].position);

          tipData.push(registro);
        }

        for (let i = 0; i < request.response.data[0].length; i++) {
          if (request.response.data[0][i].cod && request.response.data[0][i].cod[0] == request.response.data[0][i].des) {
            ignore.push(i);
          }
        }

        for (let i = 0; i < request.response.data.length; i++) {
          let arrayReg = new Array();
          let reg = request.response.data[i];
          arrayReg.push(reg[0].cod.pop());
          for (let t = 1; t < reg.length; t++) {

            if ((tipData[t][2] == 'c') && (reg[t].des)) {
              arrayReg.push([reg[t].des, tipData[t][1]]);
            }
            if ((tipData[t][2] == 'c') && (reg[t].format)) {
              arrayReg.push([reg[t].format, 'value']);
            }
            if ((tipData[t][2] == 'c') && (reg[t].format === "")) {
              arrayReg.push(['---', 'value']);
            }
            // if ((tipData[t][2] == 'c') && (reg[t].format == "-")) {
            //   arrayReg.push(['---', 'value']);
            // }
            // if ((tipData[t][2] == 'c') && (reg[t].format == "*")) {
            //   arrayReg.push(['---', 'value']);
            // }

          }

          respuesta.push(arrayReg);
        }

        // recogemos el año de los datos en el array year
        for (let i = 0; i < tipData.length; i++) {
          if ((tipData[i][0] == 'Anual')||(tipData[i][0]== 'Año')) {
            indexYear = i;
          }
        }

        for (let i = 0; i < request.response.data.length; i++) {
          if (!year.includes(request.response.data[i][indexYear].des)) {
            year.push(request.response.data[i][indexYear].des);
          }
        }




        if (request.status == 200) {
          this.config.queryResult.push([query, request.response.metainfo.title, respuesta, tipData, visual, units, year]);
          this.config.statusServer = true;
          document.querySelectorAll('div.loading')[0].setAttribute("style", "display: none;");

          this.config.timeResponse -= new Date();
          this.config.timeResponse = this.config.timeResponse * -1;
          request.abort();
          M.dialog.info('Tiempo de respuesta :' + Math.floor(this.config.timeResponse / 1000) + ' segundos');
        }
        console.log(this.config.queryResult);


      }
    }

  }
  responseData(code) {

    let presentacion = '';
    let code1 = code;



    for (let i = 0; i < this.config.queryResult.length; i++) {
      let encontrado = false;
      if (this.config.queryResult[i][0] == '40903') {
        code1 = code.slice(0, 2);

      } else {
        code1 = code;
      }
      if (this.config.queryResult[i][4] == true) {
        let tipRep = false;
        let cabecera = [];

        let indicesCabecera = 0;
        let contadorValores = 0;
        let contadorDatos = 0;
        presentacion += '<div><table class="resultado"><tr><th class="cabecera" colspan=2>' + this.config.queryResult[i][1] + ' (' + this.config.queryResult[i][5] + ')<br>(' + this.config.queryResult[i][6][0] + ')</th></tr>';

        for (let j = 1; j < this.config.queryResult[i][2][0].length; j++) {
          if (this.config.queryResult[i][2][0][j][1] > indicesCabecera) {
            indicesCabecera = this.config.queryResult[i][2][0][j][1];
          }
          if (this.config.queryResult[i][2][0][j][1] == 0) {
            tipRep = true;
          }
          if (this.config.queryResult[i][2][0][j][1] == 'value') {
            contadorValores += 1;
          }

        }
        for (let j = 0; j < this.config.queryResult[i][3].length; j++) {
          if (this.config.queryResult[i][3][j][2] == 'c') {
            contadorDatos += 1;
          }
        }

        if ((tipRep == true) && (contadorDatos > contadorValores)) {
          tipRep = false;
        }



        for (let j = 0; j < this.config.queryResult[i][2].length; j++) {

          if (tipRep == true) {

            if (this.config.queryResult[i][2][j][0].indexOf(code1) != -1) {

              for (let t = 1; t < this.config.queryResult[i][2][j].length; t++) {
                if ((this.config.queryResult[i][2][j][t][1] < indicesCabecera) && (indicesCabecera > 0) && (!cabecera.includes(this.config.queryResult[i][2][j][t][0]))) {
                  if (cabecera.length < indicesCabecera) {
                    cabecera.push(this.config.queryResult[i][2][j][t][0]);

                  }
                  if (cabecera.length == indicesCabecera) {
                    cabecera[this.config.queryResult[i][2][j][t][1]] = this.config.queryResult[i][2][j][t][0];

                  }

                  presentacion += '<tr><th class="cabecera2" colspan=2>' + this.config.queryResult[i][2][j][t][0] + '</th></tr>';
                }
                if (this.config.queryResult[i][2][j][t][1] == indicesCabecera) {
                  presentacion += '<tr><th class="dato">' + this.config.queryResult[i][2][j][t][0] + '</th>';
                }
                if (this.config.queryResult[i][2][j][t][1] == 'value') {
                  presentacion += '<td>' + this.config.queryResult[i][2][j][t][0] + '</td></tr>'
                }
              }
              encontrado = true;
            }
          }

          if (tipRep == false) {
            let arrayTitulos = new Array();
            for (let t = 0; t < this.config.queryResult[i][3].length; t++) {
              if (this.config.queryResult[i][3][t][2] == 'c') {
                arrayTitulos.push(this.config.queryResult[i][3][t][0]);
              }
            }
            if (this.config.queryResult[i][2][j][0].indexOf(code1) != -1) {

              for (let t = 1; t < this.config.queryResult[i][2][j].length; t++) {


                if ((this.config.queryResult[i][2][j][t].includes(0)) && (!cabecera.includes(this.config.queryResult[i][2][j][t][0]))) {
                  cabecera.push(this.config.queryResult[i][2][j][t][0]);
                  presentacion += '<tr><th class="cabecera2" colspan=2>' + this.config.queryResult[i][2][j][t][0] + '</th></tr>';

                }

                if (cabecera.includes(this.config.queryResult[i][2][j][t][0])) {
                  t += 1;
                }


                if (this.config.queryResult[i][2][j][t].includes('value')) {

                  presentacion += '<tr><th class="dato">' + arrayTitulos[t - 1] + '</th>';


                  presentacion += '<td>' + this.config.queryResult[i][2][j][t][0] + '</td></tr>';
                } else {
                  presentacion += '<tr><th class="cabecera3" colspan=2>' + this.config.queryResult[i][2][j][t][0] + '</th></tr>';
                }

              }

              encontrado = true;
            }

          }

        }
        // console.log(cabecera);
        ///////////////////////////////////////////////////////////////////////////////



        if (encontrado == false) {
          presentacion += '<tr><th colspan=2>dato no encontrado</th></tr>';

        }


        presentacion += '</table><hr></div>'

        document.querySelectorAll('div.cuadro')[0].innerHTML = presentacion;
      }

    }
  }

}
