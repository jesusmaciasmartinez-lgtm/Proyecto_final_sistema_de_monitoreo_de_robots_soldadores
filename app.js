/**
 * SISTEMA DE MONITOREO DE ROBOTS SOLDADORES - INDUSTRIA 4.0
 * Lógica Principal de la Aplicación Web (Vanilla JavaScript)
 * Colección: Robots Soldadores (10 registros industriales)
 */

document.addEventListener('DOMContentLoaded', () => {

  // Helper para formatear fecha y hora actual en formato estándar YYYY-MM-DD HH:mm:ss
  function formatDateTime(date = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mi = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  }

  // ==========================================================================
  // ESTADO GLOBAL DE LA APLICACIÓN
  // ==========================================================================
  const state = {
    // Configuración y Umbrales
    config: {
      tempThreshold: 400,    // Alarma si Temperatura > 400°C
      currentThreshold: 140, // Alarma si Corriente > 140A
      intervalMs: 2500,
      audioAlert: true,
      autoCool: true,
    },

    // ==========================================================================
    // COLECCIÓN: ROBOTS SOLDADORES (10 Registros de Ejemplo)
    // Campos requeridos:
    // - ID_Robot (Texto)
    // - Area (Texto)
    // - Estado (Activo, Detenido, Mantenimiento)
    // - Temperatura (Número)
    // - Corriente (Número)
    // - Horas_Operacion (Número)
    // - Alarma (Texto)
    // - Fecha_Actualizacion (Fecha y Hora)
    // ==========================================================================
    robots: [
      {
        id: "RS-01",
        area: "Soldadura Línea A",
        status: "Activo",
        temp: 350,
        current: 120,
        hours: 2300,
        alarm: "Ninguna",
        lastUpdate: "2026-10-03 08:24:15",
        weldCycle: "MIG Continuo",
        gasFlow: 18.5,
        targetTemp: 350,
        targetCurrent: 120
      },
      {
        id: "RS-02",
        area: "Soldadura Línea A",
        status: "Activo",
        temp: 365,
        current: 125,
        hours: 2100,
        alarm: "Ninguna",
        lastUpdate: "2026-10-03 08:24:45",
        weldCycle: "MIG Pulsado",
        gasFlow: 19.0,
        targetTemp: 365,
        targetCurrent: 125
      },
      {
        id: "RS-03",
        area: "Soldadura Línea B",
        status: "Detenido",
        temp: 24,
        current: 0,
        hours: 1800,
        alarm: "Ninguna",
        lastUpdate: "2026-10-03 08:10:00",
        weldCycle: "En Espera",
        gasFlow: 0.0,
        targetTemp: 24,
        targetCurrent: 0
      },
      {
        id: "RS-04",
        area: "Soldadura Línea B",
        status: "Activo",
        temp: 355,
        current: 118,
        hours: 2500,
        alarm: "Ninguna",
        lastUpdate: "2026-10-03 08:25:02",
        weldCycle: "TIG Automatizado",
        gasFlow: 18.2,
        targetTemp: 355,
        targetCurrent: 118
      },
      {
        id: "RS-05",
        area: "Soldadura Línea A",
        status: "Activo",
        temp: 372,
        current: 128,
        hours: 1950,
        alarm: "Ninguna",
        lastUpdate: "2026-10-03 08:25:20",
        weldCycle: "MIG Continuo",
        gasFlow: 18.8,
        targetTemp: 372,
        targetCurrent: 128
      },
      {
        id: "RS-06",
        area: "Soldadura Línea C",
        status: "Mantenimiento",
        temp: 22,
        current: 0,
        hours: 3200,
        alarm: "Mantenimiento Preventivo",
        lastUpdate: "2026-10-03 07:30:00",
        weldCycle: "Calibración",
        gasFlow: 0.0,
        targetTemp: 22,
        targetCurrent: 0
      },
      {
        id: "RS-07",
        area: "Soldadura Línea C",
        status: "Activo",
        temp: 412,
        current: 134,
        hours: 2850,
        alarm: "Sobrecalentamiento (>400°C)",
        lastUpdate: "2026-10-03 08:25:35",
        weldCycle: "MIG Pulsado",
        gasFlow: 19.5,
        targetTemp: 412,
        targetCurrent: 134
      },
      {
        id: "RS-08",
        area: "Soldadura Línea D",
        status: "Activo",
        temp: 360,
        current: 146,
        hours: 1650,
        alarm: "Sobrecarga de Corriente (>140A)",
        lastUpdate: "2026-10-03 08:25:40",
        weldCycle: "Láser Híbrido",
        gasFlow: 20.0,
        targetTemp: 360,
        targetCurrent: 146
      },
      {
        id: "RS-09",
        area: "Soldadura Línea D",
        status: "Activo",
        temp: 348,
        current: 115,
        hours: 2200,
        alarm: "Ninguna",
        lastUpdate: "2026-10-03 08:25:50",
        weldCycle: "MIG Continuo",
        gasFlow: 18.0,
        targetTemp: 348,
        targetCurrent: 115
      },
      {
        id: "RS-10",
        area: "Soldadura Línea B",
        status: "Detenido",
        temp: 25,
        current: 0,
        hours: 1400,
        alarm: "En Espera de Material",
        lastUpdate: "2026-10-03 08:18:10",
        weldCycle: "Standby",
        gasFlow: 0.0,
        targetTemp: 25,
        targetCurrent: 0
      }
    ],

    // Registro de Alarmas (activas e históricas)
    alarms: [],

    // Historial temporal para gráfica de líneas (últimas 10 muestras)
    history: {
      labels: [],
      series: {}
    },

    // Estado del Simulador
    isSimulating: true,
    simTimer: null,
    currentView: 'dashboard',
    filterArea: 'all',
    filterStatus: 'all',
    searchQuery: '',
    alarmFilter: 'all',
    activeAlerts: [],
    alertFilterSeverity: 'all'
  };

  // Inicializar claves para la serie temporal de cada uno de los 10 robots
  state.robots.forEach(r => {
    state.history.series[r.id] = [];
  });

  // Instancias de Gráficos Chart.js (Dashboard & Análisis Operativo)
  let chartTempBarInstance = null;
  let chartCurrentBarInstance = null;
  let chartStatusPieInstance = null;
  let chartHistoryLineInstance = null;

  // Instancias de Gráficos Chart.js (Pantalla Ejecutiva de Reportes)
  let chartTopHoursInstance = null;
  let chartTopAlarmsInstance = null;
  let chartAvgTempAreaInstance = null;
  let chartStatusAreaInstance = null;

  // Contexto de Audio Web API para la chicharra de alerta SCADA
  let audioCtx = null;

  // ==========================================================================
  // INICIALIZACIÓN DE LA APLICACIÓN
  // ==========================================================================
  function initApp() {
    initClock();
    initHistoryBuffer();
    initCharts();
    initReportCharts();
    computeActiveAlerts();
    renderKPIs();
    renderRobotsTable();
    renderAlertsTables();
    renderRobotsDetailGrid();
    generateExecutiveReport();
    setupEventListeners();
    startSimulation();
  }

  // ==========================================================================
  // RELOJ INDUSTRIAL & TELEMETRÍA
  // ==========================================================================
  function initClock() {
    const clockEl = document.getElementById('liveClock');
    const updateTime = () => {
      const now = new Date();
      if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString('es-MX', { hour12: false });
      }
    };
    updateTime();
    setInterval(updateTime, 1000);

    // Variación sutil de latencia MQTT
    setInterval(() => {
      const latencyEl = document.getElementById('simLatency');
      if (latencyEl) {
        const lat = Math.floor(10 + Math.random() * 12);
        latencyEl.textContent = `${lat} ms`;
      }
    }, 3000);
  }

  // ==========================================================================
  // BUFFER DE HISTORIAL TÉRMICO
  // ==========================================================================
  function initHistoryBuffer() {
    const now = new Date();
    for (let i = 9; i >= 0; i--) {
      const pastTime = new Date(now.getTime() - i * state.config.intervalMs);
      const timeStr = pastTime.toLocaleTimeString('es-MX', { hour12: false, minute: '2-digit', second: '2-digit' });
      state.history.labels.push(timeStr);

      state.robots.forEach(r => {
        const val = r.status === 'Activo' ? r.temp + Math.floor((Math.random() - 0.5) * 6) : r.temp;
        state.history.series[r.id].push(val);
      });
    }
  }

  // ==========================================================================
  // PALETA DE COLORES INDUSTRIALES (REGLA DE NEGOCIO):
  // - Azul para operación normal (#2563eb / #3b82f6)
  // - Amarillo para mantenimiento (#f59e0b / #fbbf24)
  // - Rojo para alarmas (#ef4444 / #f87171)
  // ==========================================================================
  const INDUSTRIAL_COLORS = {
    normal: '#2563eb',       // Azul (Operación normal)
    normalBorder: '#60a5fa',
    maintenance: '#f59e0b',  // Amarillo (Mantenimiento)
    maintBorder: '#fbbf24',
    alarm: '#ef4444',        // Rojo (Alarmas)
    alarmBorder: '#f87171',
    stopped: '#64748b',      // Pizarra / Gris neutro
    stoppedBorder: '#94a3b8'
  };

  function getBarColorForRobot(robot, metric) {
    if (metric === 'temp' && robot.temp > state.config.tempThreshold) {
      return INDUSTRIAL_COLORS.alarm; // Rojo
    }
    if (metric === 'current' && robot.current > state.config.currentThreshold) {
      return INDUSTRIAL_COLORS.alarm; // Rojo
    }
    if (robot.status === 'Mantenimiento') {
      return INDUSTRIAL_COLORS.maintenance; // Amarillo
    }
    return INDUSTRIAL_COLORS.normal; // Azul
  }

  function getBarBorderForRobot(robot, metric) {
    if (metric === 'temp' && robot.temp > state.config.tempThreshold) return INDUSTRIAL_COLORS.alarmBorder;
    if (metric === 'current' && robot.current > state.config.currentThreshold) return INDUSTRIAL_COLORS.alarmBorder;
    if (robot.status === 'Mantenimiento') return INDUSTRIAL_COLORS.maintBorder;
    return INDUSTRIAL_COLORS.normalBorder;
  }

  // ==========================================================================
  // INICIALIZACIÓN DE GRÁFICAS: SECCIÓN ANÁLISIS OPERATIVO (CHART.JS)
  // ==========================================================================
  function initCharts() {
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', sans-serif";

    // 1. Gráfica de barras: Temperatura por Robot
    const ctxTemp = document.getElementById('chartTempBar')?.getContext('2d');
    if (ctxTemp) {
      chartTempBarInstance = new Chart(ctxTemp, {
        type: 'bar',
        data: {
          labels: state.robots.map(r => r.id),
          datasets: [{
            label: 'Temperatura (°C)',
            data: state.robots.map(r => r.temp),
            backgroundColor: state.robots.map(r => getBarColorForRobot(r, 'temp')),
            borderColor: state.robots.map(r => getBarBorderForRobot(r, 'temp')),
            borderWidth: 1.5,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const r = state.robots[ctx.dataIndex];
                  let estadoTag = '[Azul: Operación Normal]';
                  if (r.temp > state.config.tempThreshold) estadoTag = '⚠️ [Rojo: ALARMA > 400°C]';
                  else if (r.status === 'Mantenimiento') estadoTag = '⚙️ [Amarillo: Mantenimiento]';
                  return ` Temperatura: ${ctx.parsed.y} °C ${estadoTag}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 500,
              grid: { color: 'rgba(148, 163, 184, 0.08)' },
              ticks: { font: { family: "'JetBrains Mono', monospace" } }
            },
            x: {
              grid: { display: false },
              ticks: { font: { weight: 'bold', size: 10 } }
            }
          }
        }
      });
    }

    // 2. Gráfica de barras: Corriente Eléctrica por Robot
    const ctxCurrent = document.getElementById('chartCurrentBar')?.getContext('2d');
    if (ctxCurrent) {
      chartCurrentBarInstance = new Chart(ctxCurrent, {
        type: 'bar',
        data: {
          labels: state.robots.map(r => r.id),
          datasets: [{
            label: 'Corriente (A)',
            data: state.robots.map(r => r.current),
            backgroundColor: state.robots.map(r => getBarColorForRobot(r, 'current')),
            borderColor: state.robots.map(r => getBarBorderForRobot(r, 'current')),
            borderWidth: 1.5,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const r = state.robots[ctx.dataIndex];
                  let estadoTag = '[Azul: Operación Normal]';
                  if (r.current > state.config.currentThreshold) estadoTag = '⚠️ [Rojo: SOBRECARGA > 140A]';
                  else if (r.status === 'Mantenimiento') estadoTag = '⚙️ [Amarillo: Mantenimiento]';
                  return ` Corriente: ${ctx.parsed.y} A ${estadoTag}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 200,
              grid: { color: 'rgba(148, 163, 184, 0.08)' },
              ticks: { font: { family: "'JetBrains Mono', monospace" } }
            },
            x: {
              grid: { display: false },
              ticks: { font: { weight: 'bold', size: 10 } }
            }
          }
        }
      });
    }

    // 3. Gráfica de pastel: Distribución del Estado de los Robots (Activo, Detenido, Mantenimiento)
    const ctxStatus = document.getElementById('chartStatusPie')?.getContext('2d');
    if (ctxStatus) {
      const activeNormalCount = state.robots.filter(r => r.status === 'Activo' && r.temp <= state.config.tempThreshold && r.current <= state.config.currentThreshold).length;
      const alarmCount = state.robots.filter(r => r.temp > state.config.tempThreshold || r.current > state.config.currentThreshold).length;
      const maintenanceCount = state.robots.filter(r => r.status === 'Mantenimiento').length;
      const stoppedCount = state.robots.filter(r => r.status === 'Detenido').length;

      chartStatusPieInstance = new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
          labels: ['Activos (Normal)', 'Alarmas Activas', 'Mantenimiento', 'Detenidos'],
          datasets: [{
            data: [activeNormalCount, alarmCount, maintenanceCount, stoppedCount],
            backgroundColor: [
              INDUSTRIAL_COLORS.normal,      // Azul para operación normal
              INDUSTRIAL_COLORS.alarm,       // Rojo para alarmas
              INDUSTRIAL_COLORS.maintenance, // Amarillo para mantenimiento
              INDUSTRIAL_COLORS.stopped      // Gris neutro para detenidos
            ],
            borderColor: '#0f172a',
            borderWidth: 3,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 12,
                font: { size: 11, weight: '500' }
              }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.label}: ${ctx.raw} robots (${Math.round((ctx.raw / (state.robots.length || 1)) * 100)}%)`
              }
            }
          }
        }
      });
    }

    // 4. Gráfica de línea: Tendencia de Temperatura en el tiempo
    const ctxHistory = document.getElementById('chartHistoryLine')?.getContext('2d');
    if (ctxHistory) {
      // Configuración de colores industriales por robot en la línea
      const getLineColor = (robot) => {
        if (robot.temp > state.config.tempThreshold) return INDUSTRIAL_COLORS.alarm; // Rojo
        if (robot.status === 'Mantenimiento') return INDUSTRIAL_COLORS.maintenance; // Amarillo
        const blueShades = {
          'RS-01': '#3b82f6',
          'RS-02': '#60a5fa',
          'RS-04': '#0284c7',
          'RS-05': '#2563eb',
          'RS-09': '#38bdf8'
        };
        return blueShades[robot.id] || INDUSTRIAL_COLORS.normal; // Azul
      };

      // Robots representativos para seguir en tiempo real
      const trackedRobots = state.robots.filter(r => ['RS-01', 'RS-02', 'RS-04', 'RS-06', 'RS-07', 'RS-08'].includes(r.id));

      const lineDatasets = trackedRobots.map(r => ({
        label: `${r.id} (${r.status})`,
        data: state.history.series[r.id] || [],
        borderColor: getLineColor(r),
        backgroundColor: 'transparent',
        borderWidth: r.temp > state.config.tempThreshold ? 3 : 2,
        tension: 0.35,
        pointRadius: r.temp > state.config.tempThreshold ? 4 : 2,
        pointHoverRadius: 6
      }));

      // Agregar dataset para la línea límite de 400°C (Rojo punteado)
      lineDatasets.push({
        label: 'Umbral Alarma (400°C)',
        data: state.history.labels.map(() => state.config.tempThreshold),
        borderColor: '#ef4444',
        borderWidth: 1.8,
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false
      });

      chartHistoryLineInstance = new Chart(ctxHistory, {
        type: 'line',
        data: {
          labels: state.history.labels,
          datasets: lineDatasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: {
                boxWidth: 10,
                font: { size: 10 }
              }
            }
          },
          scales: {
            y: {
              min: 0,
              max: 480,
              grid: { color: 'rgba(148, 163, 184, 0.08)' },
              ticks: { font: { family: "'JetBrains Mono', monospace" } }
            },
            x: {
              grid: { color: 'rgba(148, 163, 184, 0.05)' },
              ticks: { font: { family: "'JetBrains Mono', monospace", size: 10 } }
            }
          }
        }
      });
    }
  }

  // ==========================================================================
  // GESTIÓN DE KPIS: CONECTADO AUTOMÁTICAMENTE A LA TABLA ROBOTS SOLDADORES
  // ==========================================================================
  let lastKpis = { total: 0, activos: 0, detenidos: 0, alarmas: 0 };

  function renderKPIs(forcePulse = false) {
    // CÁLCULO AUTOMÁTICO DIRECTO DESDE LOS REGISTROS DE LA TABLA
    const tableData = state.robots;

    // 1. Total de Robots (Conteo de filas de la tabla)
    const total = tableData.length;

    // 2. Robots Activos (Conteo de filas con Estado = 'Activo')
    const activos = tableData.filter(r => r.status === 'Activo').length;

    // 3. Robots Detenidos (Conteo de filas con Estado = 'Detenido')
    const detenidos = tableData.filter(r => r.status === 'Detenido').length;

    // 4. Alarmas Activas (Calculadas según las 4 reglas operativas del Módulo de Alertas)
    const activeAlerts = computeActiveAlerts();
    const alarmasActivas = activeAlerts.length;
    const criticasCount = activeAlerts.filter(a => a.severity === 'Crítica').length;
    const advCount = activeAlerts.filter(a => a.severity === 'Advertencia').length;
    const infoCount = activeAlerts.filter(a => a.severity === 'Informativa').length;

    const inAlarmRobots = tableData.filter(r => 
      r.temp > state.config.tempThreshold || 
      r.current > state.config.currentThreshold ||
      (r.alarm && r.alarm.includes('>'))
    );

    // Elementos DOM de los Indicadores del Dashboard
    const kpiTotal = document.getElementById('kpiTotalRobots');
    const kpiTotalBadge = document.getElementById('kpiTotalBadge');
    const kpiActive = document.getElementById('kpiActiveRobots');
    const kpiActivePct = document.getElementById('kpiActivePercent');
    const kpiStopped = document.getElementById('kpiStoppedRobots');
    const kpiStoppedBadge = document.getElementById('kpiStoppedBadge');
    const kpiAlarms = document.getElementById('kpiActiveAlarms');
    const kpiAlarmsCard = document.getElementById('kpiAlarmsCard');
    const kpiAlarmStatusBadge = document.getElementById('kpiAlarmStatusBadge');
    const kpiAlarmSubtext = document.getElementById('kpiAlarmSubtext');
    const alarmsCountBadge = document.getElementById('alarmsCountBadge');
    const robotsCountBadge = document.getElementById('robotsCountBadge');
    const totalFleetPill = document.getElementById('totalFleetPill');

    // Helper para actualizar valor y aplicar pulso visual cuando hay cambio
    const setValWithPulse = (el, val, changed) => {
      if (!el) return;
      el.textContent = val;
      if (changed || forcePulse) {
        el.classList.remove('kpi-val-pulse');
        void el.offsetWidth;
        el.classList.add('kpi-val-pulse');
      }
    };

    setValWithPulse(kpiTotal, total, total !== lastKpis.total);
    setValWithPulse(kpiActive, activos, activos !== lastKpis.activos);
    setValWithPulse(kpiStopped, detenidos, detenidos !== lastKpis.detenidos);
    setValWithPulse(kpiAlarms, alarmasActivas, alarmasActivas !== lastKpis.alarmas);

    lastKpis = { total, activos, detenidos, alarmas: alarmasActivas };

    if (kpiTotalBadge) kpiTotalBadge.textContent = `${total} Unidades`;
    if (kpiActivePct) kpiActivePct.textContent = `${Math.round((activos / (total || 1)) * 100)}% Disponibilidad`;
    if (kpiStoppedBadge) kpiStoppedBadge.textContent = `${detenidos} en Reposo`;
    if (totalFleetPill) totalFleetPill.textContent = `Flota: ${total}`;
    if (robotsCountBadge) robotsCountBadge.textContent = total;

    if (alarmsCountBadge) {
      alarmsCountBadge.textContent = alarmasActivas;
      if (criticasCount > 0) {
        alarmsCountBadge.className = 'nav-badge badge-danger has-alarms';
      } else if (alarmasActivas > 0) {
        alarmsCountBadge.className = 'nav-badge badge-warning has-alarms';
      } else {
        alarmsCountBadge.className = 'nav-badge';
        alarmsCountBadge.classList.remove('has-alarms');
      }
    }

    if (kpiAlarmsCard && kpiAlarmStatusBadge && kpiAlarmSubtext) {
      if (alarmasActivas > 0) {
        if (criticasCount > 0) {
          kpiAlarmsCard.classList.add('alarm-flashing');
          kpiAlarmStatusBadge.textContent = `${alarmasActivas} Activas`;
          kpiAlarmStatusBadge.className = 'badge-tag tag-danger';
        } else {
          kpiAlarmsCard.classList.remove('alarm-flashing');
          kpiAlarmStatusBadge.textContent = `${alarmasActivas} Activas`;
          kpiAlarmStatusBadge.className = 'badge-tag tag-warning';
        }
        kpiAlarmSubtext.innerHTML = `<i class="fa-solid fa-bell text-red"></i> ${criticasCount} Crítica • ${advCount} Adv • ${infoCount} Info`;
      } else {
        kpiAlarmsCard.classList.remove('alarm-flashing');
        kpiAlarmStatusBadge.textContent = '0 Activas';
        kpiAlarmStatusBadge.className = 'badge-tag tag-success';
        kpiAlarmSubtext.innerHTML = `<i class="fa-solid fa-shield-check text-green"></i> Parámetros en rango seguro`;
      }
    }

    // Actualizar tablas de alertas en tiempo real
    renderAlertsTables();

    // Gestionar Banner de Alerta Crítica
    manageCriticalBanner(inAlarmRobots);
  }

  // ==========================================================================
  // GESTIÓN DEL BANNER Y NOTIFICACIONES DE ALARMA
  // ==========================================================================
  function manageCriticalBanner(inAlarmRobots) {
    const banner = document.getElementById('criticalBanner');
    const bannerDetails = document.getElementById('bannerDetails');
    const notifIndicator = document.getElementById('notifIndicator');

    if (!banner || !bannerDetails) return;

    if (inAlarmRobots.length > 0) {
      const msgs = inAlarmRobots.map(r => {
        const issues = [];
        if (r.temp > state.config.tempThreshold) issues.push(`Temp: ${r.temp}°C (>400°C)`);
        if (r.current > state.config.currentThreshold) issues.push(`Corriente: ${r.current}A (>140A)`);
        return `${r.id} (${issues.join(', ')})`;
      });

      bannerDetails.textContent = `Atención inmediata: ${msgs.join(' | ')}`;
      banner.style.display = 'flex';
      if (notifIndicator) notifIndicator.style.display = 'block';

      // Disparar sonido si está configurado
      playAlarmSound();

      // Registrar evento en el historial de alarmas si no está ya registrado
      inAlarmRobots.forEach(r => registerAlarmEvent(r));
    } else {
      banner.style.display = 'none';
      if (notifIndicator) notifIndicator.style.display = 'none';
    }
  }

  function registerAlarmEvent(robot) {
    const reasons = [];
    let severity = 'Crítica';
    let valStr = '';
    let thresholdStr = '';

    if (robot.temp > state.config.tempThreshold) {
      reasons.push('Sobrecalentamiento Térmico');
      valStr += `${robot.temp}°C `;
      thresholdStr += `>${state.config.tempThreshold}°C `;
    }
    if (robot.current > state.config.currentThreshold) {
      reasons.push('Sobrecarga de Corriente');
      valStr += `${robot.current}A `;
      thresholdStr += `>${state.config.currentThreshold}A `;
    }

    // Comprobar si ya existe una alarma activa idéntica sin resolver
    const existing = state.alarms.find(a => a.robotId === robot.id && a.status === 'Activa');
    if (!existing) {
      const newAlarm = {
        id: 'ALM-' + Math.floor(1000 + Math.random() * 9000),
        time: formatDateTime(),
        robotId: robot.id,
        area: robot.area,
        type: reasons.join(' / '),
        value: valStr.trim(),
        threshold: thresholdStr.trim(),
        severity: severity,
        status: 'Activa'
      };

      state.alarms.unshift(newAlarm);
      renderAlarmsLog();
      updateNotificationsDropdown();
    }
  }

  // Reproductor de sonido SCADA sintético (Web Audio API)
  function playAlarmSound() {
    if (!state.config.audioAlert) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(440, now + 0.1);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      // Audio no permitido o silenciado
    }
  }

  // ==========================================================================
  // TABLA: ROBOTS SOLDADORES (Colección de 10 Robots)
  // ==========================================================================
  function renderRobotsTable() {
    const tbody = document.getElementById('robotsTableBody');
    const showingCount = document.getElementById('showingCount');
    if (!tbody) return;

    // Filtros por búsqueda, área y estado
    const filtered = state.robots.filter(r => {
      const matchArea = state.filterArea === 'all' || r.area === state.filterArea;
      const matchStatus = state.filterStatus === 'all' || r.status === state.filterStatus;
      const q = state.searchQuery.toLowerCase();
      const matchSearch = r.id.toLowerCase().includes(q) ||
                          r.area.toLowerCase().includes(q) ||
                          r.status.toLowerCase().includes(q) ||
                          r.alarm.toLowerCase().includes(q);
      return matchArea && matchStatus && matchSearch;
    });

    if (showingCount) showingCount.textContent = filtered.length;

    tbody.innerHTML = '';

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 24px; color: var(--text-muted);">No se encontraron robots que coincidan con los filtros seleccionados.</td></tr>`;
      return;
    }

    filtered.forEach(robot => {
      const tr = document.createElement('tr');
      const isOverTemp = robot.temp > state.config.tempThreshold;
      const isOverCurrent = robot.current > state.config.currentThreshold;
      const isAlarm = isOverTemp || isOverCurrent;

      if (isAlarm) {
        tr.classList.add('row-alarm');
      }

      // Estilo de Estado
      let statusBadgeClass = 'status-active';
      let statusIcon = 'fa-circle-check';

      if (isAlarm) {
        statusBadgeClass = 'status-alarm';
        statusIcon = 'fa-triangle-exclamation';
      } else if (robot.status === 'Detenido') {
        statusBadgeClass = 'status-stopped';
        statusIcon = 'fa-circle-pause';
      } else if (robot.status === 'Mantenimiento') {
        statusBadgeClass = 'status-maintenance';
        statusIcon = 'fa-wrench';
      }

      // Estilo de Alarma
      let alarmClass = 'alarm-none';
      let alarmIcon = 'fa-check';
      if (isAlarm) {
        alarmClass = 'alarm-critical';
        alarmIcon = 'fa-triangle-exclamation';
      } else if (robot.status === 'Mantenimiento') {
        alarmClass = 'alarm-maint';
        alarmIcon = 'fa-wrench';
      } else if (robot.alarm !== 'Ninguna') {
        alarmClass = 'alarm-warn';
        alarmIcon = 'fa-circle-info';
      }

      tr.innerHTML = `
        <td class="robot-id-cell">
          <i class="fa-solid fa-robot"></i>
          <span>${robot.id}</span>
        </td>
        <td>${robot.area}</td>
        <td>
          <span class="status-badge ${statusBadgeClass} clickable-badge" onclick="window.cycleRobotStatus('${robot.id}')" title="Clic para alternar Estado (Activo / Detenido / Mantenimiento) y recalcular KPIs">
            <i class="fa-solid ${statusIcon}"></i>
            ${robot.status}
          </span>
        </td>
        <td class="metric-cell ${isOverTemp ? 'metric-warning' : (robot.temp > 0 ? 'metric-active' : '')}">
          ${robot.temp} °C ${isOverTemp ? '<i class="fa-solid fa-fire text-red" title="Excede 400°C"></i>' : ''}
        </td>
        <td class="metric-cell ${isOverCurrent ? 'metric-warning' : (robot.current > 0 ? 'metric-active' : '')}">
          ${robot.current} A ${isOverCurrent ? '<i class="fa-solid fa-bolt text-red" title="Excede 140A"></i>' : ''}
        </td>
        <td class="metric-cell">${robot.hours.toLocaleString()} hrs</td>
        <td>
          <span class="alarm-cell-badge ${alarmClass}" title="${robot.alarm}">
            <i class="fa-solid ${alarmIcon}"></i>
            ${robot.alarm}
          </span>
        </td>
        <td>
          <span class="time-real-badge" style="font-size: 0.72rem;">
            <span class="time-real-dot"></span>
            ${robot.lastUpdate}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn-table-action" onclick="window.cycleRobotStatus('${robot.id}')" title="Alternar Estado y Recalcular Indicadores">
              <i class="fa-solid fa-arrows-rotate"></i>
            </button>
            <button class="btn-table-action" onclick="window.inspectRobot('${robot.id}')" title="Ver y controlar parámetros">
              <i class="fa-solid fa-sliders"></i> Control
            </button>
          </div>
        </td>
      `;

      tbody.appendChild(tr);
    });
  }

  // ==========================================================================
  // VISTA ROBOTS: TARJETAS DETALLADAS Y BANCO DE PRUEBAS
  // ==========================================================================
  function renderRobotsDetailGrid() {
    const grid = document.getElementById('robotsDetailGrid');
    if (!grid) return;

    grid.innerHTML = '';

    state.robots.forEach(robot => {
      const isOverTemp = robot.temp > state.config.tempThreshold;
      const isOverCurrent = robot.current > state.config.currentThreshold;
      const isAlarm = isOverTemp || isOverCurrent;

      const card = document.createElement('div');
      card.className = `robot-detail-card ${isAlarm ? 'card-in-alarm' : ''}`;

      const tempPct = Math.min(100, Math.round((robot.temp / 500) * 100));
      const currentPct = Math.min(100, Math.round((robot.current / 200) * 100));

      let badgeClass = 'status-active';
      if (isAlarm) badgeClass = 'status-alarm';
      else if (robot.status === 'Detenido') badgeClass = 'status-stopped';
      else if (robot.status === 'Mantenimiento') badgeClass = 'status-maintenance';

      card.innerHTML = `
        <div class="robot-card-top">
          <div class="robot-card-title-group">
            <div class="robot-avatar">
              <i class="fa-solid fa-robot"></i>
            </div>
            <div>
              <div class="robot-title-id">${robot.id}</div>
              <div class="robot-title-area">${robot.area} • ${robot.weldCycle}</div>
            </div>
          </div>
          <div>
            <span class="status-badge ${badgeClass}">
              ${isAlarm ? 'ALERTA' : robot.status}
            </span>
          </div>
        </div>

        <div class="robot-gauges-row">
          <div class="gauge-box">
            <div class="gauge-header">
              <span>Temperatura</span>
              <span>Límite: ${state.config.tempThreshold}°C</span>
            </div>
            <div class="gauge-value ${isOverTemp ? 'text-red' : 'text-cyan'}">${robot.temp} °C</div>
            <div class="gauge-progress-bar">
              <div class="gauge-fill fill-temp ${isOverTemp ? 'critical' : ''}" style="width: ${tempPct}%"></div>
            </div>
          </div>

          <div class="gauge-box">
            <div class="gauge-header">
              <span>Corriente</span>
              <span>Límite: ${state.config.currentThreshold}A</span>
            </div>
            <div class="gauge-value ${isOverCurrent ? 'text-red' : 'text-yellow'}">${robot.current} A</div>
            <div class="gauge-progress-bar">
              <div class="gauge-fill fill-current ${isOverCurrent ? 'critical' : ''}" style="width: ${currentPct}%"></div>
            </div>
          </div>
        </div>

        <!-- Banco de Pruebas Manual / Sliders -->
        <div class="slider-control-group">
          <div class="slider-label">
            <span>Ajuste Manual Temp (°C):</span>
            <strong id="valTempSlider_${robot.id}">${robot.temp}°C</strong>
          </div>
          <input type="range" class="industrial-slider" min="0" max="480" value="${robot.temp}" 
            oninput="window.updateRobotManual('${robot.id}', 'temp', this.value)">

          <div class="slider-label" style="margin-top: 10px;">
            <span>Ajuste Manual Corriente (A):</span>
            <strong id="valCurrSlider_${robot.id}">${robot.current}A</strong>
          </div>
          <input type="range" class="industrial-slider" min="0" max="180" value="${robot.current}" 
            oninput="window.updateRobotManual('${robot.id}', 'current', this.value)">
        </div>

        <div class="robot-card-actions">
          <button class="btn btn-sm ${robot.status === 'Activo' ? 'btn-secondary' : 'btn-primary'}" 
            onclick="window.toggleRobotState('${robot.id}')">
            <i class="fa-solid ${robot.status === 'Activo' ? 'fa-pause' : 'fa-play'}"></i>
            ${robot.status === 'Activo' ? 'Pausar' : 'Encender'}
          </button>
          <button class="btn btn-sm btn-secondary" onclick="window.resetRobotNominal('${robot.id}')">
            <i class="fa-solid fa-arrows-rotate"></i> Nominal
          </button>
        </div>
      `;

      grid.appendChild(card);
    });
  }

  // ==========================================================================
  // MÓDULO DE ALERTAS: EVALUACIÓN DE LAS 4 REGLAS OPERACIONALES
  // ==========================================================================
  function computeActiveAlerts() {
    const alerts = [];

    state.robots.forEach(robot => {
      const timeStr = robot.lastUpdate || formatDateTime();

      // Regla 1: Si la temperatura es mayor a 400°C -> Mostrar alerta crítica en color rojo
      if (robot.temp > 400) {
        alerts.push({
          id: `ALT-TEMP-${robot.id}`,
          time: timeStr,
          robotId: robot.id,
          type: 'Sobrecalentamiento Térmico (>400°C)',
          severity: 'Crítica',
          severityClass: 'severity-critica',
          rowClass: 'alert-row-critica',
          badgeColor: '#ef4444',
          status: 'Activa',
          statusBadgeClass: 'status-alarm',
          detail: `Temperatura registrada: ${robot.temp}°C (Límite crítico: 400°C)`
        });
      }

      // Regla 2: Si la corriente es mayor a 140 A -> Mostrar alerta preventiva en color amarillo
      if (robot.current > 140) {
        alerts.push({
          id: `ALT-CURR-${robot.id}`,
          time: timeStr,
          robotId: robot.id,
          type: 'Sobrecarga de Corriente (>140A)',
          severity: 'Advertencia',
          severityClass: 'severity-advertencia',
          rowClass: 'alert-row-advertencia',
          badgeColor: '#f59e0b',
          status: 'Activa',
          statusBadgeClass: 'status-maintenance',
          detail: `Corriente de arco registrada: ${robot.current}A (Límite operativo: 140A)`
        });
      }

      // Regla 3: Si el estado es "Detenido" -> Mostrar alerta de mantenimiento (Color amarillo)
      if (robot.status === 'Detenido') {
        alerts.push({
          id: `ALT-STOP-${robot.id}`,
          time: timeStr,
          robotId: robot.id,
          type: 'Alerta de Mantenimiento',
          severity: 'Advertencia',
          severityClass: 'severity-advertencia',
          rowClass: 'alert-row-advertencia',
          badgeColor: '#f59e0b',
          status: 'Activa',
          statusBadgeClass: 'status-stopped',
          detail: `Robot detenido en línea (${robot.area}) - Diagnóstico o reactivación requerida`
        });
      }

      // Regla 4: Si el estado es "Mantenimiento" -> Mostrar recordatorio de inspección (Color azul)
      if (robot.status === 'Mantenimiento') {
        alerts.push({
          id: `ALT-MAINT-${robot.id}`,
          time: timeStr,
          robotId: robot.id,
          type: 'Recordatorio de Inspección',
          severity: 'Informativa',
          severityClass: 'severity-informativa',
          rowClass: 'alert-row-informativa',
          badgeColor: '#2563eb',
          status: 'Activa',
          statusBadgeClass: 'status-active',
          detail: `Protocolo de mantenimiento programado e inspección periódica en curso (${robot.area})`
        });
      }
    });

    state.activeAlerts = alerts;
    return alerts;
  }

  // ==========================================================================
  // RENDERIZADO DE TABLAS "ALERTAS ACTIVAS" (PANTALLA PRINCIPAL Y MÓDULO)
  // ==========================================================================
  function renderAlertsTables() {
    const alerts = state.activeAlerts || [];

    const criticas = alerts.filter(a => a.severity === 'Crítica').length;
    const advertencias = alerts.filter(a => a.severity === 'Advertencia').length;
    const informativas = alerts.filter(a => a.severity === 'Informativa').length;

    // Actualizar contadores en la cabecera de la sección en pantalla principal
    const countCritMain = document.getElementById('countCriticasMain');
    const countAdvMain = document.getElementById('countAdvertenciasMain');
    const countInfoMain = document.getElementById('countInformativasMain');
    const totalAlertsMain = document.getElementById('totalAlertsCountMain');

    if (countCritMain) countCritMain.textContent = criticas;
    if (countAdvMain) countAdvMain.textContent = advertencias;
    if (countInfoMain) countInfoMain.textContent = informativas;
    if (totalAlertsMain) totalAlertsMain.textContent = alerts.length;

    // Actualizar contadores de filtros en el Módulo de Alertas
    const countModAll = document.getElementById('countModuleFilterAll');
    const countModCrit = document.getElementById('countModuleFilterCritica');
    const countModAdv = document.getElementById('countModuleFilterAdv');
    const countModInfo = document.getElementById('countModuleFilterInfo');
    const moduleAlertsTotal = document.getElementById('moduleAlertsTotal');

    if (countModAll) countModAll.textContent = alerts.length;
    if (countModCrit) countModCrit.textContent = criticas;
    if (countModAdv) countModAdv.textContent = advertencias;
    if (countModInfo) countModInfo.textContent = informativas;
    if (moduleAlertsTotal) moduleAlertsTotal.textContent = alerts.length;

    // Helper para generar el icono y formato de fila
    const buildRowHtml = (alert) => {
      let iconHtml = '<i class="fa-solid fa-circle-info text-blue"></i>';
      if (alert.severity === 'Crítica') iconHtml = '<i class="fa-solid fa-circle-exclamation text-red"></i>';
      else if (alert.severity === 'Advertencia') iconHtml = '<i class="fa-solid fa-triangle-exclamation text-yellow"></i>';

      return `
        <td style="font-family: var(--font-mono); font-size: 0.8rem; white-space: nowrap;">
          <i class="fa-regular fa-clock" style="color: var(--text-muted); margin-right: 6px;"></i>${alert.time}
        </td>
        <td class="robot-id-cell" style="cursor: pointer;" onclick="window.inspectRobotDetail('${alert.robotId}')" title="Ver parámetros de ${alert.robotId}">
          <i class="fa-solid fa-robot"></i> <strong>${alert.robotId}</strong>
        </td>
        <td>
          <strong style="color: var(--text-pure); font-size: 0.86rem;">${alert.type}</strong>
          <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 3px;">${alert.detail}</div>
        </td>
        <td>
          <span class="severity-pill ${alert.severityClass}">
            ${iconHtml} ${alert.severity}
          </span>
        </td>
        <td>
          <span class="status-badge ${alert.statusBadgeClass}">
            <i class="fa-solid fa-circle-dot"></i> ${alert.status}
          </span>
        </td>
      `;
    };

    // 1. RENDERIZAR TABLA EN PANTALLA PRINCIPAL (#tablaAlertasActivasMain)
    const tbodyMain = document.getElementById('alertasActivasMainTbody');
    if (tbodyMain) {
      if (alerts.length === 0) {
        tbodyMain.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 26px; color: var(--text-muted);"><i class="fa-solid fa-circle-check text-green" style="font-size: 1.2rem; margin-right: 8px;"></i> Todas las variables operativas en rango normal. Cero alertas activas.</td></tr>`;
      } else {
        tbodyMain.innerHTML = '';
        alerts.forEach(alert => {
          const tr = document.createElement('tr');
          tr.className = alert.rowClass;
          tr.innerHTML = buildRowHtml(alert);
          tbodyMain.appendChild(tr);
        });
      }
    }

    // 2. RENDERIZAR TABLA EN MÓDULO DE ALERTAS (#tablaAlertasActivasModulo)
    const tbodyModulo = document.getElementById('alertasActivasModuloTbody');
    if (tbodyModulo) {
      const filteredAlerts = alerts.filter(a => {
        if (!state.alertFilterSeverity || state.alertFilterSeverity === 'all') return true;
        return a.severity === state.alertFilterSeverity;
      });

      if (filteredAlerts.length === 0) {
        tbodyModulo.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 26px; color: var(--text-muted);"><i class="fa-solid fa-circle-check text-green" style="font-size: 1.2rem; margin-right: 8px;"></i> No hay alertas que coincidan con la severidad seleccionada.</td></tr>`;
      } else {
        tbodyModulo.innerHTML = '';
        filteredAlerts.forEach(alert => {
          const tr = document.createElement('tr');
          tr.className = alert.rowClass;
          tr.innerHTML = buildRowHtml(alert);
          tbodyModulo.appendChild(tr);
        });
      }
    }

    // Actualizar el dropdown de notificaciones en la barra superior
    updateNotificationsDropdown();
  }

  // Compatibilidad hacia atrás
  function renderAlarmsLog() {
    renderAlertsTables();
  }

  // Actualizar menú desplegable de notificaciones
  function updateNotificationsDropdown() {
    const list = document.getElementById('notifList');
    if (!list) return;

    const activeAlerts = state.activeAlerts || [];
    if (activeAlerts.length === 0) {
      list.innerHTML = `<div class="notif-empty"><i class="fa-solid fa-circle-check text-green"></i> No hay alertas activas en el sistema.</div>`;
      return;
    }

    list.innerHTML = '';
    activeAlerts.slice(0, 6).forEach(a => {
      const item = document.createElement('div');
      item.className = `notif-item ${a.severity === 'Crítica' ? 'critical' : ''}`;
      
      let iconColor = 'text-blue';
      if (a.severity === 'Crítica') iconColor = 'text-red';
      else if (a.severity === 'Advertencia') iconColor = 'text-yellow';

      item.innerHTML = `
        <i class="fa-solid fa-bell ${iconColor} notif-item-icon"></i>
        <div class="notif-item-body">
          <div class="notif-item-title">${a.robotId}: ${a.type}</div>
          <div style="font-size: 0.74rem; color: var(--text-muted);">${a.detail}</div>
          <div class="notif-item-time">${a.time} • Severidad: <strong>${a.severity}</strong></div>
        </div>
      `;
      list.appendChild(item);
    });
  }

  // ==========================================================================
  // PANTALLA EJECUTIVA DE REPORTES: INICIALIZACIÓN DE GRÁFICAS
  // ==========================================================================
  function initReportCharts() {
    // 1. Top 5 robots con más horas de operación (Barras horizontales)
    const ctxTopHours = document.getElementById('chartTopHours')?.getContext('2d');
    if (ctxTopHours) {
      chartTopHoursInstance = new Chart(ctxTopHours, {
        type: 'bar',
        data: {
          labels: [],
          datasets: [{
            label: 'Horas de Operación',
            data: [],
            backgroundColor: [
              'rgba(6, 182, 212, 0.85)',
              'rgba(14, 165, 233, 0.85)',
              'rgba(37, 99, 235, 0.85)',
              'rgba(59, 130, 246, 0.85)',
              'rgba(99, 102, 241, 0.85)'
            ],
            borderColor: '#06b6d4',
            borderWidth: 1.5,
            borderRadius: 6
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` Horas de Operación: ${ctx.parsed.x.toLocaleString()} hrs`
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: { color: 'rgba(148, 163, 184, 0.08)' },
              ticks: { font: { family: "'JetBrains Mono', monospace" } }
            },
            y: {
              grid: { display: false },
              ticks: { font: { weight: 'bold', size: 11 } }
            }
          }
        }
      });
    }

    // 2. Top 5 robots con más alertas
    const ctxTopAlarms = document.getElementById('chartTopAlarms')?.getContext('2d');
    if (ctxTopAlarms) {
      chartTopAlarmsInstance = new Chart(ctxTopAlarms, {
        type: 'bar',
        data: {
          labels: [],
          datasets: [{
            label: 'Total de Alertas',
            data: [],
            backgroundColor: [
              'rgba(239, 68, 68, 0.85)',
              'rgba(244, 63, 94, 0.85)',
              'rgba(245, 158, 11, 0.85)',
              'rgba(251, 191, 36, 0.85)',
              'rgba(217, 119, 6, 0.85)'
            ],
            borderColor: '#ef4444',
            borderWidth: 1.5,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` Alertas Registradas: ${ctx.parsed.y} eventos`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1, font: { family: "'JetBrains Mono', monospace" } },
              grid: { color: 'rgba(148, 163, 184, 0.08)' }
            },
            x: {
              grid: { display: false },
              ticks: { font: { weight: 'bold', size: 11 } }
            }
          }
        }
      });
    }

    // 3. Temperatura promedio por área
    const ctxAvgTempArea = document.getElementById('chartAvgTempArea')?.getContext('2d');
    if (ctxAvgTempArea) {
      chartAvgTempAreaInstance = new Chart(ctxAvgTempArea, {
        type: 'bar',
        data: {
          labels: ['Línea A', 'Línea B', 'Línea C', 'Línea D'],
          datasets: [{
            label: 'Temperatura Promedio (°C)',
            data: [0, 0, 0, 0],
            backgroundColor: 'rgba(37, 99, 235, 0.75)',
            borderColor: '#3b82f6',
            borderWidth: 1.5,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` Temp Promedio: ${ctx.parsed.y} °C`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 450,
              grid: { color: 'rgba(148, 163, 184, 0.08)' },
              ticks: { font: { family: "'JetBrains Mono', monospace" } }
            },
            x: {
              grid: { display: false },
              ticks: { font: { weight: 'bold', size: 11 } }
            }
          }
        }
      });
    }

    // 4. Estado operativo por área (Barras apiladas)
    const ctxStatusArea = document.getElementById('chartStatusArea')?.getContext('2d');
    if (ctxStatusArea) {
      chartStatusAreaInstance = new Chart(ctxStatusArea, {
        type: 'bar',
        data: {
          labels: ['Línea A', 'Línea B', 'Línea C', 'Línea D'],
          datasets: [
            {
              label: 'Activo',
              data: [0, 0, 0, 0],
              backgroundColor: '#2563eb', // Azul
              borderRadius: 4
            },
            {
              label: 'Detenido',
              data: [0, 0, 0, 0],
              backgroundColor: '#64748b', // Gris
              borderRadius: 4
            },
            {
              label: 'Mantenimiento',
              data: [0, 0, 0, 0],
              backgroundColor: '#f59e0b', // Amarillo
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: { boxWidth: 10, font: { size: 10 } }
            }
          },
          scales: {
            x: {
              stacked: true,
              grid: { display: false },
              ticks: { font: { weight: 'bold', size: 11 } }
            },
            y: {
              stacked: true,
              beginAtZero: true,
              ticks: { stepSize: 1, font: { family: "'JetBrains Mono', monospace" } },
              grid: { color: 'rgba(148, 163, 184, 0.08)' }
            }
          }
        }
      });
    }
  }

  // ==========================================================================
  // GENERACIÓN Y FILTRADO DEL REPORTE EJECUTIVO (6 KPIS Y 4 GRÁFICAS)
  // ==========================================================================
  function generateExecutiveReport(forcePulse = false) {
    const robotFilter = document.getElementById('rptRobotFilter')?.value || 'all';
    const areaFilter = document.getElementById('rptAreaFilter')?.value || 'all';

    // 1. Filtrar conjunto de robots
    let filtered = state.robots.filter(r => {
      if (robotFilter !== 'all' && r.id !== robotFilter) return false;
      if (areaFilter !== 'all' && r.area !== areaFilter) return false;
      return true;
    });

    if (filtered.length === 0) {
      filtered = state.robots; // Fallback para evitar división por cero
    }

    // 2. Conteo de alertas por robot (asociadas al conjunto filtrado)
    const alertCountByRobot = {};
    filtered.forEach(r => { alertCountByRobot[r.id] = 0; });

    (state.activeAlerts || []).forEach(a => {
      if (alertCountByRobot[a.robotId] !== undefined) {
        alertCountByRobot[a.robotId]++;
      }
    });

    // 3. CALCULAR LOS 6 INDICADORES EJECUTIVOS (KPIS)
    // KPI 1: Temperatura promedio de la planta
    const activeWithTemp = filtered.filter(r => r.temp > 0);
    const avgTemp = activeWithTemp.length > 0 
      ? Math.round(activeWithTemp.reduce((sum, r) => sum + r.temp, 0) / activeWithTemp.length) 
      : 0;

    // KPI 2: Corriente promedio de operación
    const activeWithCurrent = filtered.filter(r => r.current > 0);
    const avgCurrent = activeWithCurrent.length > 0 
      ? (activeWithCurrent.reduce((sum, r) => sum + r.current, 0) / activeWithCurrent.length).toFixed(1) 
      : '0.0';

    // KPI 3: Total de horas de operación acumuladas
    const totalHours = filtered.reduce((sum, r) => sum + (r.hours || 0), 0);

    // KPI 4: Total de alarmas generadas
    const totalAlarms = Object.values(alertCountByRobot).reduce((sum, c) => sum + c, 0);

    // KPI 5: Robot con mayor tiempo de operación
    const sortedByHours = [...filtered].sort((a, b) => (b.hours || 0) - (a.hours || 0));
    const maxHoursRobot = sortedByHours[0] || null;

    // KPI 6: Robot con mayor número de alertas
    const sortedByAlarms = [...filtered].sort((a, b) => (alertCountByRobot[b.id] || 0) - (alertCountByRobot[a.id] || 0));
    const maxAlarmsRobot = sortedByAlarms[0] || null;
    const maxAlarmsCount = maxAlarmsRobot ? (alertCountByRobot[maxAlarmsRobot.id] || 0) : 0;

    // 4. ACTUALIZAR DOM DE LOS 6 KPIS CON EFECTO VISUAL
    const setRptKpi = (id, text) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.textContent = text;
      if (forcePulse) {
        el.classList.remove('kpi-val-pulse');
        void el.offsetWidth;
        el.classList.add('kpi-val-pulse');
      }
    };

    setRptKpi('rptKpiAvgTemp', `${avgTemp} °C`);
    setRptKpi('rptKpiAvgCurrent', `${avgCurrent} A`);
    setRptKpi('rptKpiTotalHours', `${totalHours.toLocaleString()} hrs`);
    setRptKpi('rptKpiTotalAlarms', `${totalAlarms}`);
    setRptKpi('rptKpiMaxHoursRobot', maxHoursRobot ? maxHoursRobot.id : 'N/A');
    setRptKpi('rptKpiMaxAlarmsRobot', maxAlarmsRobot ? maxAlarmsRobot.id : 'N/A');

    const maxHoursValEl = document.getElementById('rptKpiMaxHoursVal');
    if (maxHoursValEl && maxHoursRobot) {
      maxHoursValEl.innerHTML = `<i class="fa-solid fa-clock"></i> ${maxHoursRobot.hours.toLocaleString()} hrs • ${maxHoursRobot.area.replace('Soldadura ', '')}`;
    }

    const maxAlarmsValEl = document.getElementById('rptKpiMaxAlarmsVal');
    if (maxAlarmsValEl && maxAlarmsRobot) {
      maxAlarmsValEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${maxAlarmsCount} Alerta(s) registrada(s)`;
    }

    const alarmsSubEl = document.getElementById('rptKpiAlarmsSub');
    if (alarmsSubEl) {
      const criticas = (state.activeAlerts || []).filter(a => a.severity === 'Crítica' && filtered.some(r => r.id === a.robotId)).length;
      const advs = (state.activeAlerts || []).filter(a => a.severity === 'Advertencia' && filtered.some(r => r.id === a.robotId)).length;
      alarmsSubEl.innerHTML = `<i class="fa-solid fa-bell"></i> ${criticas} Crítica • ${advs} Advertencias`;
    }

    const rptTableCountBadge = document.getElementById('rptTableCountBadge');
    if (rptTableCountBadge) {
      rptTableCountBadge.textContent = `${filtered.length} Robots Analizados`;
    }

    // 5. ACTUALIZAR LAS 4 VISUALIZACIONES INDUSTRIALES
    // Gráfica 1: Top 5 robots con más horas de operación
    if (chartTopHoursInstance) {
      const top5Hours = [...filtered].sort((a, b) => (b.hours || 0) - (a.hours || 0)).slice(0, 5);
      chartTopHoursInstance.data.labels = top5Hours.map(r => r.id);
      chartTopHoursInstance.data.datasets[0].data = top5Hours.map(r => r.hours);
      chartTopHoursInstance.update('none');
    }

    // Gráfica 2: Top 5 robots con más alertas
    if (chartTopAlarmsInstance) {
      const top5Alarms = [...filtered]
        .map(r => ({ id: r.id, count: alertCountByRobot[r.id] || 0 }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      chartTopAlarmsInstance.data.labels = top5Alarms.map(r => r.id);
      chartTopAlarmsInstance.data.datasets[0].data = top5Alarms.map(r => r.count);
      chartTopAlarmsInstance.update('none');
    }

    // Gráfica 3: Temperatura promedio por área
    const areaNames = ['Soldadura Línea A', 'Soldadura Línea B', 'Soldadura Línea C', 'Soldadura Línea D'];
    const avgTemps = areaNames.map(area => {
      const robs = filtered.filter(r => r.area === area && r.temp > 0);
      if (robs.length === 0) return 0;
      return Math.round(robs.reduce((sum, r) => sum + r.temp, 0) / robs.length);
    });

    if (chartAvgTempAreaInstance) {
      chartAvgTempAreaInstance.data.labels = ['Línea A', 'Línea B', 'Línea C', 'Línea D'];
      chartAvgTempAreaInstance.data.datasets[0].data = avgTemps;
      chartAvgTempAreaInstance.data.datasets[0].backgroundColor = avgTemps.map(t => t > 400 ? 'rgba(239, 68, 68, 0.85)' : 'rgba(37, 99, 235, 0.85)');
      chartAvgTempAreaInstance.update('none');
    }

    // Gráfica 4: Estado operativo por área
    if (chartStatusAreaInstance) {
      const activeCounts = areaNames.map(area => filtered.filter(r => r.area === area && r.status === 'Activo').length);
      const stoppedCounts = areaNames.map(area => filtered.filter(r => r.area === area && r.status === 'Detenido').length);
      const maintCounts = areaNames.map(area => filtered.filter(r => r.area === area && r.status === 'Mantenimiento').length);

      chartStatusAreaInstance.data.labels = ['Línea A', 'Línea B', 'Línea C', 'Línea D'];
      chartStatusAreaInstance.data.datasets[0].data = activeCounts;
      chartStatusAreaInstance.data.datasets[1].data = stoppedCounts;
      chartStatusAreaInstance.data.datasets[2].data = maintCounts;
      chartStatusAreaInstance.update('none');
    }

    // 6. RENDERIZAR TABLA DE RESUMEN EJECUTIVO PARA AUDITORÍA
    const tbody = document.getElementById('reportTableBody');
    if (tbody) {
      tbody.innerHTML = '';
      filtered.forEach(r => {
        const tr = document.createElement('tr');
        const alertCount = alertCountByRobot[r.id] || 0;
        const availability = r.status === 'Activo' ? '98.5%' : (r.status === 'Mantenimiento' ? '72.0%' : '84.0%');

        let statusBadgeHtml = '<span class="status-badge status-active"><i class="fa-solid fa-play"></i> Activo</span>';
        if (r.status === 'Detenido') statusBadgeHtml = '<span class="status-badge status-stopped"><i class="fa-solid fa-pause"></i> Detenido</span>';
        else if (r.status === 'Mantenimiento') statusBadgeHtml = '<span class="status-badge status-maintenance"><i class="fa-solid fa-wrench"></i> Mantenimiento</span>';

        let alertBadge = '<span class="badge-tag">0 Alertas</span>';
        if (alertCount > 0) {
          alertBadge = `<span class="severity-pill severity-critica"><i class="fa-solid fa-bell"></i> ${alertCount} Alertas</span>`;
        }

        tr.innerHTML = `
          <td class="robot-id-cell"><i class="fa-solid fa-robot"></i> <strong>${r.id}</strong></td>
          <td>${r.area}</td>
          <td>${statusBadgeHtml}</td>
          <td style="font-family: var(--font-mono); font-weight: 600; color: ${r.temp > 400 ? 'var(--status-alarm)' : 'var(--text-pure)'};">${r.temp > 0 ? r.temp + ' °C' : 'Reposo'}</td>
          <td style="font-family: var(--font-mono); font-weight: 600; color: ${r.current > 140 ? 'var(--status-alarm)' : 'var(--text-pure)'};">${r.current > 0 ? r.current + ' A' : '0 A'}</td>
          <td style="font-family: var(--font-mono);">${r.hours.toLocaleString()} hrs</td>
          <td>${alertBadge}</td>
          <td style="font-family: var(--font-mono); color: var(--cyan-accent); font-weight: 600;">${availability}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  }

  // Compatibilidad hacia atrás
  function renderReports() {
    generateExecutiveReport();
  }

  // ==========================================================================
  // EXPORTACIÓN A EXCEL (CSV CON METADATOS Y BOM)
  // ==========================================================================
  function exportReportToExcel() {
    const startDate = document.getElementById('rptStartDate')?.value || '2026-10-01';
    const endDate = document.getElementById('rptEndDate')?.value || '2026-10-03';
    const robotFilter = document.getElementById('rptRobotFilter')?.value || 'all';
    const areaFilter = document.getElementById('rptAreaFilter')?.value || 'all';

    let filtered = state.robots.filter(r => {
      if (robotFilter !== 'all' && r.id !== robotFilter) return false;
      if (areaFilter !== 'all' && r.area !== areaFilter) return false;
      return true;
    });

    if (filtered.length === 0) filtered = state.robots;

    const activeWithTemp = filtered.filter(r => r.temp > 0);
    const avgTemp = activeWithTemp.length > 0 ? Math.round(activeWithTemp.reduce((sum, r) => sum + r.temp, 0) / activeWithTemp.length) : 0;
    const activeWithCurrent = filtered.filter(r => r.current > 0);
    const avgCurrent = activeWithCurrent.length > 0 ? (activeWithCurrent.reduce((sum, r) => sum + r.current, 0) / activeWithCurrent.length).toFixed(1) : '0.0';
    const totalHours = filtered.reduce((sum, r) => sum + (r.hours || 0), 0);
    const alertsForFiltered = (state.activeAlerts || []).filter(a => filtered.some(r => r.id === a.robotId));
    const maxHoursRobot = [...filtered].sort((a, b) => (b.hours || 0) - (a.hours || 0))[0];

    const alertCountByRobot = {};
    filtered.forEach(r => { alertCountByRobot[r.id] = 0; });
    (state.activeAlerts || []).forEach(a => {
      if (alertCountByRobot[a.robotId] !== undefined) alertCountByRobot[a.robotId]++;
    });
    const sortedByAlarms = Object.keys(alertCountByRobot).sort((a, b) => alertCountByRobot[b] - alertCountByRobot[a]);
    const maxAlarmRobotId = sortedByAlarms[0] || 'N/A';
    const maxAlarmCount = maxAlarmRobotId !== 'N/A' ? alertCountByRobot[maxAlarmRobotId] : 0;

    let csv = '\uFEFF'; // BOM para compatibilidad con Microsoft Excel
    csv += 'SISTEMA DE MONITOREO DE ROBOTS SOLDADORES - INDUSTRIA 4.0\n';
    csv += 'REPORTE EJECUTIVO DE OPERACIONES\n';
    csv += `Fecha y Hora de Emisión,"${formatDateTime()}"\n`;
    csv += `Rango de Fechas,"${startDate} a ${endDate}"\n`;
    csv += `Filtro Robot,"${robotFilter}"\n`;
    csv += `Filtro Área,"${areaFilter}"\n\n`;

    csv += 'INDICADORES CLAVE DE DESEMPEÑO (KPIS)\n';
    csv += 'Indicador,Valor,Unidad,Estado Operacional\n';
    csv += `Temperatura Promedio de la Planta,${avgTemp},°C,Nominal < 400°C\n`;
    csv += `Corriente Promedio de Operación,${avgCurrent},A,Rango Seguro 110-135A\n`;
    csv += `Total de Horas de Operación Acumuladas,${totalHours},hrs,Servicio Flota\n`;
    csv += `Total de Alarmas Generadas,${alertsForFiltered.length},eventos,Supervisión SCADA\n`;
    csv += `Robot con Mayor Tiempo de Operación,"${maxHoursRobot ? maxHoursRobot.id + ' (' + maxHoursRobot.hours.toLocaleString() + ' hrs)' : 'N/A'}",hrs,Líder Operativo\n`;
    csv += `Robot con Mayor Número de Alertas,"${maxAlarmRobotId} (${maxAlarmCount} Alertas)",alertas,Atención Prioritaria\n\n`;

    csv += 'RESUMEN DETALLADO POR ROBOT SOLDADOR\n';
    csv += 'ID Robot,Área,Estado,Horas Operativas,Temperatura (°C),Corriente (A),Alertas Asociadas,Disponibilidad OEE,Última Lectura\n';
    filtered.forEach(r => {
      const alarmsCount = alertCountByRobot[r.id] || 0;
      const disp = r.status === 'Activo' ? '98.5%' : (r.status === 'Mantenimiento' ? '72.0%' : '84.0%');
      csv += `"${r.id}","${r.area}","${r.status}",${r.hours},${r.temp},${r.current},${alarmsCount},"${disp}","${r.lastUpdate}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    link.setAttribute('href', url);
    link.setAttribute('download', `Reporte_Ejecutivo_Robots_Soldadores_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ==========================================================================
  // EXPORTACIÓN A PDF (IMPRESIÓN EJECUTIVA OPTIMIZADA)
  // ==========================================================================
  function exportReportToPDF() {
    if (state.currentView !== 'reportes') {
      switchView('reportes');
    }
    generateExecutiveReport();
    setTimeout(() => {
      window.print();
    }, 250);
  }

  // ==========================================================================
  // MOTOR DE SIMULACIÓN EN TIEMPO REAL
  // ==========================================================================
  function startSimulation() {
    if (state.simTimer) clearInterval(state.simTimer);

    state.simTimer = setInterval(() => {
      if (!state.isSimulating) return;

      const currentTimestamp = formatDateTime();

      // 1. Aplicar fluctuación física realista a robots activos
      state.robots.forEach(r => {
        if (r.status === 'Activo') {
          const tempDelta = (Math.random() - 0.5) * 4;
          const currentDelta = (Math.random() - 0.5) * 3;

          r.temp = Math.max(20, Math.round(r.temp + tempDelta));
          r.current = Math.max(0, Math.round((r.current + currentDelta) * 10) / 10);
          r.lastUpdate = currentTimestamp;

          // Actualizar texto de alarma dinámica
          const isOverT = r.temp > state.config.tempThreshold;
          const isOverC = r.current > state.config.currentThreshold;

          if (isOverT && isOverC) {
            r.alarm = 'Sobrecalentamiento (>400°C) y Sobrecarga (>140A)';
          } else if (isOverT) {
            r.alarm = 'Sobrecalentamiento (>400°C)';
          } else if (isOverC) {
            r.alarm = 'Sobrecarga de Corriente (>140A)';
          } else {
            r.alarm = 'Ninguna';
          }

          // Si el auto-cool está habilitado y superó los 400°C hace rato, enfriar gradualmente
          if (state.config.autoCool && r.temp > 400 && Math.random() > 0.6) {
            r.temp -= 15;
          }
          if (state.config.autoCool && r.current > 140 && Math.random() > 0.6) {
            r.current -= 10;
          }
        }
      });

      // 2. Actualizar Historial de Gráficas de Línea
      const nowStr = new Date().toLocaleTimeString('es-MX', { hour12: false, minute: '2-digit', second: '2-digit' });
      state.history.labels.push(nowStr);
      if (state.history.labels.length > 12) {
        state.history.labels.shift();
      }

      state.robots.forEach(r => {
        state.history.series[r.id].push(r.temp);
        if (state.history.series[r.id].length > 12) {
          state.history.series[r.id].shift();
        }
      });

      // 3. Refrescar Gráficos
      updateCharts();

      // 4. Refrescar KPIs y Tablas
      renderKPIs();
      renderRobotsTable();
      if (state.currentView === 'robots') {
        renderRobotsDetailGrid();
      }
      if (state.currentView === 'reportes') {
        generateExecutiveReport();
      }
    }, state.config.intervalMs);
  }

  function updateCharts() {
    // 1. Actualizar Gráfica de Barras de Temperatura (10 robots)
    if (chartTempBarInstance) {
      chartTempBarInstance.data.labels = state.robots.map(r => r.id);
      chartTempBarInstance.data.datasets[0].data = state.robots.map(r => r.temp);
      chartTempBarInstance.data.datasets[0].backgroundColor = state.robots.map(r => getBarColorForRobot(r, 'temp'));
      chartTempBarInstance.data.datasets[0].borderColor = state.robots.map(r => getBarBorderForRobot(r, 'temp'));
      chartTempBarInstance.update('none');
    }

    // 2. Actualizar Gráfica de Barras de Corriente (10 robots)
    if (chartCurrentBarInstance) {
      chartCurrentBarInstance.data.labels = state.robots.map(r => r.id);
      chartCurrentBarInstance.data.datasets[0].data = state.robots.map(r => r.current);
      chartCurrentBarInstance.data.datasets[0].backgroundColor = state.robots.map(r => getBarColorForRobot(r, 'current'));
      chartCurrentBarInstance.data.datasets[0].borderColor = state.robots.map(r => getBarBorderForRobot(r, 'current'));
      chartCurrentBarInstance.update('none');
    }

    // 3. Actualizar Gráfica de Pastel (Distribución del Estado de los Robots)
    if (chartStatusPieInstance) {
      const activeNormalCount = state.robots.filter(r => r.status === 'Activo' && r.temp <= state.config.tempThreshold && r.current <= state.config.currentThreshold).length;
      const alarmCount = state.robots.filter(r => r.temp > state.config.tempThreshold || r.current > state.config.currentThreshold).length;
      const maintenanceCount = state.robots.filter(r => r.status === 'Mantenimiento').length;
      const stoppedCount = state.robots.filter(r => r.status === 'Detenido').length;

      chartStatusPieInstance.data.datasets[0].data = [activeNormalCount, alarmCount, maintenanceCount, stoppedCount];
      chartStatusPieInstance.data.datasets[0].backgroundColor = [
        INDUSTRIAL_COLORS.normal,      // Azul para operación normal
        INDUSTRIAL_COLORS.alarm,       // Rojo para alarmas
        INDUSTRIAL_COLORS.maintenance, // Amarillo para mantenimiento
        INDUSTRIAL_COLORS.stopped      // Gris neutro para detenidos
      ];
      chartStatusPieInstance.update('none');
    }

    // 4. Actualizar Gráfica de Líneas de Historial
    if (chartHistoryLineInstance) {
      chartHistoryLineInstance.data.labels = state.history.labels;
      chartHistoryLineInstance.data.datasets.forEach((ds) => {
        const robotId = ds.label ? ds.label.split(' ')[0] : '';
        if (state.history.series[robotId]) {
          ds.data = state.history.series[robotId];
          const robot = state.robots.find(r => r.id === robotId);
          if (robot) {
            if (robot.temp > state.config.tempThreshold) {
              ds.borderColor = INDUSTRIAL_COLORS.alarm;
              ds.borderWidth = 3;
            } else if (robot.status === 'Mantenimiento') {
              ds.borderColor = INDUSTRIAL_COLORS.maintenance;
              ds.borderWidth = 2;
            }
          }
        } else if (ds.label && ds.label.includes('Umbral')) {
          ds.data = state.history.labels.map(() => state.config.tempThreshold);
        }
      });
      chartHistoryLineInstance.update('none');
    }
  }

  // ==========================================================================
  // EVENT LISTENERS & RUTAS DE NAVEGACIÓN
  // ==========================================================================
  function setupEventListeners() {
    // Cambio de Vistas en el Sidebar
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = item.getAttribute('data-view');
        switchView(targetView);
      });
    });

    // Colapsar / Expandir Sidebar
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebar = document.getElementById('sidebar');
    if (sidebarToggleBtn && sidebar) {
      sidebarToggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });
    }

    // Menú Móvil
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn && sidebar) {
      mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }

    // Pausar / Reanudar Simulación
    const btnToggleSim = document.getElementById('btnToggleSim');
    const simIcon = document.getElementById('simIcon');
    const simText = document.getElementById('simText');
    if (btnToggleSim) {
      btnToggleSim.addEventListener('click', () => {
        state.isSimulating = !state.isSimulating;
        if (state.isSimulating) {
          simIcon.className = 'fa-solid fa-pause';
          simText.textContent = 'Simulación Activa';
          btnToggleSim.classList.remove('btn-warning-outline');
          btnToggleSim.classList.add('btn-secondary');
        } else {
          simIcon.className = 'fa-solid fa-play';
          simText.textContent = 'Simulación Pausada';
          btnToggleSim.classList.remove('btn-secondary');
          btnToggleSim.classList.add('btn-warning-outline');
        }
      });
    }

    // Inyectar Falla de Prueba (>400°C y >140A)
    const btnInjectFault = document.getElementById('btnInjectFault');
    const btnTestAlarmTrigger = document.getElementById('btnTestAlarmTrigger');

    const triggerFaultTest = () => {
      const targetRobot = state.robots.find(r => r.id === 'RS-02') || state.robots[0];
      targetRobot.status = 'Activo';
      targetRobot.temp = 418;
      targetRobot.current = 149;
      targetRobot.alarm = 'Sobrecalentamiento (>400°C) y Sobrecarga (>140A)';
      targetRobot.lastUpdate = formatDateTime();

      renderKPIs();
      renderRobotsTable();
      renderRobotsDetailGrid();
      updateCharts();
    };

    if (btnInjectFault) btnInjectFault.addEventListener('click', triggerFaultTest);
    if (btnTestAlarmTrigger) btnTestAlarmTrigger.addEventListener('click', triggerFaultTest);

    // Botón Ver en Alarmas desde el banner
    const btnGoToAlarms = document.getElementById('btnGoToAlarms');
    if (btnGoToAlarms) {
      btnGoToAlarms.addEventListener('click', () => {
        switchView('alarmas');
      });
    }

    // Cerrar Banner
    const btnCloseBanner = document.getElementById('btnCloseBanner');
    const criticalBanner = document.getElementById('criticalBanner');
    if (btnCloseBanner && criticalBanner) {
      btnCloseBanner.addEventListener('click', () => {
        criticalBanner.style.display = 'none';
      });
    }

    // Filtros de Severidad en Módulo de Alertas
    ['btnFilterAll', 'btnFilterCritica', 'btnFilterAdv', 'btnFilterInfo'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          document.querySelectorAll('#view-alarmas .alarm-filters .btn-filter').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.alertFilterSeverity = btn.getAttribute('data-filter') || 'all';
          renderAlertsTables();
        });
      }
    });

    // Botón Refrescar Alertas en Módulo
    const btnRefreshAlerts = document.getElementById('btnRefreshAlerts');
    if (btnRefreshAlerts) {
      btnRefreshAlerts.addEventListener('click', () => {
        computeActiveAlerts();
        renderAlertsTables();
        renderKPIs(true);
      });
    }

    // Dropdown Notificaciones
    const notifBtn = document.getElementById('notifBtn');
    const notifDropdown = document.getElementById('notificationsDropdown');
    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('show');
      });
      document.addEventListener('click', () => {
        notifDropdown.classList.remove('show');
      });
      notifDropdown.addEventListener('click', (e) => e.stopPropagation());
    }

    const btnClearNotifs = document.getElementById('btnClearNotifs');
    if (btnClearNotifs) {
      btnClearNotifs.addEventListener('click', () => {
        const notifList = document.getElementById('notifList');
        if (notifList) notifList.innerHTML = `<div class="notif-empty">Alertas limpiadas.</div>`;
        const notifIndicator = document.getElementById('notifIndicator');
        if (notifIndicator) notifIndicator.style.display = 'none';
      });
    }

    // Buscador en Tabla
    const searchInput = document.getElementById('tableSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderRobotsTable();
      });
    }

    // Filtro por Área en Tabla
    const areaFilter = document.getElementById('areaFilter');
    if (areaFilter) {
      areaFilter.addEventListener('change', (e) => {
        state.filterArea = e.target.value;
        renderRobotsTable();
      });
    }

    // Filtro por Estado en Tabla
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        state.filterStatus = e.target.value;
        renderRobotsTable();
      });
    }

    // Botón refrescar tabla
    const btnRefreshTable = document.getElementById('btnRefreshTable');
    if (btnRefreshTable) {
      btnRefreshTable.addEventListener('click', () => {
        renderRobotsTable();
        renderKPIs(true);
      });
    }

    // Modal: Agregar Nuevo Robot Soldador
    const btnOpenAddRobotModal = document.getElementById('btnOpenAddRobotModal');
    const addRobotModal = document.getElementById('addRobotModal');
    const btnCloseAddRobotModal = document.getElementById('btnCloseAddRobotModal');
    const btnCancelAddRobot = document.getElementById('btnCancelAddRobot');
    const addRobotForm = document.getElementById('addRobotForm');
    const newRobotId = document.getElementById('newRobotId');

    if (btnOpenAddRobotModal && addRobotModal) {
      btnOpenAddRobotModal.addEventListener('click', () => {
        if (newRobotId) {
          // Generar ID sugerido automáticamente (ej: RS-11)
          const nextNum = state.robots.length + 1;
          newRobotId.value = `RS-${nextNum < 10 ? '0' + nextNum : nextNum}`;
        }
        addRobotModal.style.display = 'flex';
      });
    }

    const closeAddModal = () => {
      if (addRobotModal) addRobotModal.style.display = 'none';
    };

    if (btnCloseAddRobotModal) btnCloseAddRobotModal.addEventListener('click', closeAddModal);
    if (btnCancelAddRobot) btnCancelAddRobot.addEventListener('click', closeAddModal);

    if (addRobotForm) {
      addRobotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const idVal = document.getElementById('newRobotId').value.trim();
        const areaVal = document.getElementById('newRobotArea').value;
        const statusVal = document.getElementById('newRobotStatus').value;
        const hoursVal = Number(document.getElementById('newRobotHours').value) || 0;
        const tempVal = Number(document.getElementById('newRobotTemp').value) || 0;
        const currentVal = Number(document.getElementById('newRobotCurrent').value) || 0;

        // Validar que no exista el ID
        if (state.robots.some(r => r.id.toLowerCase() === idVal.toLowerCase())) {
          alert(`El ID "${idVal}" ya existe en la tabla Robots Soldadores. Utilice otro ID.`);
          return;
        }

        let initialAlarm = 'Ninguna';
        if (tempVal > state.config.tempThreshold && currentVal > state.config.currentThreshold) {
          initialAlarm = 'Sobrecalentamiento (>400°C) y Sobrecarga (>140A)';
        } else if (tempVal > state.config.tempThreshold) {
          initialAlarm = 'Sobrecalentamiento (>400°C)';
        } else if (currentVal > state.config.currentThreshold) {
          initialAlarm = 'Sobrecarga de Corriente (>140A)';
        } else if (statusVal === 'Mantenimiento') {
          initialAlarm = 'Mantenimiento Preventivo';
        } else if (statusVal === 'Detenido') {
          initialAlarm = 'Detenido en Standby';
        }

        const newRobot = {
          id: idVal,
          area: areaVal,
          status: statusVal,
          temp: tempVal,
          current: currentVal,
          hours: hoursVal,
          alarm: initialAlarm,
          lastUpdate: formatDateTime(),
          weldCycle: 'Proceso Calibrado',
          gasFlow: 18.0,
          targetTemp: tempVal,
          targetCurrent: currentVal
        };

        // Agregar a la colección de la tabla
        state.robots.push(newRobot);
        state.history.series[newRobot.id] = [];

        // RECALCULAR AUTOMÁTICAMENTE TODOS LOS INDICADORES
        renderKPIs(true);
        renderRobotsTable();
        renderRobotsDetailGrid();
        renderReports();
        updateCharts();

        closeAddModal();
        addRobotForm.reset();
      });
    }

    // Botón Exportar JSON
    const btnExportJSON = document.getElementById('btnExportJSON');
    if (btnExportJSON) {
      btnExportJSON.addEventListener('click', exportCollectionJSON);
    }

    // Filtros en Centro de Alarmas
    document.querySelectorAll('.alarm-filters .btn-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.alarm-filters .btn-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.alarmFilter = btn.getAttribute('data-filter');
        renderAlarmsLog();
      });
    });

    // Limpiar alarmas resueltas
    const btnClearResolved = document.getElementById('btnClearResolvedAlarms');
    if (btnClearResolved) {
      btnClearResolved.addEventListener('click', () => {
        state.alarms = state.alarms.filter(a => a.status === 'Activa');
        renderAlarmsLog();
      });
    }

    // Acciones Masivas Flota
    const btnStartAll = document.getElementById('btnStartAll');
    if (btnStartAll) {
      btnStartAll.addEventListener('click', () => {
        state.robots.forEach(r => {
          if (r.status !== 'Mantenimiento') {
            r.status = 'Activo';
            if (r.temp < 100) r.temp = 350;
            if (r.current === 0) r.current = 120;
          }
        });
        renderKPIs();
        renderRobotsTable();
        renderRobotsDetailGrid();
        updateCharts();
      });
    }

    const btnStopAll = document.getElementById('btnStopAll');
    if (btnStopAll) {
      btnStopAll.addEventListener('click', () => {
        state.robots.forEach(r => {
          if (r.status !== 'Mantenimiento') {
            r.status = 'Detenido';
            r.temp = 25;
            r.current = 0;
            r.alarm = 'Detenido por Operador';
          }
        });
        renderKPIs();
        renderRobotsTable();
        renderRobotsDetailGrid();
        updateCharts();
      });
    }

    // Botones de la Pantalla Ejecutiva de Reportes
    const btnGenerarReporte = document.getElementById('btnGenerarReporte');
    if (btnGenerarReporte) {
      btnGenerarReporte.addEventListener('click', () => {
        generateExecutiveReport(true);
      });
    }

    const btnExportarPDF = document.getElementById('btnExportarPDF');
    if (btnExportarPDF) {
      btnExportarPDF.addEventListener('click', () => {
        exportReportToPDF();
      });
    }

    const btnExportarExcel = document.getElementById('btnExportarExcel');
    if (btnExportarExcel) {
      btnExportarExcel.addEventListener('click', () => {
        exportReportToExcel();
      });
    }

    // Auto-actualización al cambiar filtros del reporte
    ['rptStartDate', 'rptEndDate', 'rptRobotFilter', 'rptAreaFilter'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', () => {
          generateExecutiveReport(false);
        });
      }
    });

    // Exportar CSV Antiguo (Compatibilidad)
    const btnExportCSV = document.getElementById('btnExportCSV');
    if (btnExportCSV) {
      btnExportCSV.addEventListener('click', exportReportToExcel);
    }

    // Imprimir Reporte Antiguo (Compatibilidad)
    const btnPrintReport = document.getElementById('btnPrintReport');
    if (btnPrintReport) {
      btnPrintReport.addEventListener('click', exportReportToPDF);
    }

    // Guardar Configuración
    const btnSaveConfig = document.getElementById('btnSaveConfig');
    if (btnSaveConfig) {
      btnSaveConfig.addEventListener('click', () => {
        const tempInp = document.getElementById('cfgTempThreshold');
        const currInp = document.getElementById('cfgCurrentThreshold');
        const intervalInp = document.getElementById('cfgInterval');
        const audioInp = document.getElementById('cfgAudioAlert');
        const autoCoolInp = document.getElementById('cfgAutoCool');

        if (tempInp) state.config.tempThreshold = Number(tempInp.value);
        if (currInp) state.config.currentThreshold = Number(currInp.value);
        if (intervalInp) {
          state.config.intervalMs = Number(intervalInp.value);
          startSimulation();
        }
        if (audioInp) state.config.audioAlert = audioInp.checked;
        if (autoCoolInp) state.config.autoCool = autoCoolInp.checked;

        alert('✅ Parámetros SCADA actualizados correctamente.');
        renderKPIs();
        renderRobotsTable();
        renderRobotsDetailGrid();
      });
    }

    // Restablecer Configuración
    const btnResetConfig = document.getElementById('btnResetConfig');
    if (btnResetConfig) {
      btnResetConfig.addEventListener('click', () => {
        state.config.tempThreshold = 400;
        state.config.currentThreshold = 140;
        state.config.intervalMs = 2500;
        state.config.audioAlert = true;
        state.config.autoCool = true;

        document.getElementById('cfgTempThreshold').value = 400;
        document.getElementById('cfgCurrentThreshold').value = 140;
        document.getElementById('cfgInterval').value = 2500;
        document.getElementById('cfgAudioAlert').checked = true;
        document.getElementById('cfgAutoCool').checked = true;

        startSimulation();
        renderKPIs();
        renderRobotsTable();
      });
    }

    // Cerrar Modal
    const btnCloseModal = document.getElementById('btnCloseModal');
    const modal = document.getElementById('robotModal');
    if (btnCloseModal && modal) {
      btnCloseModal.addEventListener('click', () => {
        modal.style.display = 'none';
      });
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
      });
    }
  }

  // ==========================================================================
  // CAMBIO DE VISTAS (SPA ROUTING)
  // ==========================================================================
  function switchView(viewName) {
    state.currentView = viewName;

    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const targetSec = document.getElementById(`view-${viewName}`);
    if (targetSec) {
      targetSec.classList.add('active');
    }

    const titles = {
      dashboard: 'Dashboard de Supervisión',
      robots: 'Gestión y Control de Flota de Robots',
      alarmas: 'Módulo de Alertas - Reglas y Eventos',
      reportes: 'Reportes y Analítica Operativa',
      configuracion: 'Configuración SCADA y Parámetros'
    };

    const titleEl = document.getElementById('currentViewTitle');
    if (titleEl && titles[viewName]) {
      titleEl.textContent = titles[viewName];
    }

    if (viewName === 'robots') renderRobotsDetailGrid();
    if (viewName === 'alarmas') {
      computeActiveAlerts();
      renderAlertsTables();
    }
    if (viewName === 'reportes') renderReports();
  }

  // Funciones de navegación global
  window.scrollToAlertsSection = function() {
    if (state.currentView !== 'dashboard') {
      switchView('dashboard');
    }
    setTimeout(() => {
      const el = document.getElementById('seccion-alertas-activas');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.remove('kpi-val-pulse');
        void el.offsetWidth;
        el.classList.add('kpi-val-pulse');
      }
    }, 60);
  };

  window.navigateToAlertsModule = function() {
    switchView('alarmas');
  };

  // ==========================================================================
  // EXPORTAR COLECCIÓN JSON (Robots Soldadores)
  // ==========================================================================
  function exportCollectionJSON() {
    const collectionData = state.robots.map(r => ({
      ID_Robot: r.id,
      Area: r.area,
      Estado: r.status,
      Temperatura: r.temp,
      Corriente: r.current,
      Horas_Operacion: r.hours,
      Alarma: r.alarm,
      Fecha_Actualizacion: r.lastUpdate
    }));

    const jsonStr = JSON.stringify(collectionData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Robots_Soldadores_Coleccion_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ==========================================================================
  // EXPORTAR REPORTE CSV
  // ==========================================================================
  function exportTelemetryCSV() {
    let csv = 'ID_Robot,Area,Estado,Temperatura,Corriente,Horas_Operacion,Alarma,Fecha_Actualizacion\n';
    state.robots.forEach(r => {
      csv += `"${r.id}","${r.area}","${r.status}",${r.temp},${r.current},${r.hours},"${r.alarm}","${r.lastUpdate}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Robots_Soldadores_Reporte_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ==========================================================================
  // FUNCIONES GLOBALES EN WINDOW
  // ==========================================================================
  
  // Encender / Pausar Robot Individual
  window.toggleRobotState = function(robotId) {
    const robot = state.robots.find(r => r.id === robotId);
    if (!robot) return;

    if (robot.status === 'Activo') {
      robot.status = 'Detenido';
      robot.temp = 24;
      robot.current = 0;
      robot.alarm = 'Detenido en Standby';
    } else {
      robot.status = 'Activo';
      robot.temp = robot.targetTemp || 350;
      robot.current = robot.targetCurrent || 120;
      robot.alarm = 'Ninguna';
    }

    robot.lastUpdate = formatDateTime();

    renderKPIs();
    renderRobotsTable();
    renderRobotsDetailGrid();
    updateCharts();
  };

  // Ajuste manual de slider (Banco de Pruebas de Sobrecarga / Simulación)
  window.updateRobotManual = function(robotId, param, val) {
    const robot = state.robots.find(r => r.id === robotId);
    if (!robot) return;

    const numVal = Number(val);
    if (param === 'temp') {
      robot.temp = numVal;
      const label = document.getElementById(`valTempSlider_${robotId}`);
      if (label) label.textContent = `${numVal}°C`;
    } else if (param === 'current') {
      robot.current = numVal;
      const label = document.getElementById(`valCurrSlider_${robotId}`);
      if (label) label.textContent = `${numVal}A`;
    }

    if (numVal > 50) {
      robot.status = 'Activo';
    }

    robot.lastUpdate = formatDateTime();

    renderKPIs();
    renderRobotsTable();
    updateCharts();
  };

  // Restablecer valores nominales estándar
  window.resetRobotNominal = function(robotId) {
    const defaults = {
      'RS-01': { temp: 350, current: 120, status: 'Activo', alarm: 'Ninguna' },
      'RS-02': { temp: 365, current: 125, status: 'Activo', alarm: 'Ninguna' },
      'RS-03': { temp: 24, current: 0, status: 'Detenido', alarm: 'Ninguna' },
      'RS-04': { temp: 355, current: 118, status: 'Activo', alarm: 'Ninguna' },
      'RS-05': { temp: 372, current: 128, status: 'Activo', alarm: 'Ninguna' },
      'RS-06': { temp: 22, current: 0, status: 'Mantenimiento', alarm: 'Mantenimiento Preventivo' },
      'RS-07': { temp: 358, current: 122, status: 'Activo', alarm: 'Ninguna' },
      'RS-08': { temp: 360, current: 124, status: 'Activo', alarm: 'Ninguna' },
      'RS-09': { temp: 348, current: 115, status: 'Activo', alarm: 'Ninguna' },
      'RS-10': { temp: 25, current: 0, status: 'Detenido', alarm: 'En Espera de Material' }
    };

    const robot = state.robots.find(r => r.id === robotId);
    if (robot && defaults[robotId]) {
      robot.temp = defaults[robotId].temp;
      robot.current = defaults[robotId].current;
      robot.status = defaults[robotId].status;
      robot.alarm = defaults[robotId].alarm;
      robot.lastUpdate = formatDateTime();

      state.alarms.forEach(a => {
        if (a.robotId === robotId && a.status === 'Activa') {
          a.status = 'Resuelta';
        }
      });

      renderKPIs();
      renderRobotsTable();
      renderRobotsDetailGrid();
      renderAlarmsLog();
      updateCharts();
    }
  };

  // Despejar Alarma Manualmente
  window.resolveAlarm = function(alarmId) {
    const alarm = state.alarms.find(a => a.id === alarmId);
    if (alarm) {
      alarm.status = 'Resuelta';
      const robot = state.robots.find(r => r.id === alarm.robotId);
      if (robot) {
        if (robot.temp > state.config.tempThreshold) robot.temp = 360;
        if (robot.current > state.config.currentThreshold) robot.current = 122;
        robot.alarm = 'Ninguna';
        robot.lastUpdate = formatDateTime();
      }
      renderKPIs();
      renderRobotsTable();
      renderRobotsDetailGrid();
      renderAlarmsLog();
      updateNotificationsDropdown();
      updateCharts();
    }
  };

  // Modal Inspector de Robot
  window.inspectRobot = function(robotId) {
    const robot = state.robots.find(r => r.id === robotId);
    const modal = document.getElementById('robotModal');
    const modalId = document.getElementById('modalRobotId');
    const modalArea = document.getElementById('modalRobotArea');
    const modalBody = document.getElementById('modalRobotBody');

    if (!robot || !modal) return;

    modalId.textContent = `Robot ${robot.id}`;
    modalArea.textContent = `${robot.area} • Proceso: ${robot.weldCycle}`;

    const isAlarm = robot.temp > state.config.tempThreshold || robot.current > state.config.currentThreshold;

    let modalBadge = 'status-active';
    if (isAlarm) modalBadge = 'status-alarm';
    else if (robot.status === 'Detenido') modalBadge = 'status-stopped';
    else if (robot.status === 'Mantenimiento') modalBadge = 'status-maintenance';

    modalBody.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
        <div class="gauge-box">
          <div class="gauge-header"><span>Estado Operativo</span></div>
          <div style="font-size: 1.1rem; font-weight: 700; margin-top: 4px;">
            <span class="status-badge ${modalBadge}">
              ${isAlarm ? 'EN ALARMA' : robot.status}
            </span>
          </div>
        </div>
        <div class="gauge-box">
          <div class="gauge-header"><span>Horas de Servicio</span></div>
          <div class="gauge-value" style="font-size: 1.1rem; color: var(--cyan-accent);">${robot.hours.toLocaleString()} hrs</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
        <div class="gauge-box">
          <div class="gauge-header"><span>Temperatura Actual</span></div>
          <div class="gauge-value ${robot.temp > state.config.tempThreshold ? 'text-red' : 'text-cyan'}">${robot.temp} °C</div>
          <small style="color: var(--text-muted);">Umbral Crítico: >400 °C</small>
        </div>
        <div class="gauge-box">
          <div class="gauge-header"><span>Corriente Actual</span></div>
          <div class="gauge-value ${robot.current > state.config.currentThreshold ? 'text-red' : 'text-yellow'}">${robot.current} A</div>
          <small style="color: var(--text-muted);">Umbral Crítico: >140 A</small>
        </div>
      </div>

      <div style="background: var(--bg-card); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 20px;">
        <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); margin-bottom: 6px;">TELEMETRÍA Y ALARMAS</div>
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 4px 0;">
          <span>Estado de Alarma:</span>
          <strong style="color: ${isAlarm ? 'var(--status-alarm)' : 'var(--status-active)'};">${robot.alarm}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 4px 0;">
          <span>Última Actualización:</span>
          <strong style="font-family: var(--font-mono); color: var(--text-pure);">${robot.lastUpdate}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 4px 0;">
          <span>Flujo de Gas Protector:</span>
          <strong style="font-family: var(--font-mono); color: var(--cyan-accent);">${robot.gasFlow} L/min</strong>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn-outline-danger btn-sm" onclick="window.deleteRobot('${robot.id}'); document.getElementById('robotModal').style.display='none';" title="Eliminar de la tabla Robots Soldadores">
          <i class="fa-solid fa-trash"></i> Eliminar
        </button>
        <button class="btn btn-secondary btn-sm" onclick="window.resetRobotNominal('${robot.id}'); document.getElementById('robotModal').style.display='none';">
          <i class="fa-solid fa-arrows-rotate"></i> Nominal
        </button>
        <button class="btn ${robot.status === 'Activo' ? 'btn-warning-outline' : 'btn-primary'} btn-sm" onclick="window.toggleRobotState('${robot.id}'); document.getElementById('robotModal').style.display='none';">
          ${robot.status === 'Activo' ? 'Detener Robot' : 'Poner en Marcha'}
        </button>
      </div>
    `;

    modal.style.display = 'flex';
  };

  // Alternar Estado de un Robot (Activo -> Detenido -> Mantenimiento -> Activo)
  window.cycleRobotStatus = function(robotId) {
    const robot = state.robots.find(r => r.id === robotId);
    if (!robot) return;

    if (robot.status === 'Activo') {
      robot.status = 'Detenido';
      robot.temp = 24;
      robot.current = 0;
      robot.alarm = 'Detenido en Standby';
    } else if (robot.status === 'Detenido') {
      robot.status = 'Mantenimiento';
      robot.temp = 22;
      robot.current = 0;
      robot.alarm = 'Mantenimiento Preventivo';
    } else {
      robot.status = 'Activo';
      robot.temp = robot.targetTemp || 350;
      robot.current = robot.targetCurrent || 120;
      robot.alarm = 'Ninguna';
    }

    robot.lastUpdate = formatDateTime();

    // RECALCULAR AUTOMÁTICAMENTE TODOS LOS INDICADORES
    renderKPIs(true);
    renderRobotsTable();
    renderRobotsDetailGrid();
    renderReports();
    updateCharts();
  };

  // Eliminar Robot de la Tabla Robots Soldadores
  window.deleteRobot = function(robotId) {
    if (!confirm(`¿Confirma eliminar ${robotId} de la tabla Robots Soldadores?`)) return;

    state.robots = state.robots.filter(r => r.id !== robotId);
    delete state.history.series[robotId];

    // RECALCULAR AUTOMÁTICAMENTE TODOS LOS INDICADORES
    renderKPIs(true);
    renderRobotsTable();
    renderRobotsDetailGrid();
    renderReports();
    updateCharts();
  };

  // Arrancar la aplicación
  initApp();
});
