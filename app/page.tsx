import { ScenarioBuilder } from "../components/ScenarioBuilder";

export default function Page() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12">
      <section className="rounded-3xl border border-pinterest/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-10 shadow-2xl shadow-pinterest/30">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-pinterest">US2 • MAKE.COM • PINTEREST</p>
            <h1 className="text-3xl font-semibold text-slate-50 md:text-4xl">
              Orchestrate Pinterest growth with an agentic Make.com blueprint
            </h1>
            <p className="max-w-2xl text-sm text-slate-300">
              Build production-ready scenarios for the us2.make.com cluster, including trigger selection, action
              sequencing, QA validation, schedule governance, and stakeholder documentation. Export-ready guidance
              ensures every automation runs with precision and auditability.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
            <h2 className="text-lg font-semibold text-slate-100">Cluster Status</h2>
            <ul className="mt-3 space-y-2">
              <li className="flex items-center justify-between">
                <span>Region</span>
                <span className="font-semibold text-pinterest">us2</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Quota Strategy</span>
                <span>p90 throughput</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Recommended retries</span>
                <span>3 × exponential</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <ScenarioBuilder />

      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-10 text-sm text-slate-300">
        <h2 className="text-xl font-semibold text-slate-100">Deployment SOP</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-6">
          <li>Authenticate to us2.make.com with service account assigned to Pinterest workspace.</li>
          <li>Provision scenario folder: <code className="rounded bg-slate-950 px-2 py-1 text-xs">Pinterest Automations</code>.</li>
          <li>Recreate modules using blueprint output, maintain module notes for audit.</li>
          <li>Enable scenario with safe data mode, observe two executions before full scale.</li>
          <li>Document final state in centralized runbook and log QA artifacts.</li>
        </ol>
      </section>
    </main>
  );
}
