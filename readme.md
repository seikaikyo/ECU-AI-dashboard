# ECU AI 智慧監控 Grafana Plugin

> 🚗 專為研華ECU系統設計的智慧監控面板，提供即時監控、AI預測分析和系統健康狀態評估

## ✨ 功能特色

- **🔄 即時監控**: 支援多項ECU指標的即時數據展示
- **🤖 AI 預測分析**: 基於機器學習的趨勢預測和異常檢測
- **⚠️ 智慧告警**: 多層級告警系統，支援自訂閾值
- **📊 互動式圖表**: 高度可配置的時間序列圖表
- **💊 健康狀態**: 系統整體健康評分和建議
- **🎨 現代化UI**: 響應式設計，支援深色/淺色主題

## 🚀 快速開始

### 系統要求

- Grafana 8.0+ 
- Node.js 18+
- 支援的數據源: Prometheus, InfluxDB, MySQL, PostgreSQL

### 安裝方式

#### 方法1: 從 Grafana Plugin 商店安裝

```bash
# 使用 Grafana CLI 安裝
grafana-cli plugins install ecu-ai-monitoring-panel

# 重啟 Grafana 服務
sudo systemctl restart grafana-server
```

#### 方法2: 手動安裝

```bash
# 下載最新版本
wget https://github.com/ecu-ai/grafana-plugin/releases/latest/download/ecu-ai-monitoring-panel.zip

# 解壓到 Grafana plugins 目錄
unzip ecu-ai-monitoring-panel.zip -d /var/lib/grafana/plugins/

# 重啟 Grafana
sudo systemctl restart grafana-server
```

#### 方法3: 開發環境安裝

```bash
# 克隆儲存庫
git clone https://github.com/ecu-ai/grafana-plugin.git
cd grafana-plugin

# 安裝依賴
npm install

# 建置 plugin
npm run build

# 複製到 Grafana plugins 目錄
cp -r dist/ /var/lib/grafana/plugins/ecu-ai-monitoring-panel/

# 重啟 Grafana
sudo systemctl restart grafana-server
```

## 📋 配置指南

### 1. 建立面板

1. 在 Grafana 中建立新的 Dashboard
2. 點擊 "Add panel"
3. 在 Visualization 下拉選單中選擇 "ECU AI 監控面板"

### 2. 數據源配置

#### Prometheus 設定

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'ecu-monitoring'
    static_configs:
      - targets: ['ecu-server:9090']
    scrape_interval: 15s
    metrics_path: /metrics
```

#### InfluxDB 設定

```sql
-- 建立數據庫
CREATE DATABASE ecu_monitoring;

-- 建立測量表
CREATE MEASUREMENT ecu_data (
  time TIMESTAMP,
  device_id TAG,
  metric_name TAG,
  value FIELD
);
```

### 3. 面板選項配置

| 選項 | 說明 | 預設值 |
|------|------|--------|
| 面板標題 | 顯示在面板頂部的標題 | ECU AI 智慧監控 |
| 刷新間隔 | 自動刷新數據間隔(秒) | 30 |
| 選擇設備 | 要監控的ECU設備 | 3號機 |
| 監控指標 | 要顯示的監控指標 | 全部 |
| 啟用AI分析 | 開啟AI預測和異常檢測 | true |
| 預測時間範圍 | AI預測的時間範圍(分鐘) | 60 |
| 圖表高度 | 監控圖表的高度(px) | 300 |

### 4. AI 服務配置

#### 本地 AI 服務部署

```bash
# 使用 Docker 部署 AI 服務
docker run -d \
  --name ecu-ai-service \
  -p 8080:8080 \
  -e MODEL_PATH=/models/ecu-prediction.onnx \
  ecu-ai/prediction-service:latest
```

#### AI 端點配置

```javascript
// Grafana 面板配置
{
  "aiEndpoint": "http://localhost:8080/api/ai/analysis",
  "predictionEndpoint": "http://localhost:8080/api/ai/predict",
  "timeout": 30000
}
```

## 📊 數據格式

### 輸入數據格式

```json
{
  "timestamp": 1640995200000,
  "device_id": "ECU_001",
  "metrics": {
    "rightTempPV": 55.2,
    "rightRoomTemp": 51.8,
    "leftOutletTemp": 52.1,
    "egrCoolerTemp": 48.5,
    "hepaEfficiency": 94.2
  }
}
```

### AI 分析輸出

```json
{
  "predictions": [
    "未來1小時溫度趨勢：穩定",
    "系統效率預測：良好"
  ],
  "anomalies": [
    "right_temp_pv: 55.90 (medium)"
  ],
  "recommendations": [
    "建議檢查右側機控溫度控制系統"
  ],
  "healthScore": 85,
  "confidence": 0.92
}
```

## 🔧 開發指南

### 本地開發環境

```bash
# 安裝依賴
npm install

# 啟動開發模式 (自動重載)
npm run dev

# 類型檢查
npm run typecheck

# 程式碼檢查
npm run lint

