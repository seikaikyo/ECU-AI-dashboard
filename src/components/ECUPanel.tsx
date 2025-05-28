import React, { useState, useEffect, useMemo } from 'react';
import { PanelProps, getBackendSrv, dateTime } from '@grafana/runtime';
import { 
  Select, 
  MultiSelect, 
  Alert, 
  LoadingPlaceholder, 
  Card,
  Badge,
  Button,
  IconButton
} from '@grafana/ui';
import { css } from '@emotion/css';
import { 
  ECUPanelOptions, 
  ECUData, 
  AIAnalysis, 
  Alert as AlertType,
  AlertSeverity,
  APIResponse 
} from '../types';
import { ECUMonitorChart } from './ECUMonitorChart';
import { AIAnalysisPanel } from './AIAnalysisPanel';
import { SystemHealthStatus } from './SystemHealthStatus';
import { MetricSelector } from './MetricSelector';

interface Props extends PanelProps<ECUPanelOptions> {}

export const ECUPanel: React.FC<Props> = ({ 
  options, 
  data, 
  width, 
  height, 
  timeRange,
  onOptionsChange 
}) => {
  // 狀態管理
  const [ecuData, setEcuData] = useState<ECUData[]>([]);
  const [predictionData, setPredictionData] = useState<ECUData[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // 樣式定義
  const styles = {
    container: css`
      padding: 16px;
      background: #f8f9fa;
      height: 100%;
      overflow-y: auto;
    `,
    header: css`
      display: flex;
      align-items: center;
      justify-content: between;
      margin-bottom: 16px;
      padding: 12px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    `,
    title: css`
      display: flex;
      align-items: center;
      font-size: 20px;
      font-weight: bold;
      color: #495057;
    `,
    controls: css`
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 16px;
      margin-bottom: 16px;
      padding: 12px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    `,
    section: css`
      background: white;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    `,
    sectionHeader: css`
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      font-size: 16px;
      font-weight: 600;
      color: #495057;
    `,
    alertBadge: css`
      margin-left: auto;
      animation: pulse 2s infinite;
    `,
    statusRow: css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    `,
    refreshButton: css`
      margin-left: auto;
    `
  };

  // 數據獲取函數
  const fetchECUData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. 獲取實時數據
      const realtimeResponse = await getBackendSrv().get('/api/ecu/data', {
        device: options.selectedDevice,
        from: timeRange.from.unix(),
        to: timeRange.to.unix(),
        metrics: options.selectedMetrics
      });

      if (realtimeResponse.success) {
        setEcuData(realtimeResponse.data);
      }

      // 2. 獲取 AI 預測數據（如果啟用）
      if (options.enableAI && options.showPrediction) {
        const predictionResponse = await getBackendSrv().post('/api/ai/predict', {
          device: options.selectedDevice,
          horizon: options.predictionHorizon,
          baseData: realtimeResponse.data?.slice(-10) // 使用最近10個數據點
        });

        if (predictionResponse.success) {
          setPredictionData(predictionResponse.data);
        }
      }

      // 3. 獲取 AI 分析結果
      if (options.enableAI) {
        const analysisResponse = await getBackendSrv().post('/api/ai/analyze', {
          device: options.selectedDevice,
          data: realtimeResponse.data,
          thresholds: options.alertThresholds
        });

        if (analysisResponse.success) {
          setAiAnalysis(analysisResponse.data);
          
          // 生成告警
          const newAlerts = generateAlerts(
            realtimeResponse.data, 
            analysisResponse.data,
            options.alertThresholds
          );
          setAlerts(newAlerts);
        }
      }

      setLastUpdate(new Date());
    } catch (err) {
      console.error('Failed to fetch ECU data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      
      // 使用模擬數據作為後備
      const mockData = generateMockData();
      setEcuData(mockData);
      
      if (options.enableAI) {
        const mockAnalysis = generateMockAnalysis(mockData);
        setAiAnalysis(mockAnalysis);
      }
    } finally {
      setLoading(false);
    }
  };

  // 生成模擬數據（開發用）
  const generateMockData = (): ECUData[] => {
    const data: ECUData[] = [];
    const now = Date.now();
    
    for (let i = 0; i < 100; i++) {
      const timestamp = now - (99 - i) * 60000;
      data.push({
        timestamp,
        time: dateTime(timestamp).format('HH:mm:ss'),
        rightTempPV: 55 + Math.sin(i * 0.1) * 2 + Math.random() * 1,
        rightRoomTemp: 51 + Math.sin(i * 0.1) * 1.5 + Math.random() * 0.8,
        leftOutletTemp: 52 + Math.cos(i * 0.1) * 1.8 + Math.random() * 0.7,
        egrCoolerTemp: 48 + Math.sin(i * 0.15) * 2 + Math.random() * 0.9,
        hepaEfficiency: 95 + Math.sin(i * 0.08) * 3 + Math.random() * 1.2
      });
    }
    
    return data;
  };

  // 生成模擬 AI 分析
  const generateMockAnalysis = (data: ECUData[]): AIAnalysis => {
    const latest = data[data.length - 1];
    const anomalies: string[] = [];
    const alerts: string[] = [];
    
    if (latest.rightTempPV > options.alertThresholds.rightTempPV.warning) {
      anomalies.push(`右側機控溫度: ${latest.rightTempPV.toFixed(2)}°C (超過警告值)`);
      alerts.push('右側機控溫度異常');
    }
    
    if (latest.hepaEfficiency < options.alertThresholds.hepaEfficiency.warning) {
      anomalies.push(`HEPA效率: ${latest.hepaEfficiency.toFixed(2)}% (低於警告值)`);
      alerts.push('HEPA效率下降');
    }
    
    const healthScore = Math.max(0, Math.min(100, 
      100 - anomalies.length * 15 - (alerts.length * 10)
    ));
    
    return {
      predictions: [
        '未來1小時溫度趨勢：穩定',
        '系統效率預測：良好',
        '建議維護時間：72小時後'
      ],
      anomalies,
      recommendations: [
        '建議檢查右側機控溫度控制系統',
        '考慮清潔或更換HEPA濾網',
        '監控EGR冷卻器性能'
      ],
      healthScore,
      alerts,
      confidence: 0.85,
      analysisTime: Date.now()
    };
  };

  // 生成告警
  const generateAlerts = (
    data: ECUData[], 
    analysis: AIAnalysis,
    thresholds: ECUPanelOptions['alertThresholds']
  ): AlertType[] => {
    const alerts: AlertType[] = [];
    const latest = data[data.length - 1];
    
    // 檢查各項指標
    Object.keys(thresholds).forEach(metric => {
      const value = latest[metric as keyof ECUData] as number;
      const threshold = thresholds[metric];
      
      if (value > threshold.critical) {
        alerts.push({
          id: `${metric}-critical-${Date.now()}`,
          severity: AlertSeverity.CRITICAL,
          message: `${options.metricsConfig.find(m => m.key === metric)?.name} 達到危險值`,
          metric,
          value,
          threshold: threshold.critical,
          timestamp: Date.now(),
          acknowledged: false
        });
      } else if (value > threshold.warning) {
        alerts.push({
          id: `${metric}-warning-${Date.now()}`,
          severity: AlertSeverity.WARNING,
          message: `${options.metricsConfig.find(m => m.key === metric)?.name} 超過警告值`,
          metric,
          value,
          threshold: threshold.warning,
          timestamp: Date.now(),
          acknowledged: false
        });
      }
    });
    
    return alerts;
  };

  // 自動刷新
  useEffect(() => {
    fetchECUData();
    
    const interval = setInterval(() => {
      fetchECUData();
    }, options.refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [options.selectedDevice, options.selectedMetrics, options.refreshInterval, timeRange]);

  // 計算活躍告警數量
  const activeAlerts = useMemo(() => 
    alerts.filter(alert => !alert.acknowledged).length
  , [alerts]);

  // 處理選項變更
  const handleDeviceChange = (deviceId: string) => {
    onOptionsChange({
      ...options,
      selectedDevice: deviceId
    });
  };

  const handleMetricsChange = (metrics: string[]) => {
    onOptionsChange({
      ...options,
      selectedMetrics: metrics
    });
  };

  // 渲染載入狀態
  if (loading && ecuData.length === 0) {
    return (
      <div className={styles.container}>
        <LoadingPlaceholder text="載入 ECU AI 監控數據..." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 標題區域 */}
      <div className={styles.header}>
        <div className={styles.title}>
          <span style={{ marginRight: '8px' }}>🚗</span>
          {options.title}
          {activeAlerts > 0 && (
            <Badge 
              color="red" 
              className={styles.alertBadge}
              text={`${activeAlerts} 告警`}
            />
          )}
        </div>
        
        <div className={styles.statusRow}>
          <span style={{ fontSize: '12px', color: '#6c757d' }}>
            最後更新: {lastUpdate.toLocaleTimeString('zh-TW')}
          </span>
          <IconButton 
            name="sync" 
            onClick={fetchECUData}
            className={styles.refreshButton}
            tooltip="手動刷新"
          />
        </div>
      </div>

      {/* 錯誤提示 */}
      {error && (
        <Alert title="數據載入錯誤" severity="error">
          {error} (使用模擬數據顯示)
        </Alert>
      )}

      {/* 控制面板 */}
      <div className={styles.controls}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            選擇設備:
          </label>
          <Select
            value={options.selectedDevice}
            onChange={(e) => handleDeviceChange(e.value!)}
            options={options.availableDevices.map(device => ({
              label: `${device.name} (${device.status})`,
              value: device.id
            }))}
          />
        </div>
        
        <MetricSelector
          selectedMetrics={options.selectedMetrics}
          metricsConfig={options.metricsConfig}
          onChange={handleMetricsChange}
        />
      </div>

      {/* AI 分析結果 */}
      {options.showAlerts && aiAnalysis && (
        <AIAnalysisPanel 
          analysis={aiAnalysis}
          alerts={alerts}
          className={styles.section}
        />
      )}

      {/* 即時監測圖表 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span style={{ marginRight: '8px' }}>📊</span>
          即時監測數據 (AI 增強)
        </div>
        
        <ECUMonitorChart
          data={ecuData}
          predictionData={options.showPrediction ? predictionData : []}
          selectedMetrics={options.selectedMetrics}
          metricsConfig={options.metricsConfig}
          width={width - 64}
          height={options.chartHeight}
          showGrid={options.showGrid}
          showLegend={options.showLegend}
        />
      </div>

      {/* 系統健康狀態 */}
      {options.showHealthStatus && aiAnalysis && (
        <SystemHealthStatus 
          healthScore={aiAnalysis.healthScore}
          confidence={aiAnalysis.confidence}
          className={styles.section}
        />
      )}
    </div>
  );
};