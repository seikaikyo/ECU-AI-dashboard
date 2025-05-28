import React from 'react';

// 簡化版本的進階設定編輯器
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

interface AdvancedSettingsEditorProps {
  value: AdvancedSettings;
  onChange: (value: AdvancedSettings) => void;
}

export const AdvancedSettingsEditor: React.FC<AdvancedSettingsEditorProps> = ({
  value = {},
  onChange,
}) => {
  const updateSetting = (key: string, newValue: any) => {
    onChange({
      ...value,
      [key]: newValue,
    });
  };

  return (
    <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
      <h4 style={{ marginTop: 0 }}>進階設定</h4>
      
      {/* 除錯模式 */}
      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
        <label style={{ width: '120px', fontSize: '14px' }}>除錯模式:</label>
        <input
          type="checkbox"
          checked={value.debugMode || false}
          onChange={(e) => updateSetting('debugMode', e.target.checked)}
        />
      </div>
      
      {/* 資料端點 */}
      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
        <label style={{ width: '120px', fontSize: '14px' }}>資料端點:</label>
        <input
          type="text"
          value={value.customEndpoints?.data || '/api/ecu/data'}
          onChange={(e) => updateSetting('customEndpoints', {
            ...value.customEndpoints,
            data: e.target.value
          })}
          placeholder="/api/ecu/data"
          style={{ 
            flex: 1, 
            padding: '4px 8px', 
            border: '1px solid #ccc', 
            borderRadius: '4px' 
          }}
        />
      </div>
      
      {/* AI 端點 */}
      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
        <label style={{ width: '120px', fontSize: '14px' }}>AI 端點:</label>
        <input
          type="text"
          value={value.customEndpoints?.ai || '/api/ai/analysis'}
          onChange={(e) => updateSetting('customEndpoints', {
            ...value.customEndpoints,
            ai: e.target.value
          })}
          placeholder="/api/ai/analysis"
          style={{ 
            flex: 1, 
            padding: '4px 8px', 
            border: '1px solid #ccc', 
            borderRadius: '4px' 
          }}
        />
      </div>
      
      {/* 啟用快取 */}
      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
        <label style={{ width: '120px', fontSize: '14px' }}>啟用快取:</label>
        <input
          type="checkbox"
          checked={value.cacheSettings?.enabled || false}
          onChange={(e) => updateSetting('cacheSettings', {
            ...value.cacheSettings,
            enabled: e.target.checked
          })}
        />
      </div>
      
      {/* 快取時間 */}
      {value.cacheSettings?.enabled && (
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
          <label style={{ width: '120px', fontSize: '14px' }}>快取時間 (秒):</label>
          <input
            type="number"
            value={value.cacheSettings?.ttl || 60}
            onChange={(e) => updateSetting('cacheSettings', {
              ...value.cacheSettings,
              ttl: parseInt(e.target.value, 10)
            })}
            min={10}
            max={3600}
            style={{ 
              width: '100px', 
              padding: '4px 8px', 
              border: '1px solid #ccc', 
              borderRadius: '4px' 
            }}
          />
        </div>
      )}
    </div>
  );
};