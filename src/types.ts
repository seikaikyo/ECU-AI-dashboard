import { 
  PanelData, 
  TimeRange, 
  FieldOverrideContext, 
  PanelPlugin,
  DataFrame,
  Field,
  FieldType
} from '@grafana/data';
import { PanelProps as GrafanaPanelProps } from '@grafana/ui';

// ECU 監控數據介面
export interface ECUData {
  timestamp: number;
  time: string;
  rightTempPV: number;
  rightRoomTemp: number;
  leftOutletTemp: number;
  egrCoolerTemp: number;
  hepaEfficiency: number;
}

// AI 分析結果介面
export interface AIAnalysis {
  predictions: string[];
  anomalies: string[];
  recommendations: string[];
  healthScore: number;
  alerts: string[];
  confidence: number;
  analysisTime: number;
}

// 設備配置介面
export interface DeviceConfig {
  id: string;
  name: string;
  type: 'ECU' | 'EGR' | 'HEPA_FILTER';
  location?: string;
  status: 'online' | 'offline' | 'maintenance';
}

// 指標配置介面
export interface MetricConfig {
  key: string;
  name: string;
  unit: string;
  color: string;
  thresholds: {
    warning: number;
    critical: number;
  };
  enabled: boolean;
}

// Panel 選項介面
export interface ECUPanelOptions {
  // 基本設定
  title: string;
  refreshInterval: number;
  showLegend: boolean;
  showGrid: boolean;
  
  // 設備設定
  selectedDevice: string;
  availableDevices: DeviceConfig[];
  
  // 指標設定
  selectedMetrics: string[];
  metricsConfig: MetricConfig[];
  
  // AI 設定
  enableAI: boolean;
  aiEndpoint: string;
  predictionHorizon: number; // 預測時間範圍(分鐘)
  
  // 顯示設定
  chartHeight: number;
  showPrediction: boolean;
  showHealthStatus: boolean;
  showAlerts: boolean;
  
  // 告警設定
  alertThresholds: {
    [key: string]: {
      warning: number;
      critical: number;
    };
  };
  
  // 顏色設定
  colorScheme: 'default' | 'dark' | 'light';
  colors: {
    [key: string]: string;
  };
}

// Panel 預設選項
export const defaultOptions: ECUPanelOptions = {
  title: 'ECU AI 智慧監控',
  refreshInterval: 30,
  showLegend: true,
  showGrid: true,
  
  selectedDevice: '3號機',
  availableDevices: [
    { id: '1', name: '1號機', type: 'ECU', status: 'online' },
    { id: '2', name: '2號機', type: 'ECU', status: 'online' },
    { id: '3', name: '3號機', type: 'ECU', status: 'online' },
    { id: '4', name: '4號機', type: 'ECU', status: 'maintenance' }
  ],
  
  selectedMetrics: [
    'rightTempPV',
    'rightRoomTemp', 
    'leftOutletTemp',
    'egrCoolerTemp',
    'hepaEfficiency'
  ],
  
  metricsConfig: [
    {
      key: 'rightTempPV',
      name: '右側機控2A溫度PV',
      unit: '°C',
      color: '#ef4444',
      thresholds: { warning: 56, critical: 58 },
      enabled: true
    },
    {
      key: 'rightRoomTemp',
      name: '右側機熱室2A溫度',
      unit: '°C', 
      color: '#f97316',
      thresholds: { warning: 52, critical: 54 },
      enabled: true
    },
    {
      key: 'leftOutletTemp',
      name: '左側出風口中溫度',
      unit: '°C',
      color: '#eab308',
      thresholds: { warning: 53, critical: 55 },
      enabled: true
    },
    {
      key: 'egrCoolerTemp',
      name: 'EGR冷卻器填料溫度',
      unit: '°C',
      color: '#22c55e',
      thresholds: { warning: 50, critical: 52 },
      enabled: true
    },
    {
      key: 'hepaEfficiency',
      name: 'HEPA濾網效率',
      unit: '%',
      color: '#3b82f6',
      thresholds: { warning: 90, critical: 85 },
      enabled: true
    }
  ],
  
  enableAI: true,
  aiEndpoint: '/api/ai/analysis',
  predictionHorizon: 60,
  
  chartHeight: 300,
  showPrediction: true,
  showHealthStatus: true,
  showAlerts: true,
  
  alertThresholds: {
    rightTempPV: { warning: 56, critical: 58 },
    rightRoomTemp: { warning: 52, critical: 54 },
    leftOutletTemp: { warning: 53, critical: 55 },
    egrCoolerTemp: { warning: 50, critical: 52 },
    hepaEfficiency: { warning: 90, critical: 85 }
  },
  
  colorScheme: 'default',
  colors: {
    rightTempPV: '#ef4444',
    rightRoomTemp: '#f97316',
    leftOutletTemp: '#eab308',
    egrCoolerTemp: '#22c55e',
    hepaEfficiency: '#3b82f6'
  }
};

// Panel Props 介面
export interface ECUPanelProps extends GrafanaPanelProps<ECUPanelOptions> {
  data: PanelData;
  timeRange: TimeRange;
  onOptionsChange: (options: ECUPanelOptions) => void;
}

// 告警嚴重程度
export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning', 
  CRITICAL = 'critical'
}

// 告警介面
export interface Alert {
  id: string;
  severity: AlertSeverity;
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
  acknowledged: boolean;
}

// API 回應介面
export interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: number;
}