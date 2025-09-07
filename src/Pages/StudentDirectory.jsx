import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export default function StudentDirectory() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    name: "",
    grade: "",
    board: "",
    school: "",
    batch: "",
    timeSlot: "",
  });
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null); // 🔹 track editing

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      const snapshot = await getDocs(collection(db, "students"));
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchStudents();
  }, []);

  // Add or Update student
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.grade) return;

    if (editingId) {
      // 🔹 Update existing student
      const ref = doc(db, "students", editingId);
      await updateDoc(ref, form);
      setEditingId(null);
    } else {
      // 🔹 Add new student
      await addDoc(collection(db, "students"), form);
    }

    setForm({ name: "", grade: "", board: "", school: "", batch: "", timeSlot: "" });
    window.location.reload();
  };

  // Edit student → load into form
  const editStudent = (student) => {
    setForm(student);
    setEditingId(student.id);
  };

  // Delete student
  const deleteStudent = async (id) => {
    await deleteDoc(doc(db, "students", id));
    window.location.reload();
  };

  // Search filter
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.grade.toLowerCase().includes(search.toLowerCase()) ||
    s.board.toLowerCase().includes(search.toLowerCase()) ||
    s.batch.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Student Directory</h1>

      {/* Add / Edit Student Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 mb-6">
        <input type="text" placeholder="Name" className="border p-2"
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input type="text" placeholder="Grade" className="border p-2"
          value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} />
        <input type="text" placeholder="Board" className="border p-2"
          value={form.board} onChange={(e) => setForm({ ...form, board: e.target.value })} />
        <input type="text" placeholder="School" className="border p-2"
          value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} />
        <input type="text" placeholder="Batch" className="border p-2"
          value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} />
        <input type="text" placeholder="Time Slot" className="border p-2"
          value={form.timeSlot} onChange={(e) => setForm({ ...form, timeSlot: e.target.value })} />

        {/* 🔹 Submit button changes text based on edit mode */}
        <button type="submit" className="col-span-2 bg-blue-600 text-white px-4 py-2 rounded">
          {editingId ? "Update Student" : "Add Student"}
        </button>
      </form>

      {/* Search Bar */}
      <input type="text" placeholder="Search students..." className="border p-2 w-full mb-4"
        value={search} onChange={(e) => setSearch(e.target.value)} />

      {/* Student List */}
      <ul className="space-y-3">
        {filteredStudents.map((s) => (
          <li key={s.id} className="border p-3 rounded bg-gray-50">
            <p><b>{s.name}</b> | Grade: {s.grade} | Board: {s.board}</p>
            <p>School: {s.school} | Batch: {s.batch} | Time Slot: {s.timeSlot}</p>
            <div className="space-x-2 mt-2">
              <button onClick={() => editStudent(s)} className="bg-green-600 text-white px-2 py-1 rounded">Edit</button>
              <button onClick={() => deleteStudent(s.id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
