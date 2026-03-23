import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Fetch projects with task counts using a join
    const { data: projs } = await supabase
      .from("projects")
      .select(`*, tasks(status)`)
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (projs) {
      // Calculate counts from the joined tasks
      const enriched = projs.map((p) => {
        const tasks = p.tasks || [];
        return {
          ...p,
          tasks: undefined,
          total_tasks: tasks.length,
          completed_tasks: tasks.filter((t) => t.status === "completed").length,
          pending_tasks: tasks.filter((t) => t.status === "pending").length,
          in_progress_tasks: tasks.filter((t) => t.status === "in_progress")
            .length,
        };
      });
      setProjects(enriched);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const createProject = async (data) => {
    const { data: project, error } = await supabase
      .from("projects")
      .insert({ ...data, owner_id: user.id })
      .select()
      .single();
    if (error) throw error;
    await load();
    return project;
  };

  const deleteProject = async (id) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;
    setProjects((p) => p.filter((x) => x.id !== id));
  };

  // Global stats derived from projects array
  const stats = projects.reduce(
    (acc, p) => ({
      total_projects: acc.total_projects + 1,
      total_tasks: acc.total_tasks + p.total_tasks,
      completed_tasks: acc.completed_tasks + p.completed_tasks,
      pending_tasks: acc.pending_tasks + p.pending_tasks,
      in_progress_tasks: acc.in_progress_tasks + p.in_progress_tasks,
    }),
    {
      total_projects: 0,
      total_tasks: 0,
      completed_tasks: 0,
      pending_tasks: 0,
      in_progress_tasks: 0,
    },
  );

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5);

  return {
    projects,
    recentProjects,
    stats,
    loading,
    createProject,
    deleteProject,
    reload: load,
  };
}
