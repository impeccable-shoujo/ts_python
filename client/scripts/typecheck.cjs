// 供 lint-staged 调用的 typecheck 包装脚本。
// 根因：lint-staged 会向命令末尾追加暂存文件列表，而 `tsc <files>` 会忽略 tsconfig.json 的
// compilerOptions（退回默认 ES5 / lib 缺失），导致 async/Promise/padStart/isNaN 等误报。
// 故此处显式忽略传入参数，对整个项目执行 `tsc --noEmit`（读取 tsconfig.json，target/lib 正确）。
const { execSync } = require('child_process');
const path = require('path');

const clientDir = path.resolve(__dirname, '..');
try {
  execSync('npx tsc --noEmit', { cwd: clientDir, stdio: 'inherit' });
} catch (err) {
  process.exit(1);
}
