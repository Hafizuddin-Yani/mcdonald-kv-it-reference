import { Link } from 'react-router';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Reveal } from '../components/ui/Reveal';
import { deviceTypes } from '../data/deviceTypes';
import {
  ClipboardCheck,
  Smartphone,
  Wrench,
  MessageCircle,
  BookOpen,
  Tag,
  ArrowRight,
} from 'lucide-react';

const checklists = [
  {
    title: 'Your First Week',
    items: [
      'Get access to the ticketing inbox (email) and understand the ticket flow',
      'Learn the SLA basics: P1/P2/P3/P4 priority and TTR (time to resolve)',
      'Set up the device taxonomy - walk through every device in this catalog',
      'Do a store visit ride-along with a senior engineer (pick a DT store first)',
      'Create your store list for Klang Valley and mark your territory',
      'Install this reference app on your phone and enable offline mode',
    ],
  },
  {
    title: 'Reading a Ticket (what each field means)',
    items: [
      'SLA / Priority: P3 NORMAL = routine issue, has TTR deadline',
      'TTR (Time To Resolve): the deadline by which the issue should be resolved',
      'Reporter: who raised it - contact them directly',
      'Store # + Name: which branch (e.g. #424 Amerin Balakong DT)',
      'Issue line: device + problem (e.g. "KVS Counter Presenter | Offline")',
      'Workaround: what was already tried - do not repeat blindly',
      'User request onsite: means remote steps failed, plan a visit',
    ],
  },
  {
    title: 'Before Calling the Store Manager',
    items: [
      'Check this app: what device is it, where does it live?',
      'Check recent tickets for that store/device - is it a repeat?',
      'Try remote access if available (verify device is reachable)',
      'Only call the manager if you genuinely need physical eyes or access',
      'Log everything you tried - the ticket must show your work',
    ],
  },
];

const essential = deviceTypes
  .filter((d) =>
    ['TC', 'KVS', 'KVS_PRESENTER', 'COD', 'DELPHI', 'SWITCH', 'DT_HEADSET', 'KIOSK'].includes(d.id)
  )
  .map((d) => ({ ...d, priority: 'LEARN FIRST' }));

