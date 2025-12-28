import { useState } from 'react';
import api from '../../api/api';
import './collegeDepartment.css';

interface CollegeDepartmentProps {
  onNavigateToContent: () => void;
  onNavigateToLogin: () => void;
}

interface FormData {
  college: string;
  department: string;
  semester: string;
}

const CollegeDepartment = ({ onNavigateToContent, onNavigateToLogin }: CollegeDepartmentProps) => {
  const [formData, setFormData] = useState<FormData>({
    college: '',
    department: '',
    semester: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    setError('');
  };

  const validateForm = () => {
    if (!formData.college || !formData.department || !formData.semester) {
      setError('All fields are required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Save the hierarchy details to backend via API
      await api.post('/hierarchy', {
        college: formData.college,
        department: formData.department,
        semester: formData.semester,
      });

      // Store the hierarchy details in localStorage as well
      localStorage.setItem('hierarchy', JSON.stringify(formData));
      
      // Navigate to content
      onNavigateToContent();
    } catch (err) {
      console.error('Failed to save hierarchy:', err);
      setError('Failed to save details. Please try again.');
      setIsLoading(false);
    }
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
              required
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
              required
              className="form-select"
              disabled={!formData.college}
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
              required
              className="form-select"
              disabled={!formData.department}
            >
              <option value="">Select Semester</option>
              {semesters.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </button>
        </form>

        <div className="college-department-footer">
          <p>
            Want to change later?{' '}
            <a onClick={onNavigateToLogin} style={{ cursor: 'pointer' }} className="footer-link">
              Log out
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CollegeDepartment;
