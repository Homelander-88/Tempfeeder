import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './SettingsDropdown.css';
import { useHierarchy } from '../../context/HeirarchyContext.tsx';

export default function SettingsDropdown() {
    const BASE_BACKEND_URL = "http://localhost:5000/api";
    const [open, setOpen] = useState(true);
    const [collegesData, setCollegesData] = useState<any[]>([]);
    const [departmentsData, setDepartmentsData] = useState<any[]>([]);
    const [semestersData, setSemestersData] = useState<any[]>([]);
    const [selectedCollege, setSelectedCollege] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const containerRef = useRef<HTMLDivElement | null>(null);
    const collegeRef = useRef<HTMLSelectElement | null>(null);
    const { setHierarchy,loadCourses } = useHierarchy();

    // Fetch colleges
    useEffect(() => {
        if (!open) return;
        setTimeout(() => collegeRef.current?.focus(), 0);

        axios.get(`${BASE_BACKEND_URL}/colleges`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => {
                if (Array.isArray(res.data)) setCollegesData(res.data);
            })
            .catch(err => console.error(err));
    }, [open]);

    // Fetch departments when a college is selected
    // When a college is selected
    // When a college is selected
    useEffect(() => {
        if (!selectedCollege) {
            setDepartmentsData([]);
            return;
        }

        console.log('Selected College:', selectedCollege, 'Type:', typeof selectedCollege);

        // Find college by id - convert selectedCollege to number for comparison
        const collegeObj = collegesData.find(c => c.id === Number(selectedCollege));

        if (!collegeObj) {
            console.warn("Selected college not found:", selectedCollege);
            setDepartmentsData([]);
            return;
        }

        console.log('Found college object:', collegeObj);

        axios.get(`${BASE_BACKEND_URL}/departments`, {
            params: { collegeId: collegeObj.id },
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then(res => {
                console.log('Departments response:', res.data);
                if (Array.isArray(res.data)) setDepartmentsData(res.data);
                else setDepartmentsData([]);
            })
            .catch(err => {
                console.error("Failed to fetch departments", err.response || err);
                setDepartmentsData([]);
            });

        setSelectedDepartment('');
        setSelectedSemester('');
        setSemestersData([]);
    }, [selectedCollege, collegesData]); // Add collegesData as dependency




    // Fetch semesters when a department is selected
    useEffect(() => {
        if (!selectedDepartment) return setSemestersData([]);

        const deptObj = departmentsData.find(d => d.name === selectedDepartment);
        if (!deptObj) return setSemestersData([]);

        axios.get(`${BASE_BACKEND_URL}/semesters?departmentId=${deptObj.id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => {
                if (Array.isArray(res.data)) setSemestersData(res.data);
            })
            .catch(err => console.error(err));

        setSelectedSemester('');
    }, [selectedDepartment, departmentsData]);

    // Close on outside click or Escape
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
        }
        function handleEsc(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const handleApply = () => {
        // Find the actual names from the data arrays
        const collegeObj = collegesData.find(c => c.id === Number(selectedCollege));
        const collegeName = collegeObj ? collegeObj.name : selectedCollege;

        console.log('Saving hierarchy:', {
            college: collegeName,
            department: selectedDepartment,
            semester: selectedSemester
        });

        setHierarchy({
            college: collegeName, // Store the name, not the ID
            department: selectedDepartment, // Already a name
            semester: selectedSemester // Already a name
        });

        // Trigger courses to reload with the new hierarchy
        setTimeout(() => {
            loadCourses().catch(err => console.error('Failed to load courses:', err));
        }, 100);

        setOpen(false);
    };

    return (
        <div className="settings-dropdown-container" ref={containerRef}>
            {open && (
                <div className="settings-panel" role="dialog" aria-label="Settings" aria-modal="false">
                    <form className="settings-form" onSubmit={e => { e.preventDefault(); handleApply(); }}>
                        {/* College */}
                        <div className="settings-field">
                            <label htmlFor="college-select" className="settings-label">College</label>
                            <select
                                id="college-select"
                                ref={collegeRef}
                                className="settings-select"
                                value={selectedCollege}
                                onChange={e => setSelectedCollege(e.target.value)}
                            >
                                <option value="" disabled>Choose college</option>
                                {Array.isArray(collegesData) && collegesData.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Department */}
                        <div className="settings-field">
                            <label htmlFor="department-select" className="settings-label">Department</label>
                            <select
                                id="department-select"
                                className="settings-select"
                                value={selectedDepartment}
                                onChange={e => setSelectedDepartment(e.target.value)}
                                disabled={!departmentsData.length}
                            >
                                <option value="" disabled>{departmentsData.length ? 'Choose department' : 'Select college first'}</option>
                                {Array.isArray(departmentsData) && departmentsData.map(d => (
                                    <option key={d.id} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Semester */}
                        <div className="settings-field">
                            <label htmlFor="semester-select" className="settings-label">Semester</label>
                            <select
                                id="semester-select"
                                className="settings-select"
                                value={selectedSemester}
                                onChange={e => setSelectedSemester(e.target.value)}
                                disabled={!semestersData.length}
                            >
                                <option value="" disabled>{semestersData.length ? 'Choose semester' : 'Select department first'}</option>
                                {Array.isArray(semestersData) && semestersData.map(s => (
                                    <option key={s.id} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="settings-actions">
                            <button type="submit" className="settings-apply">Save</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
