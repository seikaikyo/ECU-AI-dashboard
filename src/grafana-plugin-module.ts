import { PanelPlugin } from '@grafana/data';
import { ECUPanel } from './components/ECUPanel';
import { ECUPanelOptions, defaultOptions } from './types';

// Plugin 配置建構器
export const plugin = new PanelPlugin<ECUPanelOptions>(ECUPanel)
  .setPanelOptions((builder) => {
    return builder
      // 基本設定
      .addTextInput({
        path: 'title',
        name: '面板標題',
        description: '顯示在面板頂部的標題',
        defaultValue: defaultOptions.title,
      })
      .addNumberInput({
        path: 'refreshInterval',
        name: '刷新間隔 (秒)',
        description: '自動刷新數據的間隔時間',
        defaultValue: defaultOptions.refreshInterval,
        settings: {
          min: 5,
          max: 300,
          step: 5,
        },
      })
      
      // 設備設定
      .addSelect({
        path: 'selectedDevice',
        name: '選擇設備',
        description: '選擇要監控的ECU設備',
        defaultValue: defaultOptions.selectedDevice,
        settings: {
          options: defaultOptions.availableDevices.map(device => ({
            label: device.name,
            value: device.id,
            description: `狀態: ${device.status}`
          })),
        },
      })
      
      // 指標設定
      .addMultiSelect({
        path: 'selectedMetrics',
        name: '監控指標',
        description: '選擇要顯示的監控指標',
        defaultValue: defaultOptions.selectedMetrics,
        settings: {
          options: defaultOptions.metricsConfig.map(metric => ({
            label: metric.name,
            value: metric.key,
            description: `單位: ${metric.unit}`
          })),
        },
      })
      
      // AI 設定
      .addBooleanSwitch({
        path: 'enableAI',
        name: '啟用 AI 分析',
        description: '啟用AI預測和異常檢測功能',
        defaultValue: defaultOptions.enableAI,
      })
      .addTextInput({
        path: 'aiEndpoint',
        name: 'AI 服務端點',
        description: 'AI 分析服務的 API 端點',
        defaultValue: defaultOptions.aiEndpoint,
        showIf: (options) => options.enableAI,
      })
      .addNumberInput({
        path: 'predictionHorizon',
        name: '預測時間範圍 (分鐘)',
        description: 'AI 預測的時間範圍',
        defaultValue: defaultOptions.predictionHorizon,
        showIf: (options) => options.enableAI,
        settings: {
          min: 15,
          max: 240,
          step: 15,
        },
      })
      
      // 顯示設定
      .addNumberInput({
        path: 'chartHeight',
        name: '圖表高度 (px)',
        description: '監控圖表的高度',
        defaultValue: defaultOptions.chartHeight,
        settings: {
          min: 200,
          max: 800,
          step: 50,
        },
      })
      .addBooleanSwitch({
        path: 'showLegend',
        name: '顯示圖例',
        description: '在圖表中顯示數據系列圖例',
        defaultValue: defaultOptions.showLegend,
      })
      .addBooleanSwitch({
        path: 'showGrid',
        name: '顯示網格',
        description: '在圖表中顯示背景網格線',
        defaultValue: defaultOptions.showGrid,
      })
      .addBooleanSwitch({
        path: 'showPrediction',
        name: '顯示預測數據',
        description: '在圖表中顯示AI預測趨勢',
        defaultValue: defaultOptions.showPrediction,
        showIf: (options) => options.enableAI,
      })
      .addBooleanSwitch({
        path: 'showHealthStatus',
        name: '顯示健康狀態',
        description: '顯示系統健康狀態指示器',
        defaultValue: defaultOptions.showHealthStatus,
      })
      .addBooleanSwitch({
        path: 'showAlerts',
        name: '顯示告警資訊',
        description: '顯示AI分析和告警面板',
        defaultValue: defaultOptions.showAlerts,
      })
      
      // 告警閾值設定
      .addFieldNamePicker({
        path: 'alertThresholds',
        name: '告警閾值設定',
        description: '設定各項指標的告警閾值',
      })
      
      // 顏色設定
      .addSelect({
        path: 'colorScheme',
        name: '顏色主題',
        description: '選擇圖表的顏色主題',
        defaultValue: defaultOptions.colorScheme,
        settings: {
          options: [
            { label: '預設', value: 'default' },
            { label: '深色', value: 'dark' },
            { label: '淺色', value: 'light' },
          ],
        },
      })
      
      // 進階設定折疊面板
      .addCustomEditor({
        id: 'advanced-settings',
        path: 'advancedSettings',
        name: '進階設定',
        description: '進階配置選項',
        editor: AdvancedSettingsEditor,
      });
  })
  
  // 設定遷移處理
  .setMigrationHandler((panel) => {
    // 處理舊版本配置的遷移
    if (panel.options.version === undefined) {
      // 從舊版本遷移
      return {
        ...defaultOptions,
        ...panel.options,
        version: '1.0.0',
      };
    }
    
    return panel.options;
  })
  
  // 設定資料支援
  .useFieldConfig({
    // 支援的資料類型
    supportedTypes: ['number', 'time'],
    
    // 預設字段配置
    defaults: {
      color: {
        mode: 'palette-classic',
      },
      custom: {
        drawStyle: 'line',
        lineInterpolation: 'linear',
        barAlignment: 0,
        lineWidth: 2,
        fillOpacity: 0,
        gradientMode: 'none',
        spanNulls: false,
        insertNulls: false,
        showPoints: 'never',
        pointSize: 5,
        stacking: {
          mode: 'none',
          group: 'A',
        },
        axisPlacement: 'auto',
        axisLabel: '',
        axisColorMode: 'text',
        scaleDistribution: {
          type: 'linear',
        },
        axisCenteredZero: false,
        hideFrom: {
          legend: false,
          tooltip: false,
          vis: false,
        },
        thresholdsStyle: {
          mode: 'off',
        },
      },
      mappings: [],
      thresholds: {
        mode: 'absolute',
        steps: [
          {
            color: 'green',
            value: null,
          },
          {
            color: 'red',
            value: 80,
          },
        ],
      },
    },
  });

