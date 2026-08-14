import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import { getMentorStats } from "../services/mentor";

/* ---------- small utils ---------- */
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

/* ---------- SVG pie ---------- */
function StatusPie({ done = 0, inProgress = 0 }) {
  const total = Math.max(0, Number(done) + Number(inProgress));
  const cx = 110, cy = 110, r = 90;
  const circumference = 2 * Math.PI * r;

  const doneLen = (total ? (Number(done) / total) : 0) * circumference;
  const progLen = (total ? (Number(inProgress) / total) : 0) * circumference;

  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [done, inProgress]);

  if (total === 0) {
    return (
      <svg width="220" height="220" viewBox="0 0 220 220" className="mx-auto block">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="20" />
        <text x="110" y="116" textAnchor="middle" className="fill-gray-500" fontSize="14">No data</text>
      </svg>
    );
  }

  if (done > 0 && inProgress === 0) {
    return (
      <div className="flex flex-col items-center">
        <svg width="220" height="220" viewBox="0 0 220 220" className="mx-auto block">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="20" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#10b981" strokeWidth="20"
                  transform={`rotate(-90 ${cx} ${cy})`} />
          <circle cx={cx} cy={cy} r="55" fill="#ffffff" />
          <text x="110" y="106" textAnchor="middle" className="fill-gray-800" fontSize="18" fontWeight="600">
            {done}/{total}
          </text>
          <text x="110" y="126" textAnchor="middle" className="fill-gray-500" fontSize="12">Done / Total</text>
        </svg>
        <div className="flex items-center gap-4 text-sm mt-2">
          <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" /> <span>Done: <b>{done}</b></span>
          <span className="inline-block w-3 h-3 rounded-sm bg-amber-500 ml-4" /> <span>In Progress: <b>{inProgress}</b></span>
        </div>
      </div>
    );
  }
  if (inProgress > 0 && done === 0) {
    return (
      <div className="flex flex-col items-center">
        <svg width="220" height="220" viewBox="0 0 220 220" className="mx-auto block">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="20" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f59e0b" strokeWidth="20"
                  transform={`rotate(-90 ${cx} ${cy})`} />
          <circle cx={cx} cy={cy} r="55" fill="#ffffff" />
          <text x="110" y="106" textAnchor="middle" className="fill-gray-800" fontSize="18" fontWeight="600">
            {done}/{total}
          </text>
          <text x="110" y="126" textAnchor="middle" className="fill-gray-500" fontSize="12">Done / Total</text>
        </svg>
        <div className="flex items-center gap-4 text-sm mt-2">
          <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" /> <span>Done: <b>{done}</b></span>
          <span className="inline-block w-3 h-3 rounded-sm bg-amber-500 ml-4" /> <span>In Progress: <b>{inProgress}</b></span>
        </div>
      </div>
    );
  }

  const shownDone   = ready ? doneLen : 0;
  const shownInProg = ready ? progLen : 0;

  return (
    <div className="flex flex-col items-center">
      <svg width="220" height="220" viewBox="0 0 220 220" className="mx-auto block">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="20" />
        <circle
          cx={cx} cy={cy} r={r} fill="none" stroke="#10b981" strokeWidth="20"
          strokeDasharray={`${shownDone} ${circumference - shownDone}`}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray 700ms ease-out" }}
        />
        <circle
          cx={cx} cy={cy} r={r} fill="none" stroke="#f59e0b" strokeWidth="20"
          strokeDasharray={`${shownInProg} ${circumference - shownInProg}`}
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
        <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" /> <span>Done: <b>{done}</b></span>
        <span className="inline-block w-3 h-3 rounded-sm bg-amber-500 ml-4" /> <span>In Progress: <b>{inProgress}</b></span>
      </div>
    </div>
  );
}

/* ---------- animated bars ---------- */
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

