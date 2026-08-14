import { useEffect, useMemo, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { getAdminStats } from "../services/admin";

/* ----------------------- utilities ----------------------- */
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function useCountUp(value, duration = 700) {
  const [display, setDisplay] = useState(Number(value) || 0);
  const rafRef = useRef();
  useEffect(() => {
    const from = Number(display) || 0;
    const to   = Number(value)   || 0;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const v = Math.round(from + (to - from) * easeOutCubic(t));
      setDisplay(v);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);
  return display;
}

/* ----------------------- Robust SVG pie ----------------------- */
function StatusPie({ done = 0, inProgress = 0 }) {
  const total = Math.max(0, Number(done) + Number(inProgress));
  const cx = 110, cy = 110, r = 90;
  const C = 2 * Math.PI * r;

  if (total === 0) {
    return (
      <svg width="220" height="220" viewBox="0 0 220 220" className="mx-auto block">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="20" />
        <text x="110" y="116" textAnchor="middle" className="fill-gray-500" fontSize="14">No data</text>
      </svg>
    );
  }

  const doneLen = (Number(done) / total) * C;
  const progLen = (Number(inProgress) / total) * C;
  const EPS = 0.001;
  const dash = (len) => {
    if (len <= 0) return `0 ${C}`;
    if (len >= C) return `${C - EPS} ${EPS}`;
    return `${len} ${C - len}`;
  };

  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [done, inProgress]);

  const shownDone   = ready ? doneLen : 0;
  const shownInProg = ready ? progLen : 0;

  return (
    <div className="flex flex-col items-center">
      <svg width="220" height="220" viewBox="0 0 220 220" className="mx-auto block">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="20" />
        <circle
          cx={cx} cy={cy} r={r} fill="none" stroke="#10b981" strokeWidth="20"
          strokeLinecap="butt"
          strokeDasharray={dash(shownDone)}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray 700ms ease-out" }}
        />
        <circle
          cx={cx} cy={cy} r={r} fill="none" stroke="#f59e0b" strokeWidth="20"
          strokeLinecap="butt"
          strokeDasharray={dash(shownInProg)}
          strokeDashoffset={-doneLen}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray 700ms ease-out 100ms" }}
        />
        <circle cx={cx} cy={cy} r="55" fill="#ffffff" />
        <text x="110" y="106" textAnchor="middle" className="fill-gray-800" fontSize="18" fontWeight="600">
          {done}/{total}
        </text>
        <text x="110" y="126" textAnchor="middle" className="fill-gray-500" fontSize="12">Done / Total</text>
      </svg>
      <div className="flex items-center gap-4 text-sm mt-2">
        <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" />
        <span className="text-gray-700">Done: <b>{done}</b></span>
        <span className="inline-block w-3 h-3 rounded-sm bg-amber-500 ml-4" />
        <span className="text-gray-700">In Progress: <b>{inProgress}</b></span>
      </div>
    </div>
  );
}

/* ----------------------- Animated bars ----------------------- */
function ProjectsByCohortBar({ data }) {
  const max = useMemo(() => Math.max(1, ...data.map((d) => d.count || 0)), [data]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [data]);
  return (
    <div className="w-full">
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-8 place-items-center">
        {data.map((d) => {
          const targetH = Math.max(8, Math.round((d.count / max) * 200));
          return (
            <div key={d.cohort} className="flex flex-col items-center">
              <div
                className="w-10 rounded-xl bg-indigo-600 shadow-sm transition-all duration-700 ease-out"
                style={{ height: ready ? `${targetH}px` : "8px" }}
                title={`${d.cohort}: ${d.count}`}
              />
              <div className="mt-2 text-sm text-gray-700">{d.cohort}</div>
              <div className="text-xs text-gray-500">{d.count} project(s)</div>
            </div>
          );
        })}
      </div>
      <div className="text-xs text-gray-500 mt-4">Projects per Cohort</div>
    </div>
  );
}

/* ----------------------- Small KPI tile ----------------------- */
function SmallKPI({ label, value, tone = "amber" }) {
  const toneMap = {
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
  };
  return (
    <div className={`flex-1 rounded-xl px-4 py-3 ${toneMap[tone]} border`}>
      <div className="text-sm">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

/* ----------------------- Dashboard ----------------------- */
export default function AdminDashboard() {
  document.title = "FCT | Admin Dashboard";
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [kpis, setKpis] = useState({
    mentors: 0,
    interns: 0,
    cohorts: 0,
    projects_done: 0,
    projects_in_progress: 0,
  });
  const [byCohort, setByCohort] = useState([]);

  // NEW: per-mentor KPIs from API
  const [mentorKPIs, setMentorKPIs] = useState([]);

  // animated numbers
  const mentorsNum = useCountUp(kpis.mentors);
  const internsNum = useCountUp(kpis.interns);
  const cohortsNum = useCountUp(kpis.cohorts);
  const doneNum = useCountUp(kpis.projects_done);
  const inProgNum = useCountUp(kpis.projects_in_progress);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await getAdminStats(); // includes mentors_projects
        setKpis(res.kpis || {});
        setByCohort(res.charts?.by_cohort || []);
        setMentorKPIs(res.mentors_projects || []); // [{mentor_id, mentor_name, done, in_progress, total}]
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load stats");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <nav className="sticky top-0 w-full bg-gray-800 border-b border-gray-200 py-3 flex items-center justify-end px-6">
        <div className="flex flex-col text-right">
          <div className="font-semibold text-lg text-white">Future Code Technology - Admin Dashboard</div>
          <span className="text-sm text-gray-400">Welcome back, {user?.username}</span>
        </div>
      </nav>

      <main className="flex-1 p-6 space-y-6">
        <Card title="Welcome to FCT - Intern Management System" subtitle={`Signed in as ${user?.email}`}>
          <p className="text-gray-600">
            From here, Signing up mentors, cohorts, interns and handling Projects can be done.
          </p>
        </Card>

        {err && <div className="text-red-600">{err}</div>}
        {loading && <div>Loading...</div>}

        {/* Global KPIs */}
        {!loading && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <Card className="text-lg font-semibold">Mentors<span className="text-indigo-600 font-medium"> (Total)</span>
              <div className="text-3xl font-semibold text-indigo-600 mt-2">{mentorsNum}</div>
            </Card>
            <Card className="text-lg font-semibold">Interns<span className="text-indigo-600 font-medium"> (Total)</span>
              <div className="text-3xl font-semibold text-indigo-600 mt-2">{internsNum}</div>
            </Card>
            <Card className="text-lg font-semibold">Cohorts<span className="text-indigo-600 font-medium"> (Total)</span>
              <div className="text-3xl font-semibold text-indigo-600 mt-2">{cohortsNum}</div>
            </Card>
            <Card className="text-lg font-semibold">Projects<span className="text-emerald-600 font-medium"> (Done)</span>
              <div className="text-3xl font-semibold text-emerald-600 mt-2">{doneNum}</div>
            </Card>
            <Card className="text-lg font-semibold">Projects<span className="text-amber-600 font-medium"> (In Progress)</span>
              <div className="text-3xl font-semibold text-amber-600 mt-2">{inProgNum}</div>
            </Card>
          </div>
        )}

        {/* Charts */}
        {!loading && (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card className="text-lg font-semibold">Project Status
              <div className="mt-2">
                <StatusPie
                  done={kpis.projects_done ?? 0}
                  inProgress={kpis.projects_in_progress ?? 0}
                />
              </div>
            </Card>
            <Card className="text-lg font-semibold">Projects handled by Cohorts
              <div className="mt-2">
                <ProjectsByCohortBar data={byCohort} />
              </div>
            </Card>
          </div>
        )}

        {/* ---------- Mentor Projects Summary ---------- */}
        {!loading && (
          <Card
            title={<span className="text-xl font-semibold">Mentor Projects Summary</span>}
            subtitle="Count of projects in each status for every mentor"
          >
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {mentorKPIs.map((m) => {
                const total = (m.total ?? 0);
                return (
                  <div key={m.mentor_id} className="rounded-2xl border bg-white p-5 shadow-sm">
                    <div className="text-sm text-gray-500">Mentor</div>
                    <div className="text-xl font-semibold text-gray-800 mb-4">{m.mentor_name}</div>

                    <div className="flex items-stretch gap-4">
                      <SmallKPI label="In Progress" value={m.in_progress ?? 0} tone="amber" />
                      <SmallKPI label="Done" value={m.done ?? 0} tone="green" />
                    </div>

                    <div className="text-sm text-gray-500 mt-3">
                      Total projects: <span className="font-semibold text-gray-700">{total}</span>
                    </div>
                  </div>
                );
              })}
              {mentorKPIs.length === 0 && (
                <div className="text-sm text-gray-500">No mentors found.</div>
              )}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
