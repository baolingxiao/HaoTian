export function violatesPolicy(text: string): boolean {
  // 极简占位：可替换为更完整的分类器/关键词
  const banned = ["身份证号", "银行卡号"];
  return banned.some(k => text.includes(k));
}

export const refusal = "抱歉，我无法帮助处理这个请求。如果你愿意，我可以提供更安全的替代方案或相关科普信息。";



