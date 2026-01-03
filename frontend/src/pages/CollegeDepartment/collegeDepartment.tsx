import { useState, useEffect, useRef } from 'react';
import './collegeDepartment.css';
import { getColleges } from '../../api/colleges';
import { getDepartmentsByCollegeName } from '../../api/department';
import { getSemestersByNames } from '../../api/semester';

interface CollegeDepartmentProps {
  onNavigateToContent: () => void;
}

interface HierarchyData {
  college: string;
  department: string;
  semester: string;
}

type Step = 'college' | 'department' | 'semester';

const CollegeDepartment = ({ onNavigateToContent }: CollegeDepartmentProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('college');
  const [hierarchy, setHierarchy] = useState<HierarchyData>({
    college: '',
    department: '',
    semester: '',
  });

  const [colleges, setColleges] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);

  // 🔒 separate loaders & errors (logic only)
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingSemesters, setLoadingSemesters] = useState(false);

  const [collegeError, setCollegeError] = useState('');
  const [departmentError, setDepartmentError] = useState('');
  const [semesterError, setSemesterError] = useState('');

  // 🔒 async guards
  const departmentReqId = useRef(0);
  const semesterReqId = useRef(0);

  /* =====================
     EFFECTS
  ====================== */

  useEffect(() => {
    loadColleges();
  }, []);

  // Load departments when college is selected
  useEffect(() => {
    if (!hierarchy.college) return;
    setDepartments([]);
    setSemesters([]);
    setDepartmentError('');
    setSemesterError('');
    loadDepartments();
  }, [hierarchy.college]);

  // Load semesters when department is selected
  useEffect(() => {
    if (!hierarchy.department) return;
    setSemesters([]);
    setSemesterError('');
    loadSemesters();
  }, [hierarchy.department]);

  /* =====================
     LOADERS
  ====================== */

  const loadColleges = async () => {
    try {
      setLoadingColleges(true);
      setCollegeError('');
      const response = await getColleges();
      setColleges(response.data);
    } catch {
      setCollegeError('Failed to load colleges');
    } finally {
      setLoadingColleges(false);
    }
  };

  const loadDepartments = async () => {
    const id = ++departmentReqId.current;
    try {
      setLoadingDepartments(true);
      setDepartmentError('');
      const response = await getDepartmentsByCollegeName(hierarchy.college);
      if (id !== departmentReqId.current) return;
      setDepartments(response.data);
    } catch {
      setDepartmentError('Failed to load departments');
      setDepartments([]);
    } finally {
      if (id === departmentReqId.current) setLoadingDepartments(false);
    }
  };

  const loadSemesters = async () => {
    const id = ++semesterReqId.current;
    try {
      setLoadingSemesters(true);
      setSemesterError('');
      const response = await getSemestersByNames(
        hierarchy.department,
        hierarchy.college
      );
      if (id !== semesterReqId.current) return;
      setSemesters(response.data);
    } catch {
      setSemesterError('Failed to load semesters');
      setSemesters([]);
    } finally {
      if (id === semesterReqId.current) setLoadingSemesters(false);
    }
  };

  /* =====================
     HANDLERS
  ====================== */

  const handleSelection = (field: keyof HierarchyData, value: string) => {
    const newHierarchy = {
      ...hierarchy,
      [field]: value,
      // Clear subsequent fields when changing parent selection
      ...(field === 'college' && { department: '', semester: '' }),
      ...(field === 'department' && { semester: '' }),
    };

    setHierarchy(newHierarchy);

    if (field === 'college') setCurrentStep('department');
    else if (field === 'department') setCurrentStep('semester');
    else handleComplete(newHierarchy);
  };

  const handleBack = () => {
    if (currentStep === 'department') {
      setCurrentStep('college');
      setHierarchy(prev => ({ ...prev, department: '', semester: '' }));
    } else if (currentStep === 'semester') {
      setCurrentStep('department');
      setHierarchy(prev => ({ ...prev, semester: '' }));
    }
  };

  const handleComplete = (completedHierarchy?: HierarchyData) => {
    localStorage.setItem(
      'hierarchy',
      JSON.stringify(completedHierarchy || hierarchy)
    );
    onNavigateToContent();
  };

  /* =====================
     RENDER (UI UNCHANGED)
  ====================== */

  const loading = loadingColleges || loadingDepartments || loadingSemesters;
  const error = collegeError || departmentError || semesterError;

  const renderCollegeStep = () => (
    <div className="step-content">
      <div className="step-header">
        <h2>Select Your College</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="selection-grid">
        {loading ? (
          <div className="loading">Loading colleges...</div>
        ) : (
          colleges.map(college => (
            <button
              key={college.id}
              className="selection-card"
              onClick={() => handleSelection('college', college.name)}
            >
              <h3>{college.name}</h3>
            </button>
          ))
        )}
      </div>
    </div>
  );

  const renderDepartmentStep = () => (
    <div className="step-content">
      <div className="step-header">
        <div className="step-nav"></div>
        <h2>Select Your Department</h2>
        <p>Choose your department in {hierarchy.college}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="selection-grid">
        {loading ? (
          <div className="loading">Loading departments...</div>
        ) : (
          departments.map(department => (
            <button
              key={department.id}
              className="selection-card"
              onClick={() =>
                handleSelection('department', department.name)
              }
            >
              <h3>{department.name}</h3>
            </button>
          ))
        )}
      </div>
    </div>
  );

  const renderSemesterStep = () => (
    <div className="step-content">
      <div className="step-header">
        <div className="step-nav"></div>
        <h2>Select Your Semester</h2>
        <p>Choose your current semester in {hierarchy.department}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="selection-grid">
        {loading ? (
          <div className="loading">Loading semesters...</div>
        ) : semesters.length > 0 ? (
          semesters.map(semester => (
            <button
              key={semester.id}
              className="selection-card"
              onClick={() =>
                handleSelection('semester', semester.name)
              }
            >
              <h3>{semester.name}</h3>
            </button>
          ))
        ) : (
          <div className="no-data">
            <p>No semesters found for {hierarchy.department}</p>
            <p>
              Available semesters in database may not match the department name.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="college-department-container">
      {currentStep !== 'college' && (
        <button className="back-button" onClick={handleBack} aria-label="Go back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
      )}

      <div className="college-department-card">
        <div className="step-indicator">
          <div className={`step-dot ${currentStep === 'college' || currentStep === 'department' || currentStep === 'semester' ? 'active' : ''}`}>1</div>
          <div className={`step-line ${currentStep === 'department' || currentStep === 'semester' ? 'active' : ''}`}></div>
          <div className={`step-dot ${currentStep === 'department' || currentStep === 'semester' ? 'active' : ''}`}>2</div>
          <div className={`step-line ${currentStep === 'semester' ? 'active' : ''}`}></div>
          <div className={`step-dot ${currentStep === 'semester' ? 'active' : ''}`}>3</div>
        </div>

        <div className="step-labels">
          <span className={currentStep === 'college' ? 'active' : ''}>College</span>
          <span className={currentStep === 'department' ? 'active' : ''}>Department</span>
          <span className={currentStep === 'semester' ? 'active' : ''}>Semester</span>
        </div>

        {currentStep === 'college' && renderCollegeStep()}
        {currentStep === 'department' && renderDepartmentStep()}
        {currentStep === 'semester' && renderSemesterStep()}
      </div>
    </div>
  );
};

export default CollegeDepartment;