// 進階設定編輯器組件
import React from 'react';
import { StandardEditorProps } from '@grafana/data';
import { InlineField, InlineFieldRow, Input, Switch } from '@grafana/ui';

interface AdvancedSettings {
  customEndpoints?: {
    data: string;
    ai: string;
    alerts: string;
  };
  cacheSettings?: {
    enabled: boolean;
    ttl: number;
  };
  debugMode?: boolean;
}

const AdvancedSettingsEditor: React.FC<StandardEditorProps<AdvancedSettings>> = ({
  value = {},
  onChange,
  context,
}) => {
  const updateSetting = (key: string, newValue: any) => {
    onChange({
      ...value,
      [key]: newValue,
    });
  };

  return (
    <div>
      <InlineFieldRow>
        <InlineField label="除錯模式" labelWidth={12}>
          <Switch
            value={value.debugMode || false}
            onChange={(e) => updateSetting('debugMode', e.currentTarget.checked)}
          />
        </InlineField>
      </InlineFieldRow>
      
      <InlineFieldRow>
        <InlineField label="資料端點" labelWidth={12}>
          <Input
            value={value.customEndpoints?.data || '/api/ecu/data'}
            onChange={(e) => updateSetting('customEndpoints', {
              ...value.customEndpoints,
              data: e.currentTarget.value
            })}
            placeholder="/api/ecu/data"
          />
        </InlineField>
      </InlineFieldRow>
      
      <InlineFieldRow>
        <InlineField label="AI 端點" labelWidth={12}>
          <Input
            value={value.customEndpoints?.ai || '/api/ai/analysis'}
            onChange={(e) => updateSetting('customEndpoints', {
              ...value.customEndpoints,
              ai: e.currentTarget.value
            })}
            placeholder="/api/ai/analysis"
          />
        </InlineField>
      </InlineFieldRow>
      
      <InlineFieldRow>
        <InlineField label="啟用快取" labelWidth={12}>
          <Switch
            value={value.cacheSettings?.enabled || false}
            onChange={(e) => updateSetting('cacheSettings', {
              ...value.cacheSettings,
              enabled: e.currentTarget.checked
            })}
          />
        </InlineField>
      </InlineFieldRow>
      
      {value.cacheSettings?.enabled && (
        <InlineFieldRow>
          <InlineField label="快取時間 (秒)" labelWidth={12}>
            <Input
              type="number"
              value={value.cacheSettings?.ttl || 60}
              onChange={(e) => updateSetting('cacheSettings', {
                ...value.cacheSettings,
                ttl: parseInt(e.currentTarget.value, 10)
              })}
              min={10}
              max={3600}
            />
          </InlineField>
        </InlineFieldRow>
      )}
    </div>
  );
};