#!/bin/bash

# ECU AI Grafana Plugin 建置腳本
# 用法: ./build-plugin.sh [dev|prod|release]

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函數定義
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

# 檢查必要工具
check_requirements() {
    log_info "檢查建置環境..."
    
    # 檢查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安裝，請先安裝 Node.js 18+"
        exit 1
    fi
    
    local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        log_error "Node.js 版本過舊，需要 18+，目前版本: $(node -v)"
        exit 1
    fi
    
    # 檢查 npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安裝"
        exit 1
    fi
    
    log_success "環境檢查通過"
}

# 清理舊的建置檔案
clean_build() {
    log_info "清理舊的建置檔案..."
    rm -rf dist/
    rm -rf node_modules/.cache/
    log_success "清理完成"
}

# 安裝依賴
install_dependencies() {
    log_info "安裝專案依賴..."
    npm ci
    log_success "依賴安裝完成"
}

# 程式碼品質檢查
run_quality_checks() {
    log_info "執行程式碼品質檢查..."
    
    # TypeScript 類型檢查
    log_info "執行 TypeScript 類型檢查..."
    npm run typecheck
    
    # ESLint 檢查
    log_info "執行 ESLint 檢查..."
    npm run lint
    
    # 執行測試
    if [ -f "jest.config.js" ]; then
        log_info "執行單元測試..."
        npm run test:ci
    fi
    
    log_success "程式碼品質檢查通過"
}

# 建置專案
build_project() {
    local mode=$1
    log_info "建置專案 (模式: $mode)..."
    
    case $mode in
        "dev")
            npm run build -- --env development
            ;;
        "prod"|"release")
            npm run build -- --env production
            ;;
        *)
            npm run build
            ;;
    esac
    
    log_success "專案建置完成"
}

# 驗證建置結果
validate_build() {
    log_info "驗證建置結果..."
    
    # 檢查必要檔案
    local required_files=(
        "dist/module.js"
        "dist/plugin.json"
        "dist/README.md"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            log_error "缺少必要檔案: $file"
            exit 1
        fi
    done
    
    # 檢查 plugin.json 格式
    if ! jq empty dist/plugin.json 2>/dev/null; then
        log_error "plugin.json 格式錯誤"
        exit 1
    fi
    
    # 檢查檔案大小
    local module_size=$(stat -f%z dist/module.js 2>/dev/null || stat -c%s dist/module.js 2>/dev/null)
    if [ "$module_size" -lt 1000 ]; then
        log_error "module.js 檔案過小，可能建置失敗"
        exit 1
    fi
    
    log_success "建置結果驗證通過"
}

# 產生發布包
create_release_package() {
    log_info "產生發布包..."
    
    local version=$(jq -r '.version' package.json)
    local package_name="ecu-ai-monitoring-panel-v${version}"
    
    # 建立發布目錄
    mkdir -p releases
    
    # 打包
    cd dist
    zip -r "../releases/${package_name}.zip" . -x "*.map"
    cd ..
    
    # 產生 checksums
    cd releases
    sha256sum "${package_name}.zip" > "${package_name}.sha256"
    cd ..
    
    log_success "發布包已產生: releases/${package_name}.zip"
}

# 安裝到本地 Grafana
install_to_grafana() {
    local grafana_plugins_dir="/var/lib/grafana/plugins"
    local plugin_dir="${grafana_plugins_dir}/ecu-ai-monitoring-panel"
    
    if [ ! -d "$grafana_plugins_dir" ]; then
        log_warn "Grafana plugins 目錄不存在: $grafana_plugins_dir"
        log_info "請手動複製 dist/ 目錄到您的 Grafana plugins 目錄"
        return
    fi
    
    log_info "安裝到本地 Grafana..."
    
    # 備份舊版本（如果存在）
    if [ -d "$plugin_dir" ]; then
        sudo mv "$plugin_dir" "${plugin_dir}.backup.$(date +%s)"
    fi
    
    # 複製新版本
    sudo cp -r dist/ "$plugin_dir"
    sudo chown -R grafana:grafana "$plugin_dir"
    sudo chmod -R 755 "$plugin_dir"
    
    log_success "Plugin 已安裝到 $plugin_dir"
    log_info "請重啟 Grafana 服務: sudo systemctl restart grafana-server"
}

# 顯示建置資訊
show_build_info() {
    log_info "建置資訊:"
    echo "  版本: $(jq -r '.version' package.json)"
    echo "  建置時間: $(date)"
    echo "  Node.js: $(node -v)"
    echo "  npm: $(npm -v)"
    echo "  建置大小: $(du -sh dist/ | cut -f1)"
    
    if [ -d "releases" ]; then
        echo "  發布包:"
        ls -la releases/ | grep -E '\.(zip|sha256)$' | awk '{print "    " $9 " (" $5 " bytes)"}'
    fi
}

# 主程式
main() {
    local mode=${1:-prod}
    
    echo "=================================="
    echo "ECU AI Grafana Plugin 建置工具"
    echo "=================================="
    
    case $mode in
        "dev")
            log_info "開發模式建置"
            check_requirements
            install_dependencies
            build_project "dev"
            validate_build
            ;;
        "prod")
            log_info "生產模式建置"
            check_requirements
            clean_build
            install_dependencies
            run_quality_checks
            build_project "prod"
            validate_build
            ;;
        "release")
            log_info "發布模式建置"
            check_requirements
            clean_build
            install_dependencies
            run_quality_checks
            build_project "release"
            validate_build
            create_release_package
            ;;
        "install")
            log_info "建置並安裝到本地 Grafana"
            check_requirements
            clean_build
            install_dependencies
            build_project "prod"
            validate_build
            install_to_grafana
            ;;
        "clean")
            log_info "清理建置檔案"
            clean_build
            rm -rf releases/
            log_success "清理完成"
            return
            ;;
        *)
            echo "用法: $0 [dev|prod|release|install|clean]"
            echo ""
            echo "模式說明:"
            echo "  dev     - 開發模式建置（快速，包含 source maps）"
            echo "  prod    - 生產模式建置（優化，執行品質檢查）"
            echo "  release - 發布模式建置（包含打包）"
            echo "  install - 建置並安裝到本地 Grafana"
            echo "  clean   - 清理所有建置檔案"
            exit 1
            ;;
    esac
    
    show_build_info
    log_success "建置流程完成！"
}

# 執行主程式
main "$@"