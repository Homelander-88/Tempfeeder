import { useState } from 'react';
import './collegeDepartment.css';

interface CollegeDepartmentProps {
  onNavigateToContent: () => void;
}

interface FormData {
  college: string;
  department: string;
  semester: string;
}

const CollegeDepartment = ({ onNavigateToContent }: CollegeDepartmentProps) => {
  const [formData, setFormData] = useState<FormData>({
    college: '',
    department: '',
    semester: '',
  });

  const colleges = [
    'College of Engineering',
    'College of Science',
    'College of Arts',
    'College of Commerce',
    'College of Medicine',
  ];

  const departments = [
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Information Technology',
    'Physics',
    'Chemistry',
    'Biology',
    'Mathematics',
  ];

  const semesters = [
    '1st Semester',
    '2nd Semester',
    '3rd Semester',
    '4th Semester',
    '5th Semester',
    '6th Semester',
    '7th Semester',
    '8th Semester',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Store the hierarchy details in localStorage (even if empty)
    localStorage.setItem('hierarchy', JSON.stringify(formData));

    // Navigate to content immediately
    onNavigateToContent();
  };

  return (
    <div className="college-department-container">
      <div className="college-department-card">
        <div className="college-department-header">
          <h1>Select Your Details</h1>
          <p>Choose your college, department, and semester</p>
        </div>

        <form onSubmit={handleSubmit} className="college-department-form">
          <div className="form-group">
            <label htmlFor="college">College</label>
            <select
              id="college"
              name="college"
              value={formData.college}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select College</option>
              {colleges.map((college) => (
                <option key={college} value={college}>
                  {college}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="department">Department</label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="semester">Semester</label>
            <select
              id="semester"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select Semester</option>
              {semesters.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="submit-button"
          >
            Continue
          </button>
        </form>

      </div>
    </div>
  );
};

export default CollegeDepartment;
