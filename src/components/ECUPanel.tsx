import React, { useState, useEffect } from 'react';
import { 
  ECUPanelProps, 
  ECUData, 
  AIAnalysis, 
  defaultOptions 
} from '../types';

// 簡化的 ECU Panel 組件
export const ECUPanel: React.FC<ECUPanelProps> = ({ 
  options = defaultOptions, 
  data, 
  width, 
  height, 
  onOptionsChange 
}) => {
  // 狀態管理
  const [ecuData, setEcuData] = useState<ECUData[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  // 模擬數據生成
  const generateMockData = (): ECUData[] => {
    const mockData: ECUData[] = [];
    const now = Date.now();
    
    for (let i = 0; i < 60; i++) {
      const timestamp = now - (59 - i) * 60000;
      mockData.push({
        timestamp,
        time: new Date(timestamp).toLocaleTimeString('zh-TW'),
        rightTempPV: 55 + Math.sin(i * 0.1) * 2 + Math.random() * 1,
        rightRoomTemp: 51 + Math.sin(i * 0.1) * 1.5 + Math.random() * 0.8,
        leftOutletTemp: 52 + Math.cos(i * 0.1) * 1.8 + Math.random() * 0.7,
        egrCoolerTemp: 48 + Math.sin(i * 0.15) * 2 + Math.random() * 0.9,
        hepaEfficiency: 95 + Math.sin(i * 0.08) * 3 + Math.random() * 1.2
      });
    }
    
    return mockData;
  };

  // 生成模擬 AI 分析
  const generateMockAnalysis = (data: ECUData[]): AIAnalysis => {
    const latest = data[data.length - 1];
    const anomalies: string[] = [];
    const alerts: string[] = [];
    
    if (latest.rightTempPV > 56) {
      anomalies.push(`右側機控溫度: ${latest.rightTempPV.toFixed(2)}°C (超過警告值)`);
      alerts.push('右側機控溫度異常');
    }
    
    if (latest.hepaEfficiency < 90) {
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

  // 組件初始化
  useEffect(() => {
    const initializeData = () => {
      setLoading(true);
      
      // 生成模擬數據
      const mockData = generateMockData();
      const mockAnalysis = generateMockAnalysis(mockData);
      
      setEcuData(mockData);
      setAiAnalysis(mockAnalysis);
      setLoading(false);
    };

    initializeData();
    
    // 設置定期更新
    const interval = setInterval(initializeData, options.refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [options.refreshInterval]);

  // 設備選擇處理
  const handleDeviceChange = (deviceId: string) => {
    onOptionsChange({
      ...options,
      selectedDevice: deviceId
    });
  };

  // 指標選擇處理
  const handleMetricToggle = (metric: string) => {
    const newMetrics = options.selectedMetrics.includes(metric)
      ? options.selectedMetrics.filter(m => m !== metric)
      : [...options.selectedMetrics, metric];
    
    onOptionsChange({
      ...options,
      selectedMetrics: newMetrics
    });
  };

  // 載入狀態
  if (loading) {
    return (
      <div style={{ 
        width, 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f8f9fa'
      }}>
        <div>載入 ECU AI 監控數據...</div>
      </div>
    );
  }

  // 主要渲染
  return (
    <div style={{ 
      width, 
      height, 
      padding: '16px', 
      backgroundColor: '#f8f9fa',
      overflow: 'auto'
    }}>
      {/* 標題區域 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '20px',
        padding: '12px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '20px', marginRight: '8px' }}>🚗</div>
        <h2 style={{ margin: 0, color: '#495057' }}>{options.title}</h2>
        {aiAnalysis && aiAnalysis.alerts.length > 0 && (
          <div style={{ 
            marginLeft: 'auto', 
            backgroundColor: '#dc3545', 
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px'
          }}>
            {aiAnalysis.alerts.length} 告警
          </div>
        )}
      </div>

      {/* 控制面板 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 2fr', 
        gap: '16px', 
        marginBottom: '20px',
        padding: '12px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            選擇設備:
          </label>
          <select 
            value={options.selectedDevice}
            onChange={(e) => handleDeviceChange(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ccc', 
              borderRadius: '4px' 
            }}
          >
            {options.availableDevices.map(device => (
              <option key={device.id} value={device.id}>
                {device.name} ({device.status})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            選擇指標 (可多選):
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {options.metricsConfig.map(metric => (
              <button
                key={metric.key}
                onClick={() => handleMetricToggle(metric.key)}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: options.selectedMetrics.includes(metric.key) 
                    ? metric.color 
                    : '#e9ecef',
                  color: options.selectedMetrics.includes(metric.key) 
                    ? 'white' 
                    : '#495057'
                }}
              >
                {metric.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI 分析結果 */}
      {aiAnalysis && (
        <div style={{ 
          background: 'white', 
          padding: '16px', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            display: 'flex', 
            alignItems: 'center',
            color: '#495057'
          }}>
            <span style={{ marginRight: '8px' }}>🧠</span>
            AI 分析結果
          </h3>
          
          {aiAnalysis.anomalies.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <h4 style={{ color: '#dc3545', fontSize: '14px', margin: '0 0 8px 0' }}>
                ⚠️ 告警現象:
              </h4>
              {aiAnalysis.anomalies.map((anomaly, index) => (
                <div key={index} style={{ 
                  fontSize: '13px', 
                  color: '#6c757d',
                  marginLeft: '16px',
                  marginBottom: '4px'
                }}>
                  • {anomaly}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginBottom: '12px' }}>
            <h4 style={{ color: '#28a745', fontSize: '14px', margin: '0 0 8px 0' }}>
              🔮 預測分析:
            </h4>
            {aiAnalysis.predictions.map((prediction, index) => (
              <div key={index} style={{ 
                fontSize: '13px', 
                color: '#6c757d',
                marginLeft: '16px',
                marginBottom: '4px'
              }}>
                • {prediction}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 數據展示區域 */}
      <div style={{ 
        background: 'white', 
        padding: '16px', 
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#495057' }}>
          📊 即時監測數據
        </h3>
        
        {ecuData.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: '16px', minWidth: '600px' }}>
              {options.selectedMetrics.map(metricKey => {
                const metric = options.metricsConfig.find(m => m.key === metricKey);
                const latest = ecuData[ecuData.length - 1];
                const value = latest[metricKey as keyof ECUData] as number;
                
                if (!metric) return null;
                
                return (
                  <div key={metricKey} style={{ 
                    flex: 1, 
                    padding: '12px', 
                    border: `2px solid ${metric.color}`,
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#6c757d',
                      marginBottom: '4px'
                    }}>
                      {metric.name}
                    </div>
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold',
                      color: metric.color
                    }}>
                      {value.toFixed(1)}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#6c757d'
                    }}>
                      {metric.unit}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 系統健康狀態 */}
      {aiAnalysis && (
        <div style={{ 
          background: 'white', 
          padding: '16px', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            color: '#495057'
          }}>
            💊 系統健康狀態
          </h3>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '48px', 
              fontWeight: 'bold',
              color: aiAnalysis.healthScore >= 80 ? '#28a745' : 
                     aiAnalysis.healthScore >= 60 ? '#ffc107' : '#dc3545'
            }}>
              {aiAnalysis.healthScore}
            </div>
            <div style={{ 
              fontSize: '16px',
              color: aiAnalysis.healthScore >= 80 ? '#28a745' : 
                     aiAnalysis.healthScore >= 60 ? '#ffc107' : '#dc3545'
            }}>
              {aiAnalysis.healthScore >= 80 ? '良好' : 
               aiAnalysis.healthScore >= 60 ? '注意' : '需要關注'} 
              ({aiAnalysis.healthScore}/100)
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#6c757d',
              marginTop: '8px'
            }}>
              信心度: {(aiAnalysis.confidence * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ECUPanel;