// ECU AI Grafana Plugin 入口檔案
// 開發環境版本 - 避免 PanelPlugin 導入問題

import { ECUPanel } from './components/ECUPanel';
import { ECUPanelOptions, defaultOptions } from './types';

// 導出主要組件和型別
export { ECUPanel, ECUPanelOptions, defaultOptions };

// Plugin 元數據
export const pluginMetadata = {
  id: 'ecu-ai-monitoring-panel',
  name: 'ECU AI 智慧監控面板',
  description: 'ECU AI 智慧監控儀表板 - 提供即時監控、AI預測分析和系統健康狀態',
  version: '1.0.0',
  author: 'ECU AI Team',
  type: 'panel',
  component: ECUPanel,
  defaultOptions: defaultOptions
};

// 面板選項配置（開發用）
export const panelConfiguration = {
  // 基本設定
  basic: [
    {
      path: 'title',
      name: '面板標題',
      description: '顯示在面板頂部的標題',
      type: 'text',
      defaultValue: defaultOptions.title
    },
    {
      path: 'refreshInterval', 
      name: '刷新間隔 (秒)',
      description: '自動刷新數據的間隔時間',
      type: 'number',
      defaultValue: defaultOptions.refreshInterval,
      min: 5,
      max: 300,
      step: 5
    }
  ],
  
  // 設備設定
  device: [
    {
      path: 'selectedDevice',
      name: '選擇設備',
      description: '選擇要監控的ECU設備',
      type: 'select',
      defaultValue: defaultOptions.selectedDevice,
      options: defaultOptions.availableDevices.map(device => ({
        label: device.name,
        value: device.id,
        description: `狀態: ${device.status}`
      }))
    }
  ],
  
  // 指標設定
  metrics: [
    {
      path: 'selectedMetrics',
      name: '監控指標',
      description: '選擇要顯示的監控指標',
      type: 'multiSelect',
      defaultValue: defaultOptions.selectedMetrics,
      options: defaultOptions.metricsConfig.map(metric => ({
        label: metric.name,
        value: metric.key,
        description: `單位: ${metric.unit}`
      }))
    }
  ],
  
  // AI 設定
  ai: [
    {
      path: 'enableAI',
      name: '啟用 AI 分析',
      description: '啟用AI預測和異常檢測功能',
      type: 'boolean',
      defaultValue: defaultOptions.enableAI
    },
    {
      path: 'aiEndpoint',
      name: 'AI 服務端點',
      description: 'AI 分析服務的 API 端點',
      type: 'text',
      defaultValue: defaultOptions.aiEndpoint,
      showIf: 'enableAI'
    },
    {
      path: 'predictionHorizon',
      name: '預測時間範圍 (分鐘)',
      description: 'AI 預測的時間範圍',
      type: 'number',
      defaultValue: defaultOptions.predictionHorizon,
      min: 15,
      max: 240,
      step: 15,
      showIf: 'enableAI'
    }
  ],
  
  // 顯示設定
  display: [
    {
      path: 'chartHeight',
      name: '圖表高度 (px)',
      description: '監控圖表的高度', 
      type: 'number',
      defaultValue: defaultOptions.chartHeight,
      min: 200,
      max: 800,
      step: 50
    },
    {
      path: 'showLegend',
      name: '顯示圖例',
      description: '在圖表中顯示數據系列圖例',
      type: 'boolean',
      defaultValue: defaultOptions.showLegend
    },
    {
      path: 'showGrid',
      name: '顯示網格',
      description: '在圖表中顯示背景網格線',
      type: 'boolean',
      defaultValue: defaultOptions.showGrid
    },
    {
      path: 'showPrediction',
      name: '顯示預測數據',
      description: '在圖表中顯示AI預測趨勢',
      type: 'boolean',
      defaultValue: defaultOptions.showPrediction,
      showIf: 'enableAI'
    },
    {
      path: 'showHealthStatus',
      name: '顯示健康狀態',
      description: '顯示系統健康狀態指示器',
      type: 'boolean',
      defaultValue: defaultOptions.showHealthStatus
    },
    {
      path: 'showAlerts',
      name: '顯示告警資訊',
      description: '顯示AI分析和告警面板',
      type: 'boolean',
      defaultValue: defaultOptions.showAlerts
    },
    {
      path: 'colorScheme',
      name: '顏色主題',
      description: '選擇圖表的顏色主題',
      type: 'select',
      defaultValue: defaultOptions.colorScheme,
      options: [
        { label: '預設', value: 'default' },
        { label: '深色', value: 'dark' },
        { label: '淺色', value: 'light' }
      ]
    }
  ]
};