/* ---------- simple progress bar ---------- */
function Progress({ value }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-2 bg-emerald-500 transition-all duration-700"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

/* ---------- Dashboard ---------- */
export default function MentorDashboard() {
  document.title = "FCT | Mentor Dashboard";
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [kpis, setKpis] = useState({
    my_projects: 0,
    my_projects_done: 0,
    my_projects_in_progress: 0,
  });
  const [byCohort, setByCohort] = useState([]);

  const [attRows, setAttRows] = useState([]); // includes subtasks KPIs now

  const totalNum = useCountUp(kpis.my_projects);
  const doneNum  = useCountUp(kpis.my_projects_done);
  const progNum  = useCountUp(kpis.my_projects_in_progress);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await getMentorStats();
        setKpis(res.kpis || {});
        setByCohort(res.charts?.by_cohort || []);
        setAttRows(res.attendance_by_intern || []);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load stats");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="sticky top-0 w-full bg-gray-800 border-b border-gray-200 py-3 flex items-center justify-end px-6">
        <div className="flex flex-col text-right">
          <div className="font-semibold text-lg text-white">Future Code Technology — Mentor Dashboard</div>
          <span className="text-sm text-gray-400">Welcome back, {user?.username}</span>
        </div>
      </nav>

      <main className="flex-1 p-6 space-y-6">
        <Card title="Welcome to FCT - Intern Management System" subtitle={`Signed in as ${user?.email}`}>
          <p className="text-gray-600">
            From here, handling projects, attendance approvals and tracking intern performance can be done.
          </p>
        </Card>
        {err && <div className="text-red-600">{err}</div>}
        {loading && <div>Loading...</div>}

        {!loading && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <Card className="text-lg font-semibold">My Projects <span className="text-indigo-600 font-medium">(Total)</span>
              <div className="text-3xl font-semibold text-indigo-600 mt-2">{totalNum}</div>
            </Card>
            <Card className="text-lg font-semibold">My Projects <span className="text-emerald-600 font-medium">(Done)</span>
              <div className="text-3xl font-semibold text-emerald-600 mt-2">{doneNum}</div>
            </Card>
            <Card className="text-lg font-semibold">My Projects <span className="text-amber-600 font-medium">(In Progress)</span>
              <div className="text-3xl font-semibold text-amber-600 mt-2">{progNum}</div>
            </Card>
          </div>
        )}

        {!loading && (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card className="text-lg font-semibold">My Project Status
              <div className="mt-2">
                <StatusPie
                  done={kpis.my_projects_done ?? 0}
                  inProgress={kpis.my_projects_in_progress ?? 0}
                />
              </div>
            </Card>
            <Card className="text-lg font-semibold">My Projects handled by Cohorts
              <div className="mt-2">
                <ProjectsByCohortBar data={byCohort} />
              </div>
            </Card>
          </div>
        )}

        {/* ---------- Intern Attendance KPIs ---------- */}
        {!loading && (
          <Card
            title={<span className="text-lg font-semibold">Intern Attendance Summary</span>}
            subtitle="Per intern: Present count, Leave count, and Attendance %"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2 pr-4">Intern</th>
                    <th className="py-2 pr-4 text-center">Present Days</th>
                    <th className="py-2 pr-4 text-center">Leaves Requested</th>
                    <th className="py-2 pr-4">Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {attRows.map((r) => (
                    <tr key={r.intern_id} className="border-t">
                      <td className="py-2 pr-4 font-medium">{r.intern_name}</td>
                      <td className="py-2 pr-4 text-center">{r.present_days}</td>
                      <td className="py-2 pr-4 text-center">{r.leave_days}</td>
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="min-w-[60px] text-xs font-semibold text-gray-700">
                            {Number(r.attendance_pct || 0).toFixed(2)}%
                          </div>
                          <div className="w-full">
                            <Progress value={r.attendance_pct} />
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">
                          Formula: (Present + 0.5×Half‑day) / (WorkingDays − ApprovedLeave) × 100
                        </div>
                      </td>
                    </tr>
                  ))}
                  {attRows.length === 0 && (
                    <tr>
                      <td className="py-3 pr-4 text-gray-500 text-center" colSpan={4}>
                        No interns found for your projects’ cohorts.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ---------- NEW: Per-intern Subtask KPIs (In Progress / In Review / Done) ---------- */}
        {!loading && (
          <Card
            title={<span className="text-lg font-semibold">Intern Subtasks Summary</span>}
            subtitle="Count of subtasks in each status of each intern"
          >
            {attRows.length === 0 ? (
              <div className="text-sm text-gray-500">No intern subtasks yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {attRows.map((r) => (
                  <div key={r.intern_id} className="p-4 rounded-xl border bg-white shadow-sm">
                    <div className="text-sm text-gray-500">Intern</div>
                    <div className="text-lg font-semibold text-gray-800">{r.intern_name}</div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-amber-50 border">
                        <div className="text-xs text-amber-700 mt-2">In Progress</div>
                        <div className="text-2xl font-bold text-amber-700 py-2">
                          {r.subtasks?.in_progress ?? 0}
                        </div>
                      </div>
                      <div className="rounded-lg bg-sky-50 border">
                        <div className="text-xs text-sky-700 mt-2">In Review</div>
                        <div className="text-2xl font-bold text-sky-700 py-2">
                          {r.subtasks?.in_review ?? 0}
                        </div>
                      </div>
                      <div className="rounded-lg bg-emerald-50 border">
                        <div className="text-xs text-emerald-700 mt-2">Done</div>
                        <div className="text-2xl font-bold text-emerald-700 py-2">
                          {r.subtasks?.done ?? 0}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-500">
                      Total subtasks: <b>{r.subtasks?.total ?? 0}</b>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </main>
    </div>
  );
}
