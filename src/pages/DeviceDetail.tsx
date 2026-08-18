import { useParams, Link } from 'react-router';
import { ArrowLeft, MapPin, Cpu, Wrench, AlertTriangle, Tag, FileText, Network, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { DevicePhotoGallery } from '../components/devices/DevicePhotoGallery';
import { useDeviceType, useDeviceTypes } from '../hooks/useDeviceData';
import { useStores } from '../hooks/useStoreData';
import { formatCategory, priorityColor } from '../utils';

export default function DeviceDetail() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const device = useDeviceType(deviceId);
  const stores = useStores();
  const allDeviceTypes = useDeviceTypes();

  if (!device) {
    return (
      <div className="animate-fade-up">
        <Link to="/devices" className="inline-flex items-center gap-2 text-sm font-medium text-mcd-red hover:text-mcd-red-dark transition-colors mb-6 bg-mcd-red/5 hover:bg-mcd-red/10 px-3 py-1.5 rounded-full">
          <ArrowLeft className="w-4 h-4" /> Back to devices
        </Link>
        <EmptyState title="Device not found" message="Check the device short name and try again." />
      </div>
    );
  }

  const storesWithDevice = stores.filter((s) =>
    s.devices.some((d) => d.typeId === device.id || d.typeId === device.shortName)
  );

  return (
    <div className="animate-fade-up">
      <Breadcrumbs
        items={[
          { label: 'Devices', to: '/devices' },
          { label: device.shortName },
        ]}
      />

      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span className="font-mono text-mcd-red drop-shadow-sm">{device.shortName}</span>
            <Badge variant="gray">{formatCategory(device.category)}</Badge>
          </span>
        }
        subtitle={device.fullName}
      />

      <div className="mb-8">
        <DevicePhotoGallery device={device} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="What is it?" />
            <CardBody>
              <p className="text-mcd-gray-700 dark:text-mcd-gray-200 leading-relaxed text-lg">
                {device.description}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-mcd-gray-400" /> Where to find it in the store
                </span>
              }
              subtitle="Check these areas first - no need to ask the manager."
            />
            <CardBody>
              {device.locationHint && (
                <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-mcd-red/5 border border-mcd-red/10 text-sm text-mcd-gray-800 dark:text-mcd-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-mcd-gray-800 flex items-center justify-center shrink-0 shadow-sm">
                    <MapPin className="w-4 h-4 text-mcd-red" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-mcd-red mb-1">
                      Quick guide
                    </div>
                    <div className="font-medium text-mcd-gray-900 dark:text-mcd-gray-50">{device.locationHint}</div>
                  </div>
                </div>
              )}
              
              <ul className="space-y-3">
                {device.typicalLocations.map((loc) => (
                  <li key={loc} className="flex items-center gap-3 p-3 rounded-lg bg-mcd-gray-50/50 dark:bg-mcd-gray-800/30">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-mcd-red/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-mcd-red" />
                    </span>
                    <span className="text-mcd-gray-800 dark:text-mcd-gray-100 font-medium">{loc}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-5 p-4 rounded-xl gradient-border bg-gradient-to-br from-mcd-yellow/[0.06] to-mcd-red/[0.03] dark:from-mcd-yellow/[0.06] dark:to-mcd-red/[0.03]">
                <div className="flex items-start gap-3 text-sm text-mcd-gray-700 dark:text-mcd-gray-200">
                  <Sparkles className="w-5 h-5 text-mcd-yellow-dark shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-mcd-gray-900 dark:text-mcd-gray-50 mb-1">Pro tip</strong>
                    Trace the LAN cable from the device back to the
                    comms cabinet (usually in the back office) and note the patch panel / switch
                    port. That is the quickest way to diagnose offline issues.
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-mcd-gray-400" /> Naming on labels & tickets
                </span>
              }
            />
            <CardBody>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-mcd-gray-50/50 dark:bg-mcd-gray-800/30">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-mcd-gray-400 mb-2">
                    Naming pattern
                  </div>
                  <code className="text-sm bg-white dark:bg-mcd-gray-900 border border-mcd-gray-200 dark:border-mcd-gray-700 px-3 py-1.5 rounded-lg font-mono text-mcd-gray-800 dark:text-mcd-gray-100 block shadow-sm">
                    {device.namingPattern}
                  </code>
                </div>
                <div className="p-4 rounded-xl bg-mcd-gray-50/50 dark:bg-mcd-gray-800/30">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-mcd-gray-400 mb-2">
                    Examples
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {device.examples.map((e) => (
                      <span
                        key={e}
                        className="font-mono text-[13px] bg-white dark:bg-mcd-gray-900 border border-mcd-gray-200 dark:border-mcd-gray-700 px-2 py-1 rounded-md text-mcd-gray-700 dark:text-mcd-gray-200 shadow-sm"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {device.specs && (
            <Card>
              <CardHeader
                title={
                  <span className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-mcd-gray-400" /> Hardware Specs
                  </span>
                }
                subtitle="Approximate - varies by site. Verify model on the label."
              />
              <CardBody>
                <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                  {Object.entries(device.specs).map(([key, value]) => {
                    if (!value) return null;
                    if (Array.isArray(value)) {
                      return (
                        <div key={key} className="col-span-2 p-3 rounded-lg bg-mcd-gray-50/50 dark:bg-mcd-gray-800/30">
                          <dt className="text-[11px] font-semibold uppercase tracking-wider text-mcd-gray-400">
                            {key}
                          </dt>
                          <dd className="mt-2 flex flex-wrap gap-2">
                            {value.map((v) => (
                              <span
                                key={v}
                                className="font-mono text-xs bg-white dark:bg-mcd-gray-900 border border-mcd-gray-200 dark:border-mcd-gray-700 px-2 py-1 rounded-md text-mcd-gray-700 dark:text-mcd-gray-200 shadow-sm"
                              >
                                {v}
                              </span>
                            ))}
                          </dd>
                        </div>
                      );
                    }
                    return (
                      <div key={key} className="p-3 rounded-lg bg-mcd-gray-50/50 dark:bg-mcd-gray-800/30">
                        <dt className="text-[11px] font-semibold uppercase tracking-wider text-mcd-gray-400">
                          {key}
                        </dt>
                        <dd className="mt-1 font-medium text-mcd-gray-900 dark:text-mcd-gray-50">{value}</dd>
                      </div>
                    );
                  })}
                </dl>
              </CardBody>
            </Card>
          )}

          {device.relatedDevices && device.relatedDevices.length > 0 && (
            <Card>
              <CardHeader
                title={
                  <span className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-mcd-gray-400" /> Related devices & connections
                  </span>
                }
                subtitle="Use these links to trace how this device fits into the store network."
              />
              <CardBody>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {device.relatedDevices.map((rel) => {
                    const relType = allDeviceTypes.find((d) => d.id === rel.typeId);
                    return (
                      <li key={rel.typeId}>
                        <Link
                          to={`/devices/${rel.typeId}`}
                          className="flex flex-col gap-1 p-3 rounded-xl border border-mcd-gray-200 dark:border-mcd-gray-700 hover:bg-mcd-gray-50 dark:hover:bg-mcd-gray-800/60 hover:border-mcd-red/30 transition-all group"
                        >
                          <span className="font-mono font-semibold text-mcd-red group-hover:text-mcd-red-dark">
                            {relType?.shortName ?? rel.typeId}
                          </span>
                          <span className="text-xs text-mcd-gray-500 dark:text-mcd-gray-400 line-clamp-2">
                            {rel.relation}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </CardBody>
            </Card>
          )}
        </div>

        <aside className="space-y-6">
          <Card className="border-mcd-red/10 shadow-lg shadow-mcd-red/5">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-mcd-red/10 flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-mcd-red" />
                  </div>
                  Common Issues
                </span>
              }
              subtitle={`${device.commonIssues?.length ?? 0} known issue patterns`}
            />
            <CardBody className="p-0">
              {!device.commonIssues?.length ? (
                <div className="p-8 text-center text-sm text-mcd-gray-500">
                   <div className="w-12 h-12 bg-mcd-gray-50 dark:bg-mcd-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Wrench className="w-5 h-5 text-mcd-gray-300" />
                  </div>
                  No common issues logged yet.
                </div>
              ) : (
                <ul className="divide-y divide-mcd-gray-100/80 dark:divide-mcd-gray-700/40">
                  {device.commonIssues.map((issue) => (
                    <li key={issue.id} className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <h4 className="font-bold text-mcd-gray-900 dark:text-mcd-gray-50 text-base leading-snug">
                          {issue.title}
                        </h4>
                        <Badge variant={priorityColor(issue.priority).replace('badge-', '') as 'red' | 'yellow' | 'gray'}>
                          {issue.priority}
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-mcd-gray-400 mb-2">
                            Symptoms
                          </div>
                          <ul className="space-y-1.5">
                            {issue.symptoms.map((s) => (
                              <li key={s} className="flex items-start gap-2.5 text-sm font-medium text-mcd-gray-700 dark:text-mcd-gray-200">
                                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-mcd-gray-300 dark:bg-mcd-gray-600 shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-mcd-gray-400 mb-2">
                            Workaround (try in order)
                          </div>
                          <ol className="space-y-2">
                            {issue.workaround.map((step, i) => (
                              <li key={step} className="flex items-start gap-3 text-sm text-mcd-gray-700 dark:text-mcd-gray-200">
                                <span className="flex items-center justify-center w-5 h-5 rounded-md bg-mcd-red/10 text-mcd-red font-mono text-[11px] font-bold shrink-0 mt-0.5">
                                  {i + 1}
                                </span>
                                <span className="leading-relaxed">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-xl bg-mcd-yellow/10 border border-mcd-yellow/20 text-sm text-mcd-gray-800 dark:text-mcd-gray-100">
                          <AlertTriangle className="w-5 h-5 text-mcd-yellow-dark shrink-0" />
                          <span className="font-medium leading-relaxed">{issue.resolution}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          {storesWithDevice.length > 0 && (
            <Card>
              <CardHeader
                title={
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-mcd-gray-400" /> Known at these stores
                  </span>
                }
              />
              <CardBody className="p-0">
                <ul className="divide-y divide-mcd-gray-100/80 dark:divide-mcd-gray-700/40">
                  {storesWithDevice.map((s) => (
                    <li key={s.id}>
                      <Link
                        to={`/stores/${s.id}`}
                        className="flex items-center justify-between px-5 py-3 text-sm hover:bg-mcd-gray-50 dark:hover:bg-mcd-gray-800/40 transition-colors group"
                      >
                        <span className="font-medium text-mcd-gray-700 dark:text-mcd-gray-200 group-hover:text-mcd-gray-900 dark:group-hover:text-white">
                          <span className="font-mono text-mcd-gray-400 group-hover:text-mcd-gray-500">#{s.number}</span> {s.name}
                        </span>
                        <Badge variant="gray">
                          {s.devices.filter((d) => d.typeId === device.id).length} unit(s)
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
