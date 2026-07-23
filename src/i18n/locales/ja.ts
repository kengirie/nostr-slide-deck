import type { en } from './en';

type Translation = { [K in keyof typeof en]: Record<keyof (typeof en)[K], string> };

export const ja: Translation = {
  app: {
    name: '紙芝居',
    tagline: 'Nostrのスライド共有',
  },
  hero: {
    eyebrow: 'Nostrのスライド共有',
    title: 'PDFを置くだけ。共有できるスライドページに。',
    lead: 'リンクを貼れば1枚目がカードで開く。読む人はページをめくり、zapで応援できる。アカウント登録は不要 — Nostrの鍵があなたです。',
    dropTitle: 'ここにPDFをドロップ',
    dropHint: 'クリックしてファイルを選ぶこともできます',
  },
  features: {
    cards: 'X・Slackでカード展開',
    viewer: 'ページ送りビューア',
    zaps: '発表者へ直接zap',
  },
  notReady: {
    title: '印刷機は準備中です',
    desc: '公開機能は次の工程で入ります。',
  },
  footer: {
    note: 'スライドは公開リレーとBlossomサーバーに保存されます。運営に依存せず、持ち運べます。',
    source: 'ソースコード',
  },
  theme: {
    toggle: 'ダークモード切替',
  },
  lang: {
    label: '言語',
  },
};
