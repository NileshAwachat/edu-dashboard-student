import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import StudentDirectory from "./Pages/StudentDirectory";
import SubjectManager from "./Pages/SubjectManager";
import SyllabusProgress from "./Pages/SyllabusProgress";
import WorkPool from "./Pages/WorkPool";
import DoubtBox from "./Pages/DoubtBox";
import TestTracker from "./Pages/TestTracker";
import Attendance from "./Pages/Attendance";

export default function App() {
  return (
    <Router>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-primary text-white p-6 flex flex-col">
          <h2 className="text-2xl font-extrabold mb-6 tracking-wide">Dashboard</h2>
          <nav className="space-y-3 flex-1">
            <Link to="/" className="block rounded-lg px-3 py-2 hover:bg-primary-dark transition-colors duration-200">Students</Link>
            <Link to="/subjects" className="block rounded-lg px-3 py-2 hover:bg-primary-dark transition-colors duration-200">Subjects</Link>
            <Link to="/syllabus" className="block rounded-lg px-3 py-2 hover:bg-primary-dark transition-colors duration-200">Syllabus</Link>
            <Link to="/workpool" className="block rounded-lg px-3 py-2 hover:bg-primary-dark transition-colors duration-200">Work Pool</Link>
            <Link to="/doubts" className="block rounded-lg px-3 py-2 hover:bg-primary-dark transition-colors duration-200">Doubts</Link>
            <Link to="/tests" className="block rounded-lg px-3 py-2 hover:bg-primary-dark transition-colors duration-200">Tests</Link>
            <Link to="/attendance" className="block rounded-lg px-3 py-2 hover:bg-primary-dark transition-colors duration-200">Attendance</Link>
          </nav>
          <div className="mt-auto text-sm text-primary-light px-3 py-2">
            &copy; 2024 Mini Edu Dashboard
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 overflow-y-auto bg-background min-h-screen">
          <Routes>
            <Route path="/" element={<StudentDirectory />} />
            <Route path="/subjects" element={<SubjectManager />} />
            <Route path="/syllabus" element={<SyllabusProgress studentId="abc123" />} />
            <Route path="/workpool" element={<WorkPool />} />
            <Route path="/doubts" element={<DoubtBox />} />
            <Route path="/tests" element={<TestTracker />} />
            <Route path="/attendance" element={<Attendance />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
