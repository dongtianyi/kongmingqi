#!/bin/bash

# =============================================================================
# 孔明棋 - 静态站点部署脚本
# 部署到 www.beinanguo.com 的子路径
# =============================================================================

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 默认配置
SERVER_USER="${DEPLOY_USER:-root}"
SERVER_HOST="${DEPLOY_HOST:-}"
SERVER_PORT="${DEPLOY_PORT:-22}"
SSH_KEY_FILE="${DEPLOY_KEY:-}"
DEPLOY_PATH="${DEPLOY_PATH:-kmq-default}"
REMOTE_DIR="${DEPLOY_DIR:-/var/www/${DEPLOY_PATH}}"

# 本地项目目录
LOCAL_PROJECT_DIR="."

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--host)
            SERVER_HOST="$2"
            shift 2
            ;;
        -u|--user)
            SERVER_USER="$2"
            shift 2
            ;;
        -p|--port)
            SERVER_PORT="$2"
            shift 2
            ;;
        -i|--key)
            SSH_KEY_FILE="$2"
            shift 2
            ;;
        --path)
            DEPLOY_PATH="$2"
            REMOTE_DIR="/var/www/${DEPLOY_PATH}"
            shift 2
            ;;
        --help)
            echo "用法: $0 [选项]"
            echo ""
            echo "选项:"
            echo "  -h, --host HOST    服务器 IP"
            echo "  -u, --user USER    用户名 (默认: root)"
            echo "  -p, --port PORT    SSH 端口 (默认: 22)"
            echo "  -i, --key FILE     SSH 密钥文件"
            echo "  --path PATH        部署路径 (默认: kmq-default)"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${RED}未知参数: $1${NC}"
            exit 1
            ;;
    esac
done

# 构建 SSH 选项
get_ssh_opts() {
    if [ -n "$SSH_KEY_FILE" ]; then
        echo "-i $SSH_KEY_FILE"
    fi
}

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查配置
check_config() {
    log_info "检查配置..."

    if [ -z "$SERVER_HOST" ]; then
        log_error "服务器地址未设置！"
        echo "请使用: $0 -h your-server-ip 或设置 DEPLOY_HOST 环境变量"
        exit 1
    fi

    # 检查是否为孔明棋项目
    if [ ! -f "index.html" ] || [ ! -d "js" ]; then
        log_error "未找到 index.html 或 js 目录，请确认在孔明棋项目根目录执行"
        exit 1
    fi

    if [ -n "$SSH_KEY_FILE" ] && [ ! -f "$SSH_KEY_FILE" ]; then
        log_error "SSH 密钥文件不存在: $SSH_KEY_FILE"
        exit 1
    fi

    log_info "配置检查通过"
    log_info "服务器: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"
    log_info "部署路径: $REMOTE_DIR"
    log_info "访问地址: https://www.beinanguo.com/$DEPLOY_PATH/"
}

# 测试 SSH 连接
test_connection() {
    log_info "测试 SSH 连接..."
    SSH_OPTS=$(get_ssh_opts)

    if ssh -p $SERVER_PORT $SSH_OPTS -o ConnectTimeout=5 $SERVER_USER@$SERVER_HOST "echo 'SSH 连接成功'" > /dev/null 2>&1; then
        log_info "SSH 连接成功"
    else
        log_error "SSH 连接失败"
        exit 1
    fi
}

# 创建远程目录
create_remote_dirs() {
    log_info "创建远程目录..."
    SSH_OPTS=$(get_ssh_opts)

    ssh -p $SERVER_PORT $SSH_OPTS $SERVER_USER@$SERVER_HOST "mkdir -p $REMOTE_DIR"

    if [ $? -eq 0 ]; then
        log_info "远程目录创建成功"
    else
        log_error "远程目录创建失败"
        exit 1
    fi
}

