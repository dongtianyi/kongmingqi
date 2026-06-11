# 孔明棋游戏 - 静态站点部署
# 部署到 www.beinanguo.com 的子路径

.PHONY: help deploy deploy-check test serve git-status git-sync git-log clean

# 默认目标
.DEFAULT_GOAL := help

# 颜色输出
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

PROJECT_NAME := 孔明棋游戏

help: ## 显示帮助信息
	@echo "$(BLUE)======================================"
	@echo "  $(PROJECT_NAME) - Makefile"
	@echo "  静态站点 (HTML/CSS/JS)"
	@echo "======================================$(NC)"
	@echo ""
	@echo "$(GREEN)部署命令:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""

# ==================== 部署相关 ====================

deploy-check: ## 检查部署配置
	@if [ ! -f deploy.env ]; then \
		echo "$(RED)✗ deploy.env 配置文件不存在$(NC)"; \
		echo "请先创建配置文件，参考 deploy.env 示例"; \
		exit 1; \
	fi
	@echo "$(GREEN)✓ deploy.env 配置文件存在$(NC)"
	@echo ""
	@echo "$(BLUE)当前配置:$(NC)"
	@set -a; . ./deploy.env; set +a; \
	echo "  服务器: $$DEPLOY_USER@$$DEPLOY_HOST:$$DEPLOY_PORT"; \
	echo "  SSH密钥: $${DEPLOY_KEY:-未设置}"; \
	echo "  部署路径: $$DEPLOY_PATH"; \
	echo "  目标目录: /var/www/$$DEPLOY_PATH"; \
	echo ""; \
	echo "$(GREEN)访问地址:$(NC)"; \
	echo "  https://www.beinanguo.com/$$DEPLOY_PATH/"

deploy: ## 部署到服务器
	@echo "$(BLUE)🚀 部署 $(PROJECT_NAME) 到服务器...$(NC)"
	@if [ ! -f deploy.env ]; then \
		echo "$(RED)错误: 未找到 deploy.env 配置文件$(NC)"; \
		echo ""; \
		echo "$(YELLOW)请先创建配置文件:$(NC)"; \
		echo "  cp deploy.env.example deploy.env"; \
		echo "  vi deploy.env"; \
		echo ""; \
		exit 1; \
	fi
	@if [ ! -f deploy.sh ]; then \
		echo "$(RED)错误: deploy.sh 文件不存在$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✓ 加载配置文件 deploy.env$(NC)"
	@set -a; . ./deploy.env; set +a; \
	chmod +x deploy.sh; \
	bash deploy.sh

# Nginx 配置由 roodle_nginx_conf 项目统一管理
# 项目地址: /Users/t/beinanguo/roodle_nginx_conf

# ==================== 本地开发 ====================

test: ## 运行测试
	@echo "$(BLUE)🧪 运行测试...$(NC)"
	@node test.js

serve: ## 启动本地开发服务器
	@echo "$(BLUE)🚀 启动本地服务器...$(NC)"
	@echo ""
	@echo "访问地址: http://localhost:8000"
	@echo ""
	@python3 -m http.server 8000

clean: ## 清理临时文件
	@echo "$(YELLOW)🧹 清理临时文件...$(NC)"
	@find . -name "*.swp" -delete 2>/dev/null || true
	@find . -name "*~" -delete 2>/dev/null || true
	@find . -name ".DS_Store" -delete 2>/dev/null || true
	@echo "$(GREEN)✓ 清理完成$(NC)"

# ==================== Git 操作 ====================

git-status: ## 查看 Git 状态
	@echo "$(BLUE)📊 Git 状态:$(NC)"
	@git status

git-sync: ## 提交并推送代码 (使用 MSG="提交信息")
	@if [ -z "$(MSG)" ]; then \
		echo "$(RED)❌ 错误: 请提供提交消息$(NC)"; \
		echo "$(YELLOW)用法: make git-sync MSG=\"你的提交消息\"$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)➕ 添加所有更改...$(NC)"
	@git add .
	@echo "$(BLUE)💾 提交更改...$(NC)"
	@git commit -m "$(MSG)"
	@echo "$(BLUE)⬆️  推送到远程...$(NC)"
	@git push
	@echo "$(GREEN)✓ 提交并推送完成！$(NC)"

git-log: ## 查看最近的提交记录
	@echo "$(BLUE)📋 最近 10 条提交记录:$(NC)"
	@git log --oneline -10
