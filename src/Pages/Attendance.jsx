// src/pages/Attendance.jsx
import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ studentId: "", date: new Date().toISOString().slice(0,10), status: "Present", batch: "" });
  const [students, setStudents] = useState([]);

  useEffect(()=>{(async()=>{
    const r = await getDocs(collection(db,"attendance")); setRecords(r.docs.map(d=>({id:d.id,...d.data()})));
    const s = await getDocs(collection(db,"students")); setStudents(s.docs.map(d=>({id:d.id,...d.data()})));
  })()},[]);

  const submit = async (e) => { e.preventDefault(); if(!form.studentId || !form.batch) return; await addDoc(collection(db,"attendance"), form); setForm({ studentId: "", date: new Date().toISOString().slice(0,10), status: "Present", batch: "" }); window.location.reload(); };

  const updateStatus = async (id, status) => { await updateDoc(doc(db,"attendance",id), { status }); window.location.reload(); };
  const remove = async (id) => { await deleteDoc(doc(db,"attendance",id)); window.location.reload(); };

  // summary by batch or overall
  const summary = records.reduce((acc, r) => { acc[r.status]=(acc[r.status]||0)+1; return acc; }, {});

  const batches = [...new Set(records.map(r=>r.batch).filter(Boolean))];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Attendance</h1>

      <form onSubmit={submit} className="grid grid-cols-2 gap-3 mb-4">
        <select value={form.studentId} onChange={e=>setForm({...form,studentId:e.target.value})} className="border p-2">
          <option value="">Select Student</option>
          {students.map(s=> <option key={s.id} value={s.id}>{s.name} ({s.batch})</option>)}
        </select>
        <input type="date" className="border p-2" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
        <input className="border p-2" placeholder="Batch" value={form.batch} onChange={e=>setForm({...form,batch:e.target.value})}/>
        <select className="border p-2" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
          <option>Present</option><option>Absent</option><option>Late</option><option>Excused</option>
        </select>
        <button type="submit" className="col-span-2 bg-blue-600 text-white px-4 py-2 rounded">Mark Attendance</button>
      </form>

      <h2 className="text-lg font-semibold">Summary</h2>
      <div className="mb-4">
        <div>Present: {summary["Present"]||0} • Absent: {summary["Absent"]||0} • Late: {summary["Late"]||0} • Excused: {summary["Excused"]||0}</div>
      </div>

      <h2 className="text-lg font-semibold">Batch-wise</h2>
      {batches.map(b=>(
        <div key={b} className="mb-4">
          <div className="font-medium">{b}</div>
          <ul className="mt-2">
            {records.filter(r=>r.batch===b).map(r=>(
              <li key={r.id} className="border p-2 rounded mb-2 flex justify-between">
                <div>{r.studentId} • {r.date} • {r.status}</div>
                <div className="space-x-2">
                  <button onClick={()=>updateStatus(r.id,"Present")} className="bg-green-600 text-white px-2 py-1 rounded">Present</button>
                  <button onClick={()=>updateStatus(r.id,"Absent")} className="bg-red-600 text-white px-2 py-1 rounded">Absent</button>
                  <button onClick={()=>updateStatus(r.id,"Late")} className="bg-yellow-500 text-white px-2 py-1 rounded">Late</button>
                  <button onClick={()=>updateStatus(r.id,"Excused")} className="bg-purple-600 text-white px-2 py-1 rounded">Excused</button>
                  <button onClick={()=>remove(r.id)} className="bg-gray-600 text-white px-2 py-1 rounded">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
