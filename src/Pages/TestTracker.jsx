// src/pages/TestTracker.jsx
import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export default function TestTracker() {
  const [tests, setTests] = useState([]);
  const [form, setForm] = useState({ studentId: "", subject: "", date: "", totalMarks: "", marksScored: "", remarks: "", chaptersCovered: "", status: "Upcoming" });
  const [students, setStudents] = useState([]);

  useEffect(()=>{(async()=>{
    const t = await getDocs(collection(db,"tests")); setTests(t.docs.map(d=>({id:d.id,...d.data()})));
    const s = await getDocs(collection(db,"students")); setStudents(s.docs.map(d=>({id:d.id,...d.data()})));
  })()},[]);

  const submit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db,"tests"), {
      ...form,
      totalMarks: Number(form.totalMarks||0),
      marksScored: form.marksScored ? Number(form.marksScored) : null,
      chaptersCovered: form.chaptersCovered ? form.chaptersCovered.split(",").map(x=>x.trim()) : [],
      status: form.status
    });
    setForm({ studentId: "", subject: "", date: "", totalMarks: "", marksScored: "", remarks: "", chaptersCovered: "", status: "Upcoming" });
    window.location.reload();
  };

  const markCompleted = async (tst) => {
    await updateDoc(doc(db,"tests",tst.id), { status: "Completed" });
    // if low score -> create retest task (< 40%)
    if(tst.marksScored !== null && tst.totalMarks && tst.marksScored < 0.4 * tst.totalMarks) {
      await addDoc(collection(db,"tasks"), {
        studentId: tst.studentId,
        subject: tst.subject,
        chapter: "Retest needed",
        description: `Retest for ${tst.subject}`,
        dueDate: null,
        status: "Pending",
        priority: "High",
        source: "test"
      });
    }
    window.location.reload();
  };

  const remove = async (id) => { await deleteDoc(doc(db,"tests",id)); window.location.reload(); };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Test Tracker</h1>

      <form onSubmit={submit} className="grid grid-cols-2 gap-3 mb-4">
        <select value={form.studentId} onChange={e=>setForm({...form,studentId:e.target.value})} className="border p-2">
          <option value="">Student (optional)</option>
          {students.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input className="border p-2" placeholder="Subject" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/>
        <input type="date" className="border p-2" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
        <input className="border p-2" placeholder="Total Marks" type="number" value={form.totalMarks} onChange={e=>setForm({...form,totalMarks:e.target.value})}/>
        <input className="border p-2" placeholder="Marks Scored" type="number" value={form.marksScored} onChange={e=>setForm({...form,marksScored:e.target.value})}/>
        <input className="border p-2" placeholder="Remarks" value={form.remarks} onChange={e=>setForm({...form,remarks:e.target.value})}/>
        <input className="border p-2 col-span-2" placeholder="Chapters Covered (comma separated)" value={form.chaptersCovered} onChange={e=>setForm({...form,chaptersCovered:e.target.value})}/>
        <button type="submit" className="col-span-2 bg-blue-600 text-white px-4 py-2 rounded">Add Test</button>
      </form>

      <h2 className="text-xl font-semibold">Upcoming Tests</h2>
      <ul className="space-y-3 mb-4">
        {tests.filter(t=>t.status==="Upcoming").map(t=>(
          <li key={t.id} className="border p-3 rounded">
            <div className="flex justify-between">
              <div>
                <div className="font-bold">{t.subject} • {t.date}</div>
                <div>Chapters: {(t.chaptersCovered||[]).join(", ")}</div>
                <div className="text-sm text-gray-600">Total: {t.totalMarks}</div>
              </div>
              <div className="space-x-2">
                <button onClick={()=>markCompleted(t)} className="bg-green-600 text-white px-2 py-1 rounded">Mark Completed</button>
                <button onClick={()=>remove(t.id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold">Completed Tests</h2>
      <ul className="space-y-3">
        {tests.filter(t=>t.status==="Completed").map(t=>(
          <li key={t.id} className="border p-3 rounded">
            <div className="font-bold">{t.subject} • {t.date}</div>
            <div>Marks: {t.marksScored} / {t.totalMarks}</div>
            <div>Remarks: {t.remarks}</div>
            <div>Chapters: {(t.chaptersCovered||[]).join(", ")}</div>
            <div className="mt-2"><button onClick={()=>remove(t.id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button></div>
          </li>
        ))}
      </ul>
    </div>
  );
}
