import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import { getInternStats } from "../services/intern";

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

/* ---------- 3‑segment pie using stroke dashes (handles 0% / 100%) ---------- */
function StatusPie({ done = 0, inProgress = 0, inReview = 0 }) {
  const total = Math.max(0, Number(done) + Number(inProgress) + Number(inReview));
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

  const segs = [
    { val: Number(inProgress), color: "#f59e0b" }, // amber
    { val: Number(done),       color: "#10b981" }, // emerald
    { val: Number(inReview),   color: "#6f6f70f9" }, // blue
  ];

  // single-slice full ring
  const nonZero = segs.filter(s => s.val > 0);
  if (nonZero.length === 1 && nonZero[0].val === total) {
    return (
      <div className="flex flex-col items-center">
        <svg width="220" height="220" viewBox="0 0 220 220" className="mx-auto block">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="20" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={nonZero[0].color} strokeWidth="20"
                  transform={`rotate(-90 ${cx} ${cy})`} />
          <circle cx={cx} cy={cy} r="55" fill="#ffffff" />
          <text x="110" y="106" textAnchor="middle" className="fill-gray-800" fontSize="18" fontWeight="600">
            {done}/{total}
          </text>
          <text x="110" y="126" textAnchor="middle" className="fill-gray-500" fontSize="12">Done / Total</text>
        </svg>
        <Legend done={done} inProgress={inProgress} inReview={inReview} />
      </div>
    );
  }

  const len = (v) => (v / total) * C;
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [done, inProgress, inReview]);

  let offset = 0;
  return (
    <div className="flex flex-col items-center">
      <svg width="220" height="220" viewBox="0 0 220 220" className="mx-auto block">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="20" />
        {segs.map((s, i) => {
          const L = len(s.val);
          const shown = ready ? L : 0;
          const el = (
            <circle
              key={i}
              cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="20"
              strokeDasharray={`${shown} ${C - shown}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: `stroke-dasharray 700ms ease-out ${i * 80}ms` }}
            />
          );
          offset += L;
          return el;
        })}
        <circle cx={cx} cy={cy} r="55" fill="#ffffff" />
        <text x="110" y="106" textAnchor="middle" className="fill-gray-800" fontSize="18" fontWeight="600">
          {done}/{total}
        </text>
        <text x="110" y="126" textAnchor="middle" className="fill-gray-500" fontSize="12">Done / Total</text>
      </svg>
      <Legend done={done} inProgress={inProgress} inReview={inReview} />
    </div>
  );
}

function Legend({ done, inProgress, inReview }) {
  return (
    <div className="flex items-center gap-4 text-sm mt-2">
      <span className="inline-flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-sm bg-amber-500" /> <span>In Progress: <b>{inProgress}</b></span>
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-sm bg-gray-500" /> <span>In Review: <b>{inReview}</b></span>
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" /> <span>Done: <b>{done}</b></span>
      </span>
    </div>
  );
}

/* ---------- bars: subtasks per project ---------- */
function SubtasksByProjectBar({ data }) {
  const max = useMemo(() => Math.max(1, ...data.map((d) => d.total || 0)), [data]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [data]);

  return (
    <div className="w-full">
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-8 place-items-center">
        {data.map((d) => {
          const targetH = Math.max(8, Math.round((d.total / max) * 200));
          return (
            <div key={d.project} className="flex flex-col items-center">
              <div
                className="w-10 rounded-xl bg-indigo-600 shadow-sm transition-all duration-700 ease-out"
                style={{ height: ready ? `${targetH}px` : "8px" }}
                title={`${d.project}: ${d.total}`}
              />
              <div className="mt-2 text-sm text-gray-700">{d.project}</div>
              <div className="text-xs text-gray-500 text-center">
                Total: <strong className="text-indigo-600">{d.total}</strong><br/> • In Progress: <strong className="text-amber-500">{d.in_progress}</strong>&nbsp;<br/> • In Review: <strong className="text-gray-500">{d.in_review}</strong>&nbsp;<br/> • Done: <strong className="text-emerald-500">{d.done}</strong>
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-xs text-gray-500 mt-4">My subtasks per project</div>
    </div>
  );
}

/* ---------- Dashboard ---------- */
export default function InternDashboard() {
  document.title = "FCT | Intern Dashboard";
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [kpis, setKpis] = useState({
    my_subtasks_total: 0,
    my_subtasks_done: 0,
    my_subtasks_in_progress: 0,
    my_subtasks_in_review: 0,
  });
  const [byProject, setByProject] = useState([]);

  // animated numbers
  const totalNum = useCountUp(kpis.my_subtasks_total);
  const doneNum  = useCountUp(kpis.my_subtasks_done);
  const progNum  = useCountUp(kpis.my_subtasks_in_progress);
  const reviewNum = useCountUp(kpis.my_subtasks_in_review);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await getInternStats();
        setKpis(res.kpis || {});
        setByProject(res.charts?.by_project || []);
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
          <div className="font-semibold text-lg text-white">Future Code Technology — Intern Dashboard</div>
          <span className="text-sm text-gray-400">Welcome back, {user?.username}</span>
        </div>
      </nav>

      <main className="flex-1 p-6 space-y-6">
        <Card title="Welcome to FCT - Intern Management System" subtitle={`Signed in as ${user?.email}`}>
          <p className="text-gray-600">
            From here, handling subtasks, marking attendance, requesting leaves can be done.
          </p>
        </Card>
        {err && <div className="text-red-600">{err}</div>}
        {loading && <div>Loading...</div>}

        {/* KPIs */}
        {!loading && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-4">
            <Card className="text-lg font-semibold">My Subtasks <span className="text-indigo-600 font-medium">(Total)</span>
              <div className="text-3xl font-semibold text-indigo-600 mt-2">{totalNum}</div>
            </Card>
            <Card className="text-lg font-semibold">My Subtasks <span className="text-amber-600 font-medium">(In Progress)</span>
              <div className="text-3xl font-semibold text-yellow-500 mt-2">{progNum}</div>
            </Card>
            <Card className="text-lg font-semibold">My Subtasks <span className="text-gray-600 font-medium">(In Review)</span>
              <div className="text-3xl font-semibold text-gray-500 mt-2">{reviewNum}</div>
            </Card>
            <Card className="text-lg font-semibold">My Subtasks <span className="text-emerald-600 font-medium">(Done)</span>
              <div className="text-3xl font-semibold text-green-500 mt-2">{doneNum}</div>
            </Card>
          </div>
        )}

        {/* Charts */}
        {!loading && (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card className="text-lg font-semibold">My Subtasks Status
              <div className="mt-2">
                <StatusPie
                  done={kpis.my_subtasks_done ?? 0}
                  inProgress={kpis.my_subtasks_in_progress ?? 0}
                  inReview={kpis.my_subtasks_in_review ?? 0}
                />
              </div>
            </Card>
            <Card className="text-lg font-semibold">My Subtasks by Projects
              <div className="mt-2">
                <SubtasksByProjectBar data={byProject} />
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
