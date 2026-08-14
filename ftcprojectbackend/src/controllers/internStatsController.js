import { pool } from "../config/db.js";

export async function getInternStats(req, res) {
  try {
    const intern_id = req.user.sub;

    // KPI counts
    const [[agg]] = await pool.query(
      `
      SELECT
        SUM(CASE WHEN s.status = 'Done'        THEN 1 ELSE 0 END) AS done_count,
        SUM(CASE WHEN s.status = 'In Progress' THEN 1 ELSE 0 END) AS inprogress_count,
        SUM(CASE WHEN s.status = 'In Review'   THEN 1 ELSE 0 END) AS inreview_count,
        COUNT(*) AS total
      FROM subtasks s
      WHERE s.intern_id = ?
      `,
      [intern_id]
    );

    // By-project breakdown for this intern
    const [byProject] = await pool.query(
      `
      SELECT
        p.id   AS project_id,
        p.name AS project_name,
        COUNT(s.id) AS total_count,
        SUM(CASE WHEN s.status = 'Done'        THEN 1 ELSE 0 END) AS done_count,
        SUM(CASE WHEN s.status = 'In Progress' THEN 1 ELSE 0 END) AS inprogress_count,
        SUM(CASE WHEN s.status = 'In Review'   THEN 1 ELSE 0 END) AS inreview_count
      FROM subtasks s
      JOIN tasks t    ON t.id = s.task_id
      JOIN projects p ON p.id = t.projects_id
      WHERE s.intern_id = ?
      GROUP BY p.id, p.name
      ORDER BY p.id ASC
      `,
      [intern_id]
    );

    res.json({
      kpis: {
        my_subtasks_total:        agg?.total ?? 0,
        my_subtasks_done:         agg?.done_count ?? 0,
        my_subtasks_in_progress:  agg?.inprogress_count ?? 0,
        my_subtasks_in_review:    agg?.inreview_count ?? 0,
      },
      charts: {
        status: {
          done:        agg?.done_count ?? 0,
          in_progress: agg?.inprogress_count ?? 0,
          in_review:   agg?.inreview_count ?? 0,
        },
        by_project: byProject.map(r => ({
          project:      r.project_name,
          total:        Number(r.total_count)      || 0,
          done:         Number(r.done_count)       || 0,
          in_progress:  Number(r.inprogress_count) || 0,
          in_review:    Number(r.inreview_count)   || 0,
        })),
      },
    });
  } catch (e) {
    console.error("getInternStats error:", e);
    res.status(500).json({ message: "Server error" });
  }
}
