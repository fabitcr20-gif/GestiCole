"use client";

import { useEffect, useState } from "react";
import { RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";

type Course = { id: string; name: string; section?: string };

export function ClassroomImport({
  sections,
}: {
  sections: { id: string; name: string; subject: string }[];
}) {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSection, setSelectedSection] = useState(sections[0]?.id ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "importing" | "done" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string | null>(null);

  async function fetchCourses() {
    try {
      const res = await fetch("/api/google/classroom/courses");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCourses(data.courses);
      setSelectedCourse(data.courses[0]?.id ?? "");
      setStatus("idle");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "No se pudieron cargar los cursos");
      setStatus("error");
    }
  }

  function loadCourses() {
    setStatus("loading");
    setMessage(null);
    fetchCourses();
  }

  useEffect(() => {
    // Carga inicial de cursos de Classroom al montar el componente.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCourses();
  }, []);

  async function handleImport() {
    if (!selectedCourse || !selectedSection) return;
    setStatus("importing");
    setMessage(null);
    try {
      const res = await fetch("/api/google/classroom/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: selectedCourse, sectionId: selectedSection }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(`${data.created} estudiante(s) importado(s) desde Classroom.`);
      setStatus("done");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "No se pudo importar el curso");
      setStatus("error");
    }
  }

  if (sections.length === 0) {
    return (
      <p className="text-muted-foreground">
        Cree primero una sección para poder importar estudiantes desde Classroom.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {status === "loading" && <p className="text-muted-foreground">Cargando cursos de Classroom...</p>}

      {courses && courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">
              Curso de Classroom
            </label>
            <Select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.section ? `(${c.section})` : ""}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">
              Importar a la sección
            </label>
            <Select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.subject}
                </option>
              ))}
            </Select>
          </div>
        </div>
      )}

      {courses && courses.length === 0 && (
        <p className="text-muted-foreground">No se encontraron cursos activos en Classroom.</p>
      )}

      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={loadCourses} icon={<RefreshCw size={18} aria-hidden />}>
          Actualizar cursos
        </Button>
        {courses && courses.length > 0 && (
          <Button onClick={handleImport} disabled={status === "importing"}>
            {status === "importing" ? "Importando..." : "Importar lista de estudiantes"}
          </Button>
        )}
      </div>

      {status === "done" && (
        <p className="flex items-center gap-1.5 text-success font-semibold">
          <CheckCircle2 size={18} aria-hidden /> {message}
        </p>
      )}
      {status === "error" && (
        <p className="flex items-center gap-1.5 text-danger font-semibold">
          <AlertTriangle size={18} aria-hidden /> {message}
        </p>
      )}
    </div>
  );
}