export default function Onboarding() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        title="New Engineer Onboarding"
        subtitle="Everything a new McDonald's MY Klang Valley IT engineer needs to know in the first weeks."
      />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="section-title">
              <ClipboardCheck className="w-5 h-5 text-mcd-red" /> Checklists
            </h2>
            <div className="grid gap-6">
              {checklists.map((list, i) => (
                <Reveal key={list.title} delay={i * 50}>
                  <Card className="border-mcd-red/10 shadow-lg shadow-mcd-red/5">
                    <CardHeader title={list.title} />
                    <CardBody className="bg-mcd-gray-50/30 dark:bg-mcd-gray-800/10">
                      <ul className="space-y-3">
                        {list.items.map((item, j) => (
                          <li key={item} className="flex items-start gap-4 text-sm font-medium text-mcd-gray-800 dark:text-mcd-gray-100 p-3 rounded-xl bg-white dark:bg-mcd-gray-800 shadow-sm border border-mcd-gray-100 dark:border-mcd-gray-700">
                            <span className="w-7 h-7 rounded-lg bg-mcd-red/10 text-mcd-red font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {j + 1}
                            </span>
                            <span className="leading-relaxed mt-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardBody>
                  </Card>
                </Reveal>
              ))}
            </div>
          </section>

          <section>
            <h2 className="section-title">
              <BookOpen className="w-5 h-5 text-mcd-red" /> Learn These Devices First
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {essential.map((d, i) => (
                <Reveal key={d.id} delay={i * 30}>
                  <Link to={`/devices/${d.id}`}>
                    <Card hover className="h-full p-5 border-mcd-red/10 shadow-lg shadow-mcd-red/5 group">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="font-mono text-xl font-bold text-mcd-red drop-shadow-sm">{d.shortName}</span>
                        <Badge variant="red">Learn first</Badge>
                      </div>
                      <div className="text-base font-semibold text-mcd-gray-900 dark:text-mcd-gray-50 mb-2">
                        {d.fullName}
                      </div>
                      <div className="text-sm font-medium text-mcd-gray-600 dark:text-mcd-gray-300 line-clamp-2 leading-relaxed mb-4">
                        {d.description}
                      </div>
                      <div className="text-xs font-bold text-mcd-red group-hover:text-mcd-red-dark transition-colors flex items-center mt-auto uppercase tracking-wide">
                        View Details <ArrowRight className="w-3 h-3 ml-1" />
                      </div>
                    </Card>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <Card className="bg-gradient-to-br from-mcd-red/5 to-transparent border-mcd-red/10 shadow-lg">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-mcd-red" /> Field Quick Start
                </span>
              }
            />
            <CardBody>
              <ol className="space-y-4">
                <li className="flex items-start gap-3 text-sm text-mcd-gray-800 dark:text-mcd-gray-100 font-medium">
                  <span className="font-mono text-mcd-red font-bold text-base mt-0.5">1</span>
                  <span className="leading-relaxed">On arrival, find the <strong>comms cabinet</strong> first - it is the heart of every store network.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-mcd-gray-800 dark:text-mcd-gray-100 font-medium">
                  <span className="font-mono text-mcd-red font-bold text-base mt-0.5">2</span>
                  <span className="leading-relaxed">Map the LAN runs: patch panel port → switch port → device. Label them as you go.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-mcd-gray-800 dark:text-mcd-gray-100 font-medium">
                  <span className="font-mono text-mcd-red font-bold text-base mt-0.5">3</span>
                  <span className="leading-relaxed">Note the <strong>device index</strong> (COD 2, TC1) - the number tells you which unit.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-mcd-gray-800 dark:text-mcd-gray-100 font-medium">
                  <span className="font-mono text-mcd-red font-bold text-base mt-0.5">4</span>
                  <span className="leading-relaxed">Take a photo of each device label for your records.</span>
                </li>
              </ol>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-mcd-yellow/10 to-mcd-yellow/5 border-mcd-yellow/20">
            <CardHeader
              title={
                <span className="flex items-center gap-2 font-bold text-mcd-yellow-dark">
                  <Tag className="w-5 h-5" /> Golden Rules
                </span>
              }
            />
            <CardBody>
              <ul className="space-y-3 text-sm font-medium text-mcd-gray-800 dark:text-mcd-gray-100">
                <li className="flex items-start gap-2">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-mcd-yellow-dark shrink-0" />
                  <span className="leading-relaxed">Always reseat BOTH cable ends before escalating.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-mcd-yellow-dark shrink-0" />
                  <span className="leading-relaxed">Check remote access first - you can often fix it remotely.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-mcd-yellow-dark shrink-0" />
                  <span className="leading-relaxed">Reboot the <strong>Delphi modem</strong> only after checking device-side first.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-mcd-yellow-dark shrink-0" />
                  <span className="leading-relaxed">Log every step you try on the ticket.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-mcd-yellow-dark shrink-0" />
                  <span className="leading-relaxed">Never assume - verify the model on the physical label.</span>
                </li>
              </ul>
            </CardBody>
          </Card>

          <Card className="border-mcd-red/30">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-mcd-red" /> When to Ask for Help
                </span>
              }
            />
            <CardBody>
              <p className="text-sm font-medium text-mcd-gray-700 dark:text-mcd-gray-200 leading-relaxed p-4 rounded-xl bg-mcd-red/5">
                If a device still fails after restart + reseat + reboot modem, or you see a
                burning smell / smoke, stop, isolate power, and escalate immediately.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-mcd-gray-400" /> Keep This App Alive
                </span>
              }
            />
            <CardBody>
              <p className="text-sm font-medium text-mcd-gray-600 dark:text-mcd-gray-300 leading-relaxed p-4 rounded-xl bg-mcd-gray-50 dark:bg-mcd-gray-800">
                This is a living reference. Found a new device, a different label format, or a
                better workaround? Add it so the next new engineer does not have to ask the
                manager.
              </p>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}
