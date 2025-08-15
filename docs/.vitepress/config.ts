import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Cano Ts",
  description: "A lightweight utility, inspired by Elixir’s pipe operator |>, for composing sync and async functions in a clean, readable pipeline. ",
  base: "/cano-ts/",
  head: [
    [
      "link",
      {
        rel: "icon",
        href: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="85">🔗</text></svg>',
      },
    ],
  ],
  themeConfig: {
    socialLinks: [
      { icon: "github", link: "https://github.com/HenriqueArtur/cano-ts" },
    ],
    sidebar: [
      {
        items: [
          { text: '📚 Introduction', link: '/index' },
          { text: '🚀 Get Started', link: '/get-started' },
          { text: '👽️ API', link: '/api' },
          { text: '🔧 E Module Examples', link: '/examples' },
        ]
      }
    ],
    footer: {
      message: 'Made with 💜 by <a href="https://github.com/HenriqueArtur" target="_blank">Henrique Artur</a>',
      copyright: `Copyright © ${new Date().getFullYear()}`
    },
    search: {
      provider: 'local'
    }
  }
})
