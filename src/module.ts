// ECU AI Grafana Plugin 入口檔案
import { ECUPanel } from './components/ECUPanel';
import { ECUPanelOptions, defaultOptions } from './types';

// 導出主要組件和型別
export { ECUPanel, ECUPanelOptions, defaultOptions };

// Plugin 資訊
export const pluginInfo = {
  id: 'ecu-ai-monitoring-panel',
  name: 'ECU AI 智慧監控面板',
  description: 'ECU AI 智慧監控儀表板 - 提供即時監控、AI預測分析和系統健康狀態',
  version: '1.0.0',
  author: 'ECU AI Team'
};

// 在實際的 Grafana 環境中使用以下程式碼：
/*
import { PanelPlugin } from '@grafana/data';

export const plugin = new PanelPlugin<ECUPanelOptions>(ECUPanel)
  .setPanelOptions(builder => {
    return builder
      .addTextInput({
        path: 'title',
        name: '面板標題',
        defaultValue: defaultOptions.title,
      })
      .addNumberInput({
        path: 'refreshInterval',
        name: '刷新間隔 (秒)',
        defaultValue: defaultOptions.refreshInterval,
        settings: { min: 5, max: 300, step: 5 }
      })
      .addSelect({
        path: 'selectedDevice',
        name: '選擇設備',
        defaultValue: defaultOptions.selectedDevice,
        settings: {
          options: defaultOptions.availableDevices.map(device => ({
            label: device.name,
            value: device.id
          }))
        }
      })
      .addBooleanSwitch({
        path: 'enableAI',
        name: '啟用 AI 分析',
        defaultValue: defaultOptions.enableAI,
      });
  });
*/

// 開發模式：直接導出組件
export default ECUPanel;