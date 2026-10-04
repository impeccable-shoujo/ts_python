// 卡片库文本工具：Markdown 转纯文本摘要、截断、日期格式化（页面与 CardGrid 共用）。

// 去除常见 Markdown 语法，得到可读纯文本摘要（网格预览用，不渲染 Markdown）。
export function toPlainText(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, '') // 标题
    .replace(/\*\*([^*]+)\*\*/g, '$1') // 加粗
    .replace(/\*([^*]+)\*/g, '$1') // 斜体
    .replace(/`([^`]+)`/g, '$1') // 行内代码
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // 图片
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 链接
    .replace(/\n{2,}/g, '\n')
    .replace(/\n/g, ' ')
    .trim();
}

// 截断过长文本并加省略号。
export function truncate(text: string, max = 120): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

// ISO 日期字符串转 YYYY-MM-DD。
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
