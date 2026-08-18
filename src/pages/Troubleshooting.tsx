import { useMemo, useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Reveal } from '../components/ui/Reveal';
import { deviceTypes } from '../data/deviceTypes';
import { priorityColor } from '../utils';
import { AlertTriangle, Wrench, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

export default function Troubleshooting() {
  const [query, setQuery] = useState('');

  const issues = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = deviceTypes.flatMap((d) =>
      (d.commonIssues ?? []).map((issue) => ({ device: d, issue }))
    );
    if (!q) return all;
    return all.filter(
      ({ device, issue }) =>
        device.shortName.toLowerCase().includes(q) ||
        device.fullName.toLowerCase().includes(q) ||
        issue.title.toLowerCase().includes(q) ||
        issue.symptoms.some((s) => s.toLowerCase().includes(q)) ||
        issue.workaround.some((s) => s.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Troubleshooting"
        subtitle="Common issues and step-by-step workarounds, ordered by device."
      />

      <div className="max-w-2xl mb-8">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search issues, symptoms or devices…"
        />
      </div>

      {issues.length === 0 ? (
        <EmptyState
          title="No issues found"
          message="Try a different keyword, e.g. 'offline', 'blank', 'TC', 'COD'."
        />
      ) : (
        <div className="space-y-6">
          {issues.map(({ device, issue }, i) => (
            <Reveal key={`${device.id}-${issue.id}`} delay={i * 30}>
              <Card className="border-mcd-red/10 shadow-lg shadow-mcd-red/5">
                <CardHeader
                  title={
                    <span className="flex items-center gap-3 flex-wrap">
                      <Link to={`/devices/${device.id}`} className="font-mono text-xl font-bold text-mcd-red hover:text-mcd-red-dark transition-colors drop-shadow-sm flex items-center gap-1">
                        {device.shortName} <ChevronRight className="w-4 h-4 opacity-50" />
                      </Link>
                      <span className="font-bold text-lg">{issue.title}</span>
                    </span>
                  }
                  subtitle={
                    <span className="font-semibold text-mcd-gray-800 dark:text-mcd-gray-200 mt-1">
                      {device.fullName}
                    </span>
                  }
                  action={
                    <div className="flex gap-2">
                      <Badge variant={priorityColor(issue.priority).replace('badge-', '') as 'red' | 'yellow' | 'gray'}>
                        {issue.priority}
                      </Badge>
                      <Badge variant="gray">{issue.frequency}</Badge>
                    </div>
                  }
                />
                <CardBody className="bg-mcd-gray-50/30 dark:bg-mcd-gray-800/10">
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-mcd-gray-400 mb-4">
                        <AlertTriangle className="w-3.5 h-3.5" /> Symptoms
                      </div>
                      <ul className="space-y-2">
                        {issue.symptoms.map((s) => (
                          <li key={s} className="flex items-start gap-3 text-sm font-medium text-mcd-gray-700 dark:text-mcd-gray-200">
                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-mcd-red shrink-0" />
                            <span className="leading-relaxed">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-mcd-gray-400 mb-4">
                        <Wrench className="w-3.5 h-3.5" /> Workaround (try in order)
                      </div>
                      <ol className="space-y-3">
                        {issue.workaround.map((step, i) => (
                          <li key={step} className="flex items-start gap-3 text-sm font-medium text-mcd-gray-800 dark:text-mcd-gray-100 p-3 rounded-xl bg-white dark:bg-mcd-gray-800 shadow-sm border border-mcd-gray-100 dark:border-mcd-gray-700">
                            <span className="w-6 h-6 rounded-md bg-mcd-red/10 text-mcd-red font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-mcd-gray-400 mb-4">
                        <AlertTriangle className="w-3.5 h-3.5 text-mcd-yellow-dark" /> Resolution / Escalate if…
                      </div>
                      <div className="flex items-start gap-3 p-4 rounded-xl gradient-border bg-gradient-to-br from-mcd-yellow/[0.08] to-mcd-yellow/[0.02]">
                        <AlertTriangle className="w-5 h-5 text-mcd-yellow-dark shrink-0 mt-0.5" />
                        <span className="font-medium text-sm text-mcd-gray-800 dark:text-mcd-gray-100 leading-relaxed">{issue.resolution}</span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