// 版本遷移處理函式
export const migrationHandler = (panel: any) => {
  if (!panel.options || !panel.options.version) {
    return {
      ...defaultOptions,
      ...panel.options,
      version: '1.0.0'
    };
  }
  
  if (panel.options.version === '0.9.0') {
    return {
      ...panel.options,
      version: '1.0.0'
    };
  }
  
  return panel.options;
};

// 欄位配置
export const fieldConfiguration = {
  supportedTypes: ['number', 'time', 'string'],
  defaults: {
    color: { mode: 'palette-classic' },
    unit: 'none',
    decimals: 2,
    thresholds: {
      mode: 'absolute',
      steps: [
        { color: 'green', value: null },
        { color: 'yellow', value: 50 },
        { color: 'red', value: 80 }
      ]
    },
    mappings: [],
    min: undefined,
    max: undefined
  }
};

// 配置驗證函式
export const validateConfiguration = (options: ECUPanelOptions): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!options.title || typeof options.title !== 'string') {
    errors.push('標題必須是非空字串');
  }
  
  if (!options.refreshInterval || options.refreshInterval < 5 || options.refreshInterval > 300) {
    errors.push('刷新間隔必須在 5-300 秒之間');
  }
  
  if (!options.selectedDevice) {
    errors.push('必須選擇一個設備');
  }
  
  if (!Array.isArray(options.selectedMetrics) || options.selectedMetrics.length === 0) {
    errors.push('必須選擇至少一個監控指標');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// 建立預設配置的工廠函式
export const createConfiguration = (overrides: Partial<ECUPanelOptions> = {}): ECUPanelOptions => {
  return {
    ...defaultOptions,
    ...overrides
  };
};

/*
部署到 Grafana 時，取消註解以下程式碼並安裝 @grafana/data：

import { PanelPlugin } from '@grafana/data';

export const plugin = new PanelPlugin<ECUPanelOptions>(ECUPanel)
  .setPanelOptions((builder) => {
    let optionsBuilder = builder;
    
    // 基本設定
    panelConfiguration.basic.forEach(config => {
      if (config.type === 'text') {
        optionsBuilder = optionsBuilder.addTextInput({
          path: config.path,
          name: config.name,
          description: config.description,
          defaultValue: config.defaultValue
        });
      } else if (config.type === 'number') {
        optionsBuilder = optionsBuilder.addNumberInput({
          path: config.path,
          name: config.name,
          description: config.description,
          defaultValue: config.defaultValue,
          settings: {
            min: config.min,
            max: config.max,
            step: config.step
          }
        });
      }
    });
    
    // 設備設定
    panelConfiguration.device.forEach(config => {
      if (config.type === 'select') {
        optionsBuilder = optionsBuilder.addSelect({
          path: config.path,
          name: config.name,
          description: config.description,
          defaultValue: config.defaultValue,
          settings: { options: config.options }
        });
      }
    });
    
    // 其他配置...
    
    return optionsBuilder;
  })
  .setMigrationHandler(migrationHandler)
  .useFieldConfig(fieldConfiguration);
*/

// 預設導出主要組件
export default ECUPanel;