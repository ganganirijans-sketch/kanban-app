import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const generateRandomColor = () => {
  const colors = [
    "#6366f1", // indigo
    "#22c55e", // green
    "#f59e0b", // yellow
    "#ef4444", // red
    "#3b82f6", // blue
    "#a855f7", // purple
    "#ec4899", // pink
    "#14b8a6", // teal
  ];

  return colors[Math.floor(Math.random() * colors.length)];
};

export function useTasks(projectId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select(`*, task_tags(tag_id, tags(id, name, color))`)
      .eq("project_id", projectId)
      .order("position", { ascending: true });

    if(error) { console.log(error); setLoading(false); return; }

    if (data) {
      setTasks(data.map((task) => ({
        ...task,
        tags: task.task_tags?.map((t) => t.tags) || [],
      })));
      console.log("TASK DATA:", data);
      
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const saveTags = async (taskId, tagNames) => {
    if(!tagNames || tagNames.length === 0) return [];

    const savedTags = [];
    for (const tagName of tagNames) {
      let { data: existing, error: findError } = await supabase
        .from("tags")
        .select("*")
        .eq("name", tagName.toLowerCase())
        .maybeSingle();

      if(findError) {console.log('find error: ',findError); continue;}

      if (!existing) {
        const { data: newTag, error: insertError } = await supabase
          .from("tags")
          .insert({ name: tagName.toLowerCase(), color: generateRandomColor() })
          .select()
          .single();

        if(insertError) {console.log('insert error: ',insertError); continue;}
        existing = newTag;
      }
      const { error: insertError } = await supabase
        .from('task_tags')
        .insert({ task_id: taskId, tag_id: existing.id });

      if(insertError) {console.log('insert error: ',insertError); continue;}

      savedTags.push(existing);
    }
    return savedTags;
  }
  const createTask = async (fields, tagNames = []) => {
    const {tags: _t, task_tags: _tt, ...cleanFields} = fields;
    
    const colTasks = tasks.filter(
      (t) => t.status === (cleanFields.status || "pending"),
    );
    const maxPos =
      colTasks.length > 0
        ? Math.max(...colTasks.map((t) => t.position)) + 1
        : 0;

    const { data, error } = await supabase
      .from("tasks")
      .insert({ ...cleanFields, project_id: projectId, position: maxPos })
      .select()
      .single();

    if (error) throw error;

    const savedTags = await saveTags(data.id, tagNames);
    const newTask ={...data, tags: savedTags}
    setTasks((prev) => [...prev, newTask]);
    return newTask;
  };

  const updateTask = async (id, updates, tagNames = []) => {
    const { tags: _t, task_tags: _tt, ...cleanUpdates } = updates;

    await supabase.from('task_tags').delete().eq("task_id", id);
    const { data, error } = await supabase
      .from("tasks")
      .update(cleanUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('task_tags').delete().eq('task_id', id);
    const savedTags = await saveTags(id, tagNames);
    const updatedTask = {...data, tags: savedTags};
    setTasks((prev) => prev.map((t) => t.id === id ? updatedTask : t));
    return updatedTask; 
  };

  const deleteTask = async (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id)); // optimistic
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      await load();
      throw error;
    }
  };

  const reorderTask = async (taskId, newStatus, newPosition, sourceStatus) => {
    const snapshot = [...tasks];

    // Optimistic update
    setTasks((prev) => {
      const otherTasks = prev.filter((t) => t.id !== taskId);
      const moved = { ...prev.find((t) => t.id === taskId), status: newStatus };

      const destCol = otherTasks
        .filter((t) => t.status === newStatus)
        .sort((a, b) => a.position - b.position);

      destCol.splice(Math.max(newPosition, 0), 0, moved);

      const srcCol = otherTasks
        .filter((t) => t.status === sourceStatus && t.status !== newStatus)
        .sort((a, b) => a.position - b.position);

      const updated = [
        ...destCol.map((t, i) => ({ ...t, position: i })),
        ...srcCol.map((t, i) => ({ ...t, position: i })),
      ];

      return prev.map((t) => updated.find((u) => u.id === t.id) ?? t);
    });

    // Background sync
    try {
      const upserts = [];

      // Moved task
      upserts.push({
        id: taskId,
        project_id: projectId,
        status: newStatus,
        position: newPosition,
      });

      // Destination column — re-index
      const destOthers = snapshot
        .filter((t) => t.status === newStatus && t.id !== taskId)
        .sort((a, b) => a.position - b.position);

      const withMoved = [...destOthers];
      withMoved.splice(Math.max(newPosition, 0), 0, { id: taskId });
      withMoved.forEach((t, i) => {
        if (t.id !== taskId)
          upserts.push({ id: t.id, project_id: projectId, position: i });
      });

      // Source column — re-index
      if (sourceStatus !== newStatus) {
        snapshot
          .filter((t) => t.status === sourceStatus && t.id !== taskId)
          .sort((a, b) => a.position - b.position)
          .forEach((t, i) =>
            upserts.push({ id: t.id, project_id: projectId, position: i }),
          );
      }

      for (const task of upserts) {
        const { error } = await supabase
          .from("tasks")
          .update({
            status: task.status,
            position: task.position,
          })
          .eq("id", task.id);

        if (error) throw error;
      }
    } catch (err) {
      console.error("Reorder sync failed, reverting:", err);
      setTasks(snapshot); // rollback
    }
  };

  const colTasks = (status) =>
    tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.position - b.position);

  return {
    tasks,
    loading,
    reload: load,
    createTask,
    updateTask,
    deleteTask,
    reorderTask,
    colTasks,
  };
}
