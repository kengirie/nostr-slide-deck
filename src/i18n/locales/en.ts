export const en = {
  app: {
    name: 'Kamishibai',
    tagline: 'Slides on Nostr',
  },
  hero: {
    eyebrow: 'Slides on Nostr',
    title: 'Drop a PDF, get a slide page worth sharing.',
    lead: 'Links unfurl into a card of your first slide. Readers flip through the pages and send you sats. No sign-up — your Nostr key is you.',
    dropTitle: 'Drop your PDF here',
    dropHint: 'or click to choose a file',
  },
  features: {
    cards: 'Card previews on X and Slack',
    viewer: 'Page-flip reader',
    zaps: 'Zaps straight to the speaker',
  },
  publish: {
    rendering: 'Setting the type…',
    formTitle: 'Deck details',
    title: 'Title',
    summary: 'Summary',
    hashtags: 'Hashtags',
    hashtagsHint: 'Separate with spaces',
    slug: 'Deck ID',
    slugHint: 'Lowercase letters, digits and hyphens — up to 13 characters',
    publishButton: 'Publish',
    publishSoon: 'Publishing arrives in the next step of the build',
    startOver: 'Start over',
    pages: 'Pages',
    errorTitle: 'Could not read this PDF',
    errorPassword: 'This PDF is password-protected. Remove the password and try again.',
    tryAgain: 'Try another file',
    notPdf: 'That file is not a PDF',
  },
  footer: {
    note: 'Your decks live on public relays and Blossom servers — portable, mirrorable, yours.',
    source: 'Source',
  },
  theme: {
    toggle: 'Toggle dark mode',
  },
  lang: {
    label: 'Language',
  },
} as const;
