/**
 * 数値を日本語形式でフォーマットする関数
 * @param {number} num フォーマットする数値
 * @returns {string} フォーマットされた文字列
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat('ja-JP').format(num);
};

/**
 * 日付を整形する
 * @param {string} dateString 日付文字列
 * @returns {string} MM/DD 形式の日付
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

/**
 * 大きな数値を短い形式に変換する (1M, 1B など)
 * @param {number} value 変換する数値
 * @returns {string} 変換後の文字列
 */
export const formatLargeNumber = (value) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  return formatNumber(value);
};