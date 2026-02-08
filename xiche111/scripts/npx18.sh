#!/bin/sh
# 项目专用 Node.js 18 包装脚本
# 使用 brew 安装的 node@18，不影响全局 node 版本
NODE18_DIR="/usr/local/opt/node@18"

if [ ! -x "$NODE18_DIR/bin/node" ]; then
  echo "Error: Node.js 18 not found. Install with: brew install node@18" >&2
  exit 1
fi

export PATH="$NODE18_DIR/bin:$PATH"
exec "$NODE18_DIR/bin/npx" "$@"
