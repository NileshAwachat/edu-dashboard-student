// src/pages/SyllabusProgress.jsx
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase";

/*
  Behavior:
  - Reads subject documents from collection "subjects".
  - Each subject doc is expected to have:
    { studentId, name, chapters: [{ name, status }] }
    If chapters are strings (legacy), this component will normalize them to objects with status "not_started".
  - UI: select student -> shows that student's subjects -> checklist per chapter.
  - Status flow: not_started -> started -> milestone -> finished
  - When a chapter becomes "started" (transition into started), it creates a task in "tasks"
    with description "Take Notes" and source: "syllabus".
*/

const STATUS_ORDER = ["not_started", "started", "milestone", "finished"];

const statusColor = {
  not_started: "bg-gray-200 text-gray-800",
  started: "bg-yellow-200 text-yellow-800",
  milestone: "bg-purple-200 text-purple-800",
  finished: "bg-green-200 text-green-800",
};

export default function SyllabusProgress() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");

  useEffect(() => {
    // fetch students and subjects and normalize chapters
    const fetchAndNormalize = async () => {
      // fetch students
      const sSnap = await getDocs(collection(db, "students"));
      const studentsArr = sSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setStudents(studentsArr);

      // fetch subjects
      const subSnap = await getDocs(collection(db, "subjects"));
      const subs = subSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // normalize chapters: if a chapter is a string or missing status, convert to {name, status: "not_started"}
      const normalizedSubs = [];
      for (const s of subs) {
        let chapters = Array.isArray(s.chapters) ? s.chapters : [];
        let changed = false;
        const newChapters = chapters.map((ch) => {
          if (typeof ch === "string") {
            changed = true;
            return { name: ch, status: "not_started" };
          }
          // ch is an object
          if (!("status" in ch)) {
            changed = true;
            return { ...ch, status: "not_started" };
          }
          return ch;
        });

        if (changed) {
          // update Firestore document to normalized structure
          try {
            await updateDoc(doc(db, "subjects", s.id), { chapters: newChapters });
          } catch (err) {
            // ignore update errors for safety, but still keep normalized locally
            console.warn("Failed to normalize subject chapters for", s.id, err);
          }
          normalizedSubs.push({ ...s, chapters: newChapters });
        } else {
          normalizedSubs.push(s);
        }
      }

      setSubjects(normalizedSubs);
    };

    fetchAndNormalize();
  }, []);

  // helper: get next status in our flow
  const getNextStatus = (cur) => {
    const idx = STATUS_ORDER.indexOf(cur);
    if (idx === -1 || idx === STATUS_ORDER.length - 1) return STATUS_ORDER[STATUS_ORDER.length - 1];
    return STATUS_ORDER[idx + 1];
  };

  // update chapter status for subjectId at chapterIndex
  const changeChapterStatus = async (subjectId, chapterIndex) => {
    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject) return;

    const prevStatus = subject.chapters[chapterIndex].status || "not_started";
    const newStatus = getNextStatus(prevStatus);

    const updatedChapters = subject.chapters.map((ch, i) =>
      i === chapterIndex ? { ...ch, status: newStatus } : ch
    );

    // update Firestore
    await updateDoc(doc(db, "subjects", subjectId), { chapters: updatedChapters });

    // If transitioned into "started" (i.e., newStatus === 'started' AND prevStatus !== 'started'), create task
    if (newStatus === "started" && prevStatus !== "started") {
      // create Take Notes task in "tasks" collection
      await addDoc(collection(db, "tasks"), {
        studentId: subject.studentId || selectedStudent || null,
        subject: subject.name || "",
        chapter: updatedChapters[chapterIndex].name || "",
        description: "Take Notes",
        dueDate: null,
        status: "Pending",
        priority: "Medium",
        source: "syllabus",
        createdAt: new Date().toISOString(),
      });
    }

    // update local state (optimistic)
    setSubjects((prev) => prev.map((s) => (s.id === subjectId ? { ...s, chapters: updatedChapters } : s)));
  };

  // UI helpers
  const studentName = (id) => students.find((x) => x.id === id)?.name || "Unknown";

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Syllabus Progress</h1>

      {/* Student selector */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Select Student</label>
        <select
          className="border p-2 rounded w-full max-w-md"
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="">— All students —</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} (Grade {s.grade})
            </option>
          ))}
        </select>
      </div>

      {/* Subjects list (filtered by student if selected) */}
      <div className="space-y-4">
        {subjects
          .filter((sub) => !selectedStudent || sub.studentId === selectedStudent)
          .map((sub) => (
            <div key={sub.id} className="border rounded p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-semibold text-lg">{sub.name}</div>
                  <div className="text-sm text-gray-600">
                    Student: {studentName(sub.studentId)} {sub.studentId ? `• (${sub.studentId})` : ""}
                  </div>
                </div>
                <div className="text-sm text-gray-500">Chapters: {sub.chapters?.length ?? 0}</div>
              </div>

              {/* Checklist / timeline */}
              <ul className="space-y-2">
                {(sub.chapters || []).map((ch, idx) => {
                  const status = ch.status || "not_started";
                  const badgeClass = statusColor[status] || statusColor.not_started;
                  const nextLabel = status === "not_started" ? "Start" : status === "started" ? "Milestone" : status === "milestone" ? "Finish" : "Done";
                  return (
                    <li key={idx} className="flex items-center justify-between border-b py-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${status === "finished" ? "bg-green-600" : status === "milestone" ? "bg-purple-600" : status === "started" ? "bg-yellow-500" : "bg-gray-400"}`} />
                        <div>
                          <div className="font-medium">{ch.name}</div>
                          <div className="text-xs">
                            <span className={`inline-block px-2 py-0.5 rounded ${badgeClass}`}>{status.replace(/_/g, " ")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Next step button (hidden if already finished) */}
                        {status !== "finished" && (
                          <button
                            className="bg-blue-600 text-white px-3 py-1 rounded"
                            onClick={() => changeChapterStatus(sub.id, idx)}
                          >
                            {nextLabel} →
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
}

