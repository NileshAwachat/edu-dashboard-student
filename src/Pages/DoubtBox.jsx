// src/pages/DoubtBox.jsx
import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export default function DoubtBox() {
  const [doubts, setDoubts] = useState([]);
  const [form, setForm] = useState({ studentId: "", subject: "", topic: "", doubtText: "", status: "Open" });
  const [students, setStudents] = useState([]);

  useEffect(()=>{(async()=>{
    const d = await getDocs(collection(db,"doubts")); setDoubts(d.docs.map(x=>({id:x.id,...x.data()})));
    const s = await getDocs(collection(db,"students")); setStudents(s.docs.map(x=>({id:x.id,...x.data()})));
  })()},[]);

  const submit = async (e) => { e.preventDefault(); await addDoc(collection(db,"doubts"), {...form, createdAt: new Date().toISOString()}); setForm({ studentId: "", subject: "", topic: "", doubtText: "", status: "Open" }); window.location.reload(); };

  const mark = async (id, newStatus, doubt) => {
    await updateDoc(doc(db,"doubts",id), { status: newStatus });
    // If converting to Tasked -> create a task and link
    if(newStatus === "Tasked"){
      await addDoc(collection(db,"tasks"), {
        studentId: doubt.studentId,
        subject: doubt.subject,
        chapter: doubt.topic,
        description: `Resolve doubt: ${doubt.doubtText}`,
        dueDate: null,
        status: "Pending",
        priority: "High",
        source: "doubt"
      });
    }
    window.location.reload();
  };

  const remove = async (id) => { await deleteDoc(doc(db,"doubts",id)); window.location.reload(); };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Doubt Box</h1>
      <form onSubmit={submit} className="grid grid-cols-2 gap-3 mb-4">
        <select value={form.studentId} onChange={e=>setForm({...form,studentId:e.target.value})} className="border p-2">
          <option value="">Select Student</option>
          {students.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input className="border p-2" placeholder="Subject" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/>
        <input className="border p-2" placeholder="Topic" value={form.topic} onChange={e=>setForm({...form,topic:e.target.value})}/>
        <textarea className="border p-2 col-span-2" placeholder="Doubt Text" value={form.doubtText} onChange={e=>setForm({...form,doubtText:e.target.value})}/>
        <button type="submit" className="col-span-2 bg-blue-600 text-white px-4 py-2 rounded">Add Doubt</button>
      </form>

      <ul className="space-y-3">
        {doubts.map(d=> (
          <li key={d.id} className="border p-3 rounded">
            <div className="flex justify-between">
              <div>
                <div className="font-bold">{d.subject} • {d.topic}</div>
                <div className="text-sm text-gray-600">{d.doubtText}</div>
                <div className="text-xs text-gray-500">Status: {d.status}</div>
              </div>
              <div className="space-x-2">
                <button onClick={()=>mark(d.id,"Tasked",d)} className="bg-yellow-500 text-white px-2 py-1 rounded">Mark Tasked</button>
                <button onClick={()=>mark(d.id,"Resolved",d)} className="bg-green-600 text-white px-2 py-1 rounded">Resolve</button>
                <button onClick={()=>remove(d.id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
