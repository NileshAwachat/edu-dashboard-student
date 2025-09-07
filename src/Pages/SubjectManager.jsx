// src/pages/SubjectManager.jsx
import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export default function SubjectManager() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ studentId: "", name: "", chapters: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(()=>{(async()=>{
    const sSnap = await getDocs(collection(db,"students"));
    setStudents(sSnap.docs.map(d=>({id:d.id,...d.data()})));
    const subSnap = await getDocs(collection(db,"subjects"));
    setSubjects(subSnap.docs.map(d=>({id:d.id,...d.data()})));
  })()},[]);

  const handleSubmit = async (e)=>{
    e.preventDefault();
    if(!form.studentId || !form.name) return;
    const data = { studentId: form.studentId, name: form.name, chapters: form.chapters.split(",").map(c=>({ name: c.trim(), status: "not_started" })) };
    if(editingId){ await updateDoc(doc(db,"subjects",editingId), data); setEditingId(null); }
    else await addDoc(collection(db,"subjects"), data);
    setForm({ studentId: "", name: "", chapters: "" });
    window.location.reload();
  };

  const editSubject = (sub) => { setForm({ studentId: sub.studentId, name: sub.name, chapters: sub.chapters.map(c=>c.name).join(", ") }); setEditingId(sub.id); };
  const deleteSubject = async (id)=>{ await deleteDoc(doc(db,"subjects",id)); window.location.reload(); };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Subject Manager</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-3 mb-4">
        <select className="border p-2" value={form.studentId} onChange={e=>setForm({...form,studentId:e.target.value})}>
          <option value="">Select Student</option>
          {students.map(s=> <option key={s.id} value={s.id}>{s.name} (Grade {s.grade})</option>)}
        </select>
        <input className="border p-2" placeholder="Subject Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <input className="border p-2" placeholder="Chapters (comma separated)" value={form.chapters} onChange={e=>setForm({...form,chapters:e.target.value})}/>
        <button type="submit" className="col-span-3 bg-blue-600 text-white px-4 py-2 rounded">{editingId ? "Update Subject" : "Add Subject"}</button>
      </form>

      {students.map(st => (
        <div key={st.id} className="mb-6">
          <h2 className="font-semibold">{st.name} — Grade {st.grade}</h2>
          <ul className="mt-2 space-y-2">
            {subjects.filter(s=>s.studentId===st.id).map(sub => (
              <li key={sub.id} className="border p-3 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold">{sub.name}</div>
                    <div>Chapters: {sub.chapters.map(c=>c.name).join(", ")}</div>
                  </div>
                  <div className="space-x-2">
                    <button onClick={()=>editSubject(sub)} className="bg-green-600 text-white px-2 py-1 rounded">Edit</button>
                    <button onClick={()=>deleteSubject(sub.id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
