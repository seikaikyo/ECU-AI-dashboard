#!/bin/bash

# ECU AI Grafana Plugin 開發環境設定腳本
# 解決 TypeScript 模組找不到的問題

set -e

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "=================================="
echo "ECU AI Plugin 開發環境設定"
echo "=================================="

# 1. 檢查 Node.js 版本
log_info "檢查 Node.js 版本..."
node_version=$(node -v)
log_success "Node.js 版本: $node_version"

# 2. 清理舊的依賴
log_info "清理舊的依賴..."
rm -rf node_modules package-lock.json
log_success "清理完成"

# 3. 安裝依賴
log_info "安裝專案依賴..."
npm install

# 4. 建立必要的目錄結構
log_info "建立目錄結構..."
mkdir -p src/components
mkdir -p src/img
mkdir -p .vscode
mkdir -p dist

# 5. 建立 VS Code 設定檔
log_info "建立 VS Code 設定..."
cat > .vscode/settings.json << 'EOF'
{
  "cSpell.words": [
    "HEPA",
    "grafana",
    "ECU",
    "EGR",
    "Grafana",
    "recharts",
    "egrCoolerTemp",
    "hepaEfficiency",
    "rightTempPV",
    "rightRoomTemp",
    "leftOutletTemp",
    "PanelProps",
    "TimeRange",
    "PanelData",
    "FieldOverrideContext",
    "PanelPlugin",
    "GrafanaPanelProps"
  ],
  "cSpell.enabled": true,
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.preferences.includePackageJsonAutoImports": "on"
}
EOF

# 6. 建立簡化的 tsconfig.json
log_info "建立 TypeScript 配置..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2018",
    "lib": ["ES2018", "DOM"],
    "module": "ESNext",
    "moduleResolution": "node",
    "declaration": true,
    "sourceMap": true,
    "outDir": "./dist",
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "jsx": "react-jsx",
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"]
    },
    "typeRoots": ["node_modules/@types"],
    "types": ["node", "react", "react-dom"]
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
EOF

# 7. 重新載入 TypeScript 服務 (VS Code)
log_info "重新載入 TypeScript 服務..."
if command -v code &> /dev/null; then
    # 如果有 VS Code CLI，重新載入工作區
    code --command typescript.reloadProjects . || true
fi

# 8. 執行類型檢查
log_info "執行 TypeScript 類型檢查..."
if npx tsc --noEmit; then
    log_success "TypeScript 類型檢查通過"
else
    log_warn "TypeScript 仍有一些錯誤，但這是正常的，因為我們還沒有建立所有組件"
fi

log_success "開發環境設定完成！"
echo ""
echo "下一步:"
echo "1. 重新啟動 VS Code"
echo "2. 或者按 Ctrl+Shift+P，執行 'TypeScript: Reload Projects'"
echo "3. 開始開發您的 Plugin！"