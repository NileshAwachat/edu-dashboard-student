// src/pages/WorkPool.jsx
import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export default function WorkPool() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ studentId: "", subject: "", chapter: "", description: "", dueDate: "", status: "Pending", priority: "Medium" });
  const [editingId, setEditingId] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(()=>{(async()=>{
    const t = await getDocs(collection(db,"tasks")); setTasks(t.docs.map(d=>({id:d.id,...d.data()})));
    const s = await getDocs(collection(db,"students")); setStudents(s.docs.map(d=>({id:d.id,...d.data()})));
  })()},[]);

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, source: "manual" };
    if(editingId){ await updateDoc(doc(db,"tasks",editingId), payload); setEditingId(null); }
    else await addDoc(collection(db,"tasks"), payload);
    setForm({ studentId: "", subject: "", chapter: "", description: "", dueDate: "", status: "Pending", priority: "Medium" });
    window.location.reload();
  };

  const edit = (t) => { setForm({ studentId: t.studentId || "", subject: t.subject || "", chapter: t.chapter || "", description: t.description || "", dueDate: t.dueDate || "", status: t.status || "Pending", priority: t.priority || "Medium" }); setEditingId(t.id); };
  const remove = async (id) => { await deleteDoc(doc(db,"tasks",id)); window.location.reload(); };
  const toggleStatus = async (t) => { await updateDoc(doc(db,"tasks",t.id), { status: t.status==="Pending" ? "Completed" : "Pending" }); window.location.reload(); };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Work Pool</h1>
      <form onSubmit={submit} className="grid grid-cols-2 gap-3 mb-4">
        <select className="border p-2" value={form.studentId} onChange={e=>setForm({...form,studentId:e.target.value})}>
          <option value="">Select Student (optional)</option>
          {students.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input className="border p-2" placeholder="Subject" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/>
        <input className="border p-2" placeholder="Chapter" value={form.chapter} onChange={e=>setForm({...form,chapter:e.target.value})}/>
        <input className="border p-2" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
        <input className="border p-2" type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/>
        <select className="border p-2" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select>
        <button type="submit" className="col-span-2 bg-blue-600 text-white px-4 py-2 rounded">{editingId ? "Update Task" : "Add Task"}</button>
      </form>

      <ul className="space-y-3">
        {tasks.map(t=>(
          <li key={t.id} className="border p-3 rounded bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold">{t.subject} {t.chapter ? `— ${t.chapter}` : ""}</div>
                <div>{t.description}</div>
                <div className="text-sm text-gray-600">Status: {t.status} • Priority: {t.priority} {t.dueDate && `• Due: ${t.dueDate}`}</div>
                <div className="mt-2">
                  {t.source && <span className="text-xs px-2 py-1 rounded bg-purple-600 text-white mr-2">{t.source === "syllabus" ? "Auto: Syllabus" : t.source === "doubt" ? "Linked: Doubt" : t.source === "test" ? "Auto: Test" : "Manual"}</span>}
                </div>
              </div>
              <div className="space-x-2">
                <button onClick={()=>toggleStatus(t)} className="bg-yellow-500 text-white px-2 py-1 rounded">{t.status==="Pending" ? "Mark Completed" : "Reopen"}</button>
                <button onClick={()=>edit(t)} className="bg-green-600 text-white px-2 py-1 rounded">Edit</button>
                <button onClick={()=>remove(t.id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
