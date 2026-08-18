import { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { SearchInput } from '../components/ui/SearchInput';
import { EmptyState } from '../components/ui/EmptyState';
import { Reveal } from '../components/ui/Reveal';
import { namingConventions, deviceMentions } from '../data/naming';
import { parseDeviceName } from '../utils';

export default function Naming() {
  const [query, setQuery] = useState('');

  const decoded = query.trim()
    ? Object.entries(deviceMentions).filter(([key, value]) =>
        key.toLowerCase().includes(query.trim().toLowerCase()) ||
        value.toLowerCase().includes(query.trim().toLowerCase())
      )
    : [];

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Naming Conventions"
        subtitle="Learn how stores and devices are named on tickets, labels and in the network."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {namingConventions.map((conv, i) => (
            <Reveal key={conv.pattern} delay={i * 50}>
              <Card>
                <CardHeader
                  title={
                    <code className="text-sm font-mono bg-mcd-gray-50 dark:bg-mcd-gray-900 border border-mcd-gray-200 dark:border-mcd-gray-700 px-3 py-1.5 rounded-lg text-mcd-gray-900 dark:text-mcd-gray-50 shadow-sm">
                      {conv.pattern}
                    </code>
                  }
                  subtitle="Naming components breakdown"
                />
                <CardBody>
                  <div className="space-y-4">
                    {conv.components.map((c) => (
                      <div key={c.key} className="relative rounded-xl border border-mcd-gray-200 dark:border-mcd-gray-700 p-4 bg-white dark:bg-mcd-gray-800 shadow-sm hover:border-mcd-red/30 transition-colors group overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-mcd-red to-mcd-red-light opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                          <div className="font-mono font-bold text-mcd-red text-base">{c.key}</div>
                          <div className="text-[11px] font-bold uppercase tracking-wider text-mcd-gray-400 font-mono bg-mcd-gray-50 dark:bg-mcd-gray-900 px-2 py-1 rounded-md">{c.format}</div>
                        </div>
                        <div className="text-sm font-semibold text-mcd-gray-900 dark:text-mcd-gray-50 mb-1">
                          {c.label}
                        </div>
                        <p className="text-sm text-mcd-gray-600 dark:text-mcd-gray-300 leading-relaxed mb-3">
                          {c.description}
                        </p>
                        {c.examples.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {c.examples.map((e) => (
                              <span
                                key={e}
                                className="font-mono text-xs bg-mcd-gray-50 dark:bg-mcd-gray-900 border border-mcd-gray-200 dark:border-mcd-gray-700 px-2.5 py-1 rounded-md text-mcd-gray-700 dark:text-mcd-gray-200 shadow-sm"
                              >
                                {e}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 rounded-xl gradient-border bg-gradient-to-br from-mcd-gray-50/50 to-white dark:from-mcd-gray-800/30 dark:to-mcd-gray-900">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-mcd-gray-400 mb-3">
                      Examples
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {conv.examples.map((e) => (
                        <span
                          key={e}
                          className="font-mono text-sm bg-white dark:bg-mcd-gray-800 border border-mcd-gray-200 dark:border-mcd-gray-700 px-3 py-1.5 rounded-lg shadow-sm text-mcd-gray-800 dark:text-mcd-gray-100"
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>

                  {conv.rules.length > 0 && (
                    <div className="mt-6">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-mcd-gray-400 mb-3">
                        Rules
                      </div>
                      <ul className="space-y-2">
                        {conv.rules.map((r) => (
                          <li key={r} className="flex items-start gap-3 text-sm font-medium text-mcd-gray-700 dark:text-mcd-gray-200 bg-mcd-gray-50/50 dark:bg-mcd-gray-800/30 p-3 rounded-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-mcd-yellow-dark mt-2 shrink-0" />
                            <span className="leading-relaxed">{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Reveal>
          ))}
        </div>

        <aside className="space-y-6">
          <Card className="border-mcd-red/10 shadow-lg shadow-mcd-red/5">
            <CardHeader
              title="Decoder"
              subtitle="Type a name from a ticket to see what it means"
            />
            <CardBody>
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="e.g. KVS Presenter, COD 2, Delphi…"
              />

              <div className="mt-6 min-h-[200px]">
                {query.trim() ? (
                  decoded.length > 0 ? (
                    <ul className="space-y-3">
                      {decoded.map(([key, value]) => {
                        const { index } = parseDeviceName(key);
                        return (
                          <li key={key} className="p-4 rounded-xl bg-mcd-gray-50/50 dark:bg-mcd-gray-800/30 border border-mcd-gray-100 dark:border-mcd-gray-700">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="font-mono font-bold text-base text-mcd-red drop-shadow-sm">
                                {key}
                              </span>
                              {index !== undefined && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-mcd-gray-400 bg-white dark:bg-mcd-gray-900 px-2 py-0.5 rounded-md border border-mcd-gray-200 dark:border-mcd-gray-700">
                                  unit {index}
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-medium text-mcd-gray-800 dark:text-mcd-gray-200 leading-relaxed">
                              {value}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <EmptyState
                      title={`No match for "${query}"`}
                      message="Check the device catalog or ask a senior engineer - then add it here."
                    />
                  )
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-mcd-gray-200 dark:border-mcd-gray-700 rounded-xl">
                    <p className="text-sm font-medium text-mcd-gray-600 dark:text-mcd-gray-300 leading-relaxed mb-4">
                      Try typing a short name you saw on a ticket, like:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <span className="font-mono text-xs bg-white dark:bg-mcd-gray-800 border border-mcd-gray-200 dark:border-mcd-gray-700 px-2 py-1 rounded-md shadow-sm">COD</span>
                      <span className="font-mono text-xs bg-white dark:bg-mcd-gray-800 border border-mcd-gray-200 dark:border-mcd-gray-700 px-2 py-1 rounded-md shadow-sm">KVS</span>
                      <span className="font-mono text-xs bg-white dark:bg-mcd-gray-800 border border-mcd-gray-200 dark:border-mcd-gray-700 px-2 py-1 rounded-md shadow-sm">Delphi</span>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-mcd-yellow/10 to-mcd-yellow/5 border-mcd-yellow/20">
            <h3 className="font-bold text-mcd-yellow-dark mb-4">
              Common ticket terms
            </h3>
            <div className="space-y-4">
              {[
                ['Offline', 'Device cannot reach the server / network'],
                ['Blank / White screen', 'Display not showing content'],
                ['0/0', 'KVS showing zero orders (offline state)'],
                ['Reseat', 'Unplug and re-plug the cable / card'],
                ['DT', 'Drive-Thru'],
                ['Onsite visit', 'Engineer must physically go to the store'],
              ].map(([term, meaning]) => (
                <div key={term} className="bg-white/60 dark:bg-black/20 p-3 rounded-lg border border-mcd-yellow/20">
                  <span className="block font-bold text-sm text-mcd-gray-900 dark:text-mcd-gray-50 mb-1">
                    {term}
                  </span>
                  <p className="text-xs font-medium text-mcd-gray-700 dark:text-mcd-gray-300 leading-relaxed">{meaning}</p>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