# 上传文件
upload_files() {
    log_info "上传静态文件..."
    SSH_OPTS=$(get_ssh_opts)

    # 使用 rsync 同步文件
    if command -v rsync &> /dev/null; then
        log_info "使用 rsync 同步文件..."
        rsync -avz --delete \
            -e "ssh -p $SERVER_PORT $SSH_OPTS" \
            --exclude '.git' \
            --exclude '.DS_Store' \
            --exclude 'deploy.env' \
            --exclude 'deploy.sh' \
            --exclude 'Makefile' \
            --exclude '*.swp' \
            --exclude 'test.js' \
            $LOCAL_PROJECT_DIR/ $SERVER_USER@$SERVER_HOST:$REMOTE_DIR/
    else
        log_info "使用 scp 上传文件..."
        # 先清空远程目录
        ssh -p $SERVER_PORT $SSH_OPTS $SERVER_USER@$SERVER_HOST "rm -rf $REMOTE_DIR/*"
        # 上传文件
        scp -P $SERVER_PORT $SSH_OPTS -r \
            $LOCAL_PROJECT_DIR/index.html \
            $LOCAL_PROJECT_DIR/js \
            $LOCAL_PROJECT_DIR/css \
            $LOCAL_PROJECT_DIR/images \
            $SERVER_USER@$SERVER_HOST:$REMOTE_DIR/ 2>/dev/null || true
    fi

    if [ $? -eq 0 ]; then
        log_info "文件上传成功"
    else
        log_error "文件上传失败"
        exit 1
    fi
}

# 设置文件权限
set_permissions() {
    log_info "设置文件权限..."
    SSH_OPTS=$(get_ssh_opts)

    ssh -p $SERVER_PORT $SSH_OPTS $SERVER_USER@$SERVER_HOST "
        chown -R www-data:www-data $REMOTE_DIR 2>/dev/null || chown -R nginx:nginx $REMOTE_DIR 2>/dev/null || true
        find $REMOTE_DIR -type d -exec chmod 755 {} \;
        find $REMOTE_DIR -type f -exec chmod 644 {} \;
    "

    log_info "权限设置完成"
}

# 显示部署后提示
show_post_deploy_info() {
    echo ""
    log_info "========================================="
    log_info "nginx 配置由 roodle_nginx_conf 项目统一管理"
    log_info "如需修改 nginx 配置，请前往:"
    log_info "  /Users/t/beinanguo/roodle_nginx_conf"
    log_info "========================================="
}

# 显示 nginx 配置片段
show_nginx_config() {
    echo ""
    log_info "========================================="
    log_info "nginx 配置片段（需要手动添加到 nginx.conf）"
    log_info "========================================="
    echo ""
    echo "# 孔明棋游戏 - 添加到 server 块中"
    echo "location /$DEPLOY_PATH/ {"
    echo "    alias $REMOTE_DIR/;"
    echo "    index index.html;"
    echo "    try_files \$uri \$uri/ /$DEPLOY_PATH/index.html;"
    echo "}"
    echo ""
    log_info "========================================="
    log_info "或者运行: make nginx-conf 查看配置"
    log_info "========================================="
}

# 显示部署信息
show_deployment_info() {
    log_info "========================================="
    log_info "🎉 部署完成！"
    log_info "========================================="
    log_info "服务器: $SERVER_USER@$SERVER_HOST"
    log_info "部署目录: $REMOTE_DIR"
    log_info "访问地址: https://www.beinanguo.com/$DEPLOY_PATH/"
    log_info "========================================="
    log_info "提示："
    log_info "  • 如果是首次部署，需要手动添加 nginx 配置"
    log_info "  • 运行 'make nginx-conf' 查看配置片段"
    log_info "  • 添加配置后运行 'ssh $SERVER_USER@$SERVER_HOST \"systemctl restart nginx\"'"
    log_info "========================================="
}

# 主函数
main() {
    echo ""
    log_info "========================================="
    log_info "🚀 开始部署孔明棋到云服务器"
    log_info "========================================="
    echo ""

    check_config
    test_connection
    create_remote_dirs
    upload_files
    set_permissions

    echo ""
    show_deployment_info
    show_post_deploy_info
    echo ""
}

# 执行主函数
main