# 執行測試
npm run test
```

### 目錄結構

```
ecu-ai-panel/
├── src/
│   ├── components/           # React 組件
│   │   ├── ECUPanel.tsx     # 主面板組件
│   │   ├── ECUMonitorChart.tsx
│   │   ├── AIAnalysisPanel.tsx
│   │   └── SystemHealthStatus.tsx
│   ├── types.ts             # TypeScript 類型定義
│   ├── module.ts            # Plugin 入口
│   └── plugin.json          # Plugin 配置
├── dist/                    # 建置輸出
├── package.json
├── webpack.config.js
└── README.md
```

### 自訂組件開發

```typescript
// 建立自訂指標組件
import React from 'react';
import { MetricConfig } from '../types';

interface CustomMetricProps {
  config: MetricConfig;
  value: number;
  onChange: (value: number) => void;
}

export const CustomMetric: React.FC<CustomMetricProps> = ({
  config,
  value,
  onChange
}) => {
  // 自訂組件邏輯
  return (
    <div className="custom-metric">
      <h3>{config.name}</h3>
      <span style={{ color: config.color }}>
        {value.toFixed(2)} {config.unit}
      </span>
    </div>
  );
};
```

## 🔌 API 整合

### REST API 端點

```bash
# 獲取設備數據
GET /api/ecu/data?device={device_id}&from={timestamp}&to={timestamp}

# AI 分析請求
POST /api/ai/analysis
Content-Type: application/json
{
  "device": "ECU_001",
  "data": [...],
  "options": {...}
}

# 預測請求
POST /api/ai/predict
Content-Type: application/json
{
  "device": "ECU_001",
  "horizon": 60,
  "baseData": [...]
}
```

### WebSocket 即時數據

```javascript
// WebSocket 連線
const ws = new WebSocket('ws://localhost:8080/api/realtime');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // 處理即時數據更新
  updateECUData(data);
};
```

## 🚨 故障排除

### 常見問題

**1. Plugin 無法載入**
```bash
# 檢查 Grafana 日誌
tail -f /var/log/grafana/grafana.log

# 確認 plugin 權限
chmod -R 755 /var/lib/grafana/plugins/ecu-ai-monitoring-panel/
```

**2. 數據不顯示**
- 檢查數據源連線狀態
- 確認查詢語法正確
- 驗證時間範圍設定

**3. AI 服務連線失敗**
- 確認 AI 服務端點可訪問
- 檢查網路防火牆設定
- 驗證 API 金鑰配置

### 除錯模式

```bash
# 啟用除錯日誌
export GF_LOG_LEVEL=debug

# 重啟 Grafana
sudo systemctl restart grafana-server

# 查看詳細日誌
journalctl -u grafana-server -f
```

## 📈 效能優化

### 資料查詢優化

```javascript
// 使用快取減少 API 呼叫
const cacheConfig = {
  enabled: true,
  ttl: 60, // 60秒快取
  maxSize: 1000 // 最大快取條目
};
```

### 圖表渲染優化

```javascript
// 限制數據點數量
const maxDataPoints = 1000;
const optimizedData = data.length > maxDataPoints 
  ? downsample(data, maxDataPoints)
  : data;
```

## 🤝 貢獻指南

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

本專案採用 Apache 2.0 授權 - 詳見 [LICENSE](LICENSE) 檔案

## 🙋‍♂️ 支援

- 📧 Email: support@ecu-ai.com
- 🐛 Issue: [GitHub Issues](https://github.com/ecu-ai/grafana-plugin/issues)
- 📖 文檔: [Wiki](https://github.com/ecu-ai/grafana-plugin/wiki)
- 💬 討論: [Discussions](https://github.com/ecu-ai/grafana-plugin/discussions)

## 🏷️ 版本歷史

- **v1.0.0** (2025-05-28)
  - ✨ 初始版本發布
  - 🔄 即時監控功能
  - 🤖 AI 預測分析
  - ⚠️ 智慧告警系統
  - 📊 互動式圖表
  - 💊 系統健康狀態

## 🎯 未來規劃

- **v1.1.0** - 預計 2025-07-01
  - 🔧 更多自訂化選項
  - 📱 行動裝置優化
  - 🔗 更多數據源支援
  - 📈 進階分析功能

- **v1.2.0** - 預計 2025-09-01
  - 🌐 多語言支援 (英文、日文)
  - 🎨 更多視覺主題
  - 📊 匯出功能
  - 🔔 推播通知

## 📸 截圖展示

### 主要介面
![ECU AI Dashboard](img/screenshot-dashboard.png)

### AI 分析面板
![AI Analysis](img/screenshot-ai-analysis.png)

### 配置選項
![Configuration](img/screenshot-config.png)

## 🔗 相關連結

- [Grafana 官方文檔](https://grafana.com/docs/)
- [Plugin 開發指南](https://grafana.com/docs/grafana/latest/developers/plugins/)
- [ECU 監控最佳實踐](https://docs.ecu-ai.com/best-practices)
- [AI 模型訓練指南](https://docs.ecu-ai.com/ai-training)

---

**Made with ❤️ by ECU AI Team**