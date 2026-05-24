export const EFF_FACADE_ICON_NAMES = {
  newChat: 'lucide:square-pen',
  history: 'lucide:history',
  debug: 'lucide:bug',
  settings: 'lucide:settings',
  send: 'lucide:send',
  bot: 'lucide:sparkles',
  user: 'lucide:user',
  success: 'lucide:check-circle-2',
  error: 'lucide:circle-alert',
  externalLink: 'lucide:external-link',
  shield: 'lucide:shield-check',
  table: 'lucide:table-2',
  close: 'lucide:x',
  loader: 'lucide:loader-circle',
  route: 'lucide:route',
  keyboard: 'lucide:corner-down-left',
  clock: 'lucide:clock-3',
  play: 'lucide:play',
  circle: 'lucide:circle',
  code: 'lucide:braces',
  server: 'lucide:server',
  package: 'lucide:package',
  database: 'lucide:database',
  activity: 'lucide:activity',
  chevronRight: 'lucide:chevron-right',
  search: 'lucide:search',
  brain: 'lucide:brain',
  wrench: 'lucide:wrench',
  panel: 'lucide:panel-top',
  dot: 'lucide:dot'
} as const

export const EFF_FACADE_TONE_CLASSES = {
  shell:
    'h-screen overflow-hidden bg-eff-bg text-eff-text font-sans selection:bg-eff-accent/10',
  toolbar:
    'flex h-screen w-[60px] shrink-0 flex-col items-center gap-2 border-r border-eff-border bg-eff-surface px-2 py-3',
  iconButton:
    'grid h-10 w-10 place-items-center rounded-eff-lg text-eff-muted transition-all duration-200 ease-out hover:bg-eff-muted-surface hover:text-eff-text hover:shadow-eff-hairline active:scale-95 focus:outline-none focus:ring-2 focus:ring-eff-border-strong',
  iconButtonActive:
    'bg-eff-accent text-white shadow-eff-hairline hover:bg-eff-accent hover:text-white',
  conversation:
    'relative flex h-screen min-w-0 flex-1 flex-col overflow-hidden bg-eff-bg',
  drawer:
    'h-screen w-[420px] shrink-0 overflow-y-auto border-l border-eff-border bg-eff-surface shadow-eff-soft',
  card:
    'rounded-eff-xl border border-eff-border bg-eff-surface shadow-eff-hairline transition-all duration-200 ease-out',
  bubble:
    'rounded-eff-2xl border border-eff-border bg-eff-surface px-4 py-3 shadow-eff-hairline transition-all duration-200 ease-out'
} as const
