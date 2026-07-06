import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-obsidian-950/50">
      <div className="container grid gap-10 py-16 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-electric">
              <span className="font-display text-sm font-bold text-obsidian-950">R</span>
            </div>
            <span className="font-display text-lg font-bold">
              Riot<span className="text-gradient-electric">Graphs</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-graphite-300">
            The most advanced competitive stats platform for the entire Riot Games
            ecosystem. Built for esports pros, coaches and ranked climbers.
          </p>
          <p className="mt-4 max-w-md text-[11px] leading-relaxed text-graphite-400">
            RiotGraphs isn't endorsed by Riot Games and doesn't reflect the views or opinions
            of Riot Games or anyone officially involved in producing or managing Riot Games
            properties. Riot Games and all associated properties are trademarks or registered
            trademarks of Riot Games, Inc.
          </p>
        </div>

        <FooterCol
          title="Games"
          links={[
            ['League of Legends', '/lol'],
            ['Valorant', '/valorant'],
            ['Teamfight Tactics', '/tft'],
            ['Legends of Runeterra', '/lor'],
          ]}
        />
        <FooterCol
          title="Platform"
          links={[
            ['Rankings', '/rankings'],
            ['Tier List', '/tier-list'],
            ['Compare Players', '/compare'],
            ['API', '/developers'],
            ['Pricing', '/pricing'],
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            ['About', '/about'],
            ['Blog', '/blog'],
            ['Privacy', '/privacy'],
            ['Terms', '/terms'],
            ['Status', '/status'],
          ]}
        />
      </div>
      <div className="border-t border-white/5">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 text-xs text-graphite-400 md:flex-row">
          <p>© {new Date().getFullYear()} RiotGraphs. All rights reserved.</p>
          <p className="font-mono tracking-widest">status: <span className="text-electric">operational</span></p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-graphite-400">{title}</h3>
      <ul className="space-y-2 text-sm">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-graphite-300 transition hover:text-electric">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
