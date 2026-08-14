import { pool } from "../config/db.js";

export async function getMentorStats(req, res) {
  try {
    const mentor_id = req.user.sub;

    // ---- Projects KPIs ----
    const [[agg]] = await pool.query(
      `
      SELECT
        SUM(CASE WHEN p.status = 'Done' THEN 1 ELSE 0 END) AS done_count,
        SUM(CASE WHEN p.status = 'In Progress' THEN 1 ELSE 0 END) AS inprogress_count,
        COUNT(*) AS total
      FROM projects p
      WHERE p.mentor_id = ?
      `,
      [mentor_id]
    );

    // ---- Projects by cohort ----
    const [byCohort] = await pool.query(
      `
      SELECT c.name AS cohort_name, COUNT(p.id) AS project_count
      FROM cohorts c
      JOIN projects p ON p.cohorts_id = c.id
      WHERE p.mentor_id = ?
      GROUP BY c.id, c.name
      ORDER BY c.id ASC
      `,
      [mentor_id]
    );

    // ---- Attendance by intern (JOIN first, then WHERE) ----
    const [attRows] = await pool.query(
      `
      SELECT
        i.id,
        i.username,
        COALESCE(SUM(CASE WHEN a.status = 'Present'   THEN 1 ELSE 0 END), 0) AS present_days,
        COALESCE(SUM(CASE WHEN a.status = 'Half-day'  THEN 1 ELSE 0 END), 0) AS half_days,
        COALESCE(SUM(CASE WHEN a.status = 'Leave'     THEN 1 ELSE 0 END), 0) AS leave_days,
        COALESCE(SUM(CASE WHEN a.status IN ('Present','Half-day') THEN 1 ELSE 0 END), 0) AS working_days,
        COALESCE(SUM(CASE WHEN a.status = 'Leave' AND a.approval = 'Approved' THEN 1 ELSE 0 END), 0) AS approved_leave_days
      FROM intern i
      LEFT JOIN attendance a ON a.intern_id = i.id
      GROUP BY i.id, i.username
      ORDER BY i.username ASC
      `
    );

    // ---- Subtask counts per intern (mentor scope) ----
    const [subsPerIntern] = await pool.query(
      `
      SELECT
        i.id AS intern_id,
        i.username AS intern_name,
        SUM(CASE WHEN s.status = 'In Progress' THEN 1 ELSE 0 END) AS sub_in_progress,
        SUM(CASE WHEN s.status = 'In Review'  THEN 1 ELSE 0 END) AS sub_in_review,
        SUM(CASE WHEN s.status = 'Done'       THEN 1 ELSE 0 END) AS sub_done
      FROM subtasks s
      JOIN tasks t    ON t.id = s.task_id
      JOIN projects p ON p.id = t.projects_id
      JOIN intern i   ON i.id = s.intern_id
      GROUP BY i.id, i.username
      ORDER BY i.username ASC
      `
    );

    // Merge subtask counts into attendance rows
    const subsMap = new Map();
    for (const r of subsPerIntern) {
      subsMap.set(r.intern_id, {
        in_progress: Number(r.sub_in_progress) || 0,
        in_review:   Number(r.sub_in_review)   || 0,
        done:        Number(r.sub_done)        || 0,
      });
    }

    const attendance_by_intern = attRows.map(r => {
      const present = Number(r.present_days) || 0;
      const half    = Number(r.half_days) || 0;
      const leave   = Number(r.leave_days) || 0;
      const work    = Number(r.working_days) || 0;
      const appr    = Number(r.approved_leave_days) || 0;

      const numerator   = present + 0.5 * half;
      const denominator = Math.max(0, work - appr);
      const pct = denominator > 0 ? Math.max(0, Math.min(100, (numerator / denominator) * 100)) : 0;

      const sub = subsMap.get(r.id) || { in_progress: 0, in_review: 0, done: 0 };
      const sub_total = sub.in_progress + sub.in_review + sub.done;

      return {
        intern_id: r.id,
        intern_name: r.username,
        present_days: present,
        half_days: half,
        leave_days: leave,
        working_days: work,
        approved_leave_days: appr,
        attendance_pct: Number(pct.toFixed(2)),
        subtasks: {
          in_progress: sub.in_progress,
          in_review:   sub.in_review,
          done:        sub.done,
          total:       sub_total,
        },
      };
    });

    res.json({
      kpis: {
        my_projects: agg?.total ?? 0,
        my_projects_done: agg?.done_count ?? 0,
        my_projects_in_progress: agg?.inprogress_count ?? 0,
      },
      charts: {
        status: {
          done: agg?.done_count ?? 0,
          in_progress: agg?.inprogress_count ?? 0,
        },
        by_cohort: byCohort.map(r => ({
          cohort: r.cohort_name,
          count: Number(r.project_count) || 0,
        })),
      },
      attendance_by_intern,
    });
  } catch (e) {
    console.error("getMentorStats error:", e);
    res.status(500).json({ message: "Server error" });
  }
}
