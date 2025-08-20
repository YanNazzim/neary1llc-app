import React, { useState, useEffect } from 'react';
import './App.css';
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

// Get secure credentials from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Helper component for form sections
const Section = ({ title, children }) => (
  <div className="form-section card">
    <div className="card-header">
      <h2 className="card-title">{title}</h2>
    </div>
    <div className="card-content">
      {children}
    </div>
  </div>
);

// Helper component for form fields
const FormField = ({ label, id, type = 'text', value, onChange, placeholder, required = false }) => (
  <div className="form-field">
    <label htmlFor={id} className="form-label">
      {label} {required && <span className="required-star">*</span>}
    </label>
    <input
      className="form-input"
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
    />
  </div>
);

// Login Component
const LoginScreen = ({ setView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Failed to sign in. Please check your email and password.");
      console.error(err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError("Failed to sign in with Google. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="app-container">
      <div className="form-card card">
        <div className="card-header">
          <h1 className="card-title">Neary 1, LLC Renters Portal</h1>
          <p className="card-description">Login</p>
        </div>
        <div className="card-content">
          <form onSubmit={handleLogin}>
            <Section>
              <FormField
                label="Email"
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FormField
                label="Password"
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="auth-error">{error}</p>}
            </Section>
            <div className="submit-btn-container">
              <button type="submit" className="submit-btn">Login</button>
            </div>
          </form>
          <div className="auth-separator">OR</div>
          <div className="submit-btn-container">
            <button onClick={handleGoogleSignIn} className="google-btn">
              Sign in with Google
            </button>
          </div>
          <p className="auth-switch-text">
            Don't have an account? <button className="link-btn" onClick={() => setView('signup')}>Sign Up</button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Signup Component
const SignupScreen = ({ setView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Failed to create account. Password should be at least 6 characters.");
      console.error(err);
    }
  };

  return (
    <div className="app-container">
      <div className="form-card card">
        <div className="card-header">
          <h1 className="card-title">Landlord Portal</h1>
          <p className="card-description">Create an Account</p>
        </div>
        <div className="card-content">
          <form onSubmit={handleSignup}>
            <Section>
              <FormField
                label="Email"
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FormField
                label="Password"
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="auth-error">{error}</p>}
            </Section>
            <div className="submit-btn-container">
              <button type="submit" className="submit-btn">Sign Up</button>
            </div>
          </form>
          <p className="auth-switch-text">
            Already have an account? <button className="link-btn" onClick={() => setView('login')}>Login</button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Main Application Form Component
const ApplicationForm = ({ handleLogout }) => {
  const [formData, setFormData] = useState({
    dateOfApplication: '',
    desiredMoveInDate: '',
    applyingFor: '',
    email: '',
    phone: '',
    applicantFullName: '',
    applicantDob: '',
    applicantSsn: '',
    coResidentName: '',
    coResidentDob: '',
    coResidentSsn: '',
    additionalOccupants: [{ name: '', relationship: '', dob: '' }],
    presentAddress: '',
    presentCity: '',
    presentState: '',
    presentZip: '',
    presentLandlordName: '',
    presentLandlordPhone: '',
    presentMonthlyRent: '',
    presentReasonForLeaving: '',
    previousAddress: '',
    previousCity: '',
    previousState: '',
    previousZip: '',
    previousLandlordName: '',
    previousLandlordPhone: '',
    previousMonthlyRent: '',
    previousReasonForLeaving: '',
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    timeAtCompany: '',
    jobRole: '',
    weeklyIncome: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => {
        if (file.objectURL) {
          URL.revokeObjectURL(file.objectURL);
        }
      });
    };
  }, [uploadedFiles]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  const handleOccupantChange = (index, e) => {
    const { name, value } = e.target;
    const list = [...formData.additionalOccupants];
    list[index][name] = value;
    setFormData(prevState => ({
      ...prevState,
      additionalOccupants: list
    }));
  };

  const handleAddOccupant = () => {
    setFormData(prevState => ({
      ...prevState,
      additionalOccupants: [...prevState.additionalOccupants, { name: '', relationship: '', dob: '' }]
    }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files).map(file => {
      const isImage = file.type.startsWith('image/');
      return {
        file,
        objectURL: isImage ? URL.createObjectURL(file) : null
      };
    });
    setUploadedFiles(prevFiles => [...prevFiles, ...newFiles]);
  };

  const handleRemoveFile = (indexToRemove) => {
    setUploadedFiles(prevFiles => {
      const newFiles = prevFiles.filter((_, index) => index !== indexToRemove);
      return newFiles;
    });
  };

const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Create a clean copy of the form data to modify
    const dataToSubmit = { ...formData };

    // 2. Filter out any additional occupants that are completely empty
    const filteredOccupants = dataToSubmit.additionalOccupants.filter(occupant => 
      occupant.name || occupant.relationship || occupant.dob
    );
    dataToSubmit.additionalOccupants = filteredOccupants;

    // 3. Handle file uploads
    let uploadedFileMetadata = [];
    try {
      const fileUploadPromises = uploadedFiles.map(item => {
        const file = item.file;
        const fileExtension = file.name.split('.').pop();
        // Use applicant's name for the folder, or a generic 'uploads' if name is blank
        const applicantFolder = dataToSubmit.applicantFullName || 'uploads';
        const storageRef = ref(storage, `applications/${applicantFolder}/${uuidv4()}.${fileExtension}`);
        
        return uploadBytes(storageRef, file).then(snapshot => 
          getDownloadURL(snapshot.ref).then(url => ({
            name: file.name,
            url: url
          }))
        );
      });

      uploadedFileMetadata = await Promise.all(fileUploadPromises);
    } catch (error) {
      console.error('Failed to upload files:', error);
      setSuccessMessage("Error uploading files. Please try again.");
      return; // Stop submission if file upload fails
    }

    // 4. Build the final application data object
    const applicationData = {
      ...dataToSubmit,
      uploadedFiles: uploadedFileMetadata,
      createdAt: new Date()
    };
    
    // 5. Remove any top-level empty string fields before saving
    // Note: This does not remove fields that are 0 or false, only empty strings.
    for (const key in applicationData) {
      if (applicationData[key] === '') {
        delete applicationData[key];
      }
    }

    // 6. Submit to Firestore
    try {
      await addDoc(collection(db, "applications"), applicationData);
      
      setSuccessMessage("Application submitted successfully!");
      // Reset form state after successful submission
      setFormData({
        dateOfApplication: '',
        desiredMoveInDate: '',
        applyingFor: '',
        email: '',
        phone: '',
        applicantFullName: '',
        applicantDob: '',
        applicantSsn: '',
        coResidentName: '',
        coResidentDob: '',
        coResidentSsn: '',
        additionalOccupants: [{ name: '', relationship: '', dob: '' }],
        presentAddress: '',
        presentCity: '',
        presentState: '',
        presentZip: '',
        presentLandlordName: '',
        presentLandlordPhone: '',
        presentMonthlyRent: '',
        presentReasonForLeaving: '',
        previousAddress: '',
        previousCity: '',
        previousState: '',
        previousZip: '',
        previousLandlordName: '',
        previousLandlordPhone: '',
        previousMonthlyRent: '',
        previousReasonForLeaving: '',
        companyName: '',
        companyAddress: '',
        companyPhone: '',
        timeAtCompany: '',
        jobRole: '',
        weeklyIncome: '',
      });
      setUploadedFiles([]);
      setTimeout(() => setSuccessMessage(null), 5000);

    } catch (error) {
      console.error('Failed to submit application:', error);
      setSuccessMessage("Failed to submit application. Please check the console for details.");
    }
  };

  return (
    <div className="app-container">
      <div className="form-card card">
        <div className="card-header">
          <h1 className="card-title">Neary I, LLC</h1>
          <p className="card-description">
            Rental Application
          </p>
          <p className="card-note">
            Thank you for your interest in our apartments!
          </p>
          <button onClick={handleLogout} className="logout-btn">Log out</button>
        </div>

        <div className="card-content">
          {successMessage && <div className="success-message">{successMessage}</div>}
          <form onSubmit={handleSubmit}>
            {/* Application Details Section */}
            <Section title="Application Details">
              <div className="form-field-group md-cols-2">
                <FormField
                  label="Date of Application"
                  id="dateOfApplication"
                  type="date"
                  value={formData.dateOfApplication}
                  onChange={handleChange}
                  required
                />
                <FormField
                  label="Desired Move-in Date"
                  id="desiredMoveInDate"
                  type="date"
                  value={formData.desiredMoveInDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <FormField
                label="Applying for Address/Unit"
                id="applyingFor"
                value={formData.applyingFor}
                onChange={handleChange}
                placeholder="123 Main St, Apt 4"
                required
              />
              <div className="form-field-group md-cols-2">
                <FormField
                  label="Email Address"
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <FormField
                  label="Phone Number"
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </Section>

            {/* Personal Information Section */}
            <Section title="Personal Information">
              <FormField
                label="Applicant’s Full Name"
                id="applicantFullName"
                value={formData.applicantFullName}
                onChange={handleChange}
                required
              />
              <div className="form-field-group md-cols-2">
                <FormField
                  label="Date of Birth"
                  id="applicantDob"
                  type="date"
                  value={formData.applicantDob}
                  onChange={handleChange}
                  required
                />
                <FormField
                  label="Social Security #"
                  id="applicantSsn"
                  value={formData.applicantSsn}
                  onChange={handleChange}
                  required
                />
              </div>
              <hr className="divider" />
              <p className="card-description">
                Co-Resident Information
              </p>
              <FormField
                label="Co-Resident Full Name"
                id="coResidentName"
                value={formData.coResidentName}
                onChange={handleChange}
              />
              <div className="form-field-group md-cols-2">
                <FormField
                  label="Date of Birth"
                  id="coResidentDob"
                  type="date"
                  value={formData.coResidentDob}
                  onChange={handleChange}
                />
                <FormField
                  label="Social Security #"
                  id="coResidentSsn"
                  value={formData.coResidentSsn}
                  onChange={handleChange}
                />
              </div>
            </Section>

            {/* Additional Occupants Section */}
            <Section title="Additional Occupants">
              <p className="card-description">
                List everyone that will be living with you in the apartment.
              </p>
              {formData.additionalOccupants.map((occupant, index) => (
                <div key={index} className="occupant-grid">
                  <FormField
                    label="Name"
                    id={`occupant-name-${index}`}
                    name="name"
                    value={occupant.name}
                    onChange={(e) => handleOccupantChange(index, e)}
                  />
                  <FormField
                    label="Relationship"
                    id={`occupant-relationship-${index}`}
                    name="relationship"
                    value={occupant.relationship}
                    onChange={(e) => handleOccupantChange(index, e)}
                  />
                  <FormField
                    label="Date of Birth"
                    id={`occupant-dob-${index}`}
                    name="dob"
                    type="date"
                    value={occupant.dob}
                    onChange={(e) => handleOccupantChange(index, e)}
                  />
                </div>
              ))}
              <button type="button" onClick={handleAddOccupant} className="add-occupant-btn">
                Add Another Occupant
              </button>
            </Section>

            {/* Residential History Section */}
            <Section title="Residential History">
              <p className="card-description">
                Present Address
              </p>
              <FormField
                label="Present Address"
                id="presentAddress"
                value={formData.presentAddress}
                onChange={handleChange}
                required
              />
              <div className="form-field-group sm-cols-3">
                <FormField
                  label="City"
                  id="presentCity"
                  value={formData.presentCity}
                  onChange={handleChange}
                  required
                />
                <FormField
                  label="State"
                  id="presentState"
                  value={formData.presentState}
                  onChange={handleChange}
                  required
                />
                <FormField
                  label="Zip"
                  id="presentZip"
                  value={formData.presentZip}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-field-group md-cols-2">
                <FormField
                  label="Landlord Name"
                  id="presentLandlordName"
                  value={formData.presentLandlordName}
                  onChange={handleChange}
                  required
                />
                <FormField
                  label="Landlord Phone #"
                  id="presentLandlordPhone"
                  value={formData.presentLandlordPhone}
                  onChange={handleChange}
                  required
                />
              </div>
              <FormField
                label="Current Monthly Rent"
                id="presentMonthlyRent"
                type="number"
                value={formData.presentMonthlyRent}
                onChange={handleChange}
                required
              />
              <FormField
                label="Reason for Leaving"
                id="presentReasonForLeaving"
                value={formData.presentReasonForLeaving}
                onChange={handleChange}
                required
              />
              <hr className="divider" />
              <p className="card-description">
                Previous Address
              </p>
              <FormField
                label="Previous Address"
                id="previousAddress"
                value={formData.previousAddress}
                onChange={handleChange}
              />
              <div className="form-field-group sm-cols-3">
                <FormField
                  label="City"
                  id="previousCity"
                  value={formData.previousCity}
                  onChange={handleChange}
                />
                <FormField
                  label="State"
                  id="previousState"
                  value={formData.previousState}
                  onChange={handleChange}
                />
                <FormField
                  label="Zip"
                  id="previousZip"
                  value={formData.previousZip}
                  onChange={handleChange}
                />
              </div>
              <div className="form-field-group md-cols-2">
                <FormField
                  label="Landlord Name"
                  id="previousLandlordName"
                  value={formData.previousLandlordName}
                  onChange={handleChange}
                />
                <FormField
                  label="Landlord Phone #"
                  id="previousLandlordPhone"
                  value={formData.previousLandlordPhone}
                  onChange={handleChange}
                />
              </div>
              <FormField
                label="Current Monthly Rent"
                id="previousMonthlyRent"
                type="number"
                value={formData.previousMonthlyRent}
                onChange={handleChange}
              />
              <FormField
                label="Reason for Leaving"
                id="previousReasonForLeaving"
                value={formData.previousReasonForLeaving}
                onChange={handleChange}
              />
            </Section>

            {/* Employment Information Section */}
            <Section title="Employment Information">
              <FormField
                label="Name of Company"
                id="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
              <div className="form-field-group sm-cols-2">
                <FormField
                  label="Address"
                  id="companyAddress"
                  value={formData.companyAddress}
                  onChange={handleChange}
                  required
                />
                <FormField
                  label="Phone #"
                  id="companyPhone"
                  value={formData.companyPhone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-field-group sm-cols-2">
                <FormField
                  label="Amount of time at current Company/Position"
                  id="timeAtCompany"
                  value={formData.timeAtCompany}
                  onChange={handleChange}
                  required
                />
                <FormField
                  label="Job Role/Position"
                  id="jobRole"
                  value={formData.jobRole}
                  onChange={handleChange}
                  required
                />
              </div>
              <FormField
                label="Weekly/Bi-Weekly Income"
                id="weeklyIncome"
                type="number"
                value={formData.weeklyIncome}
                onChange={handleChange}
                placeholder="e.g., 500"
                required
              />
              <p className="card-note">
                *Note: Rent cannot exceed 1/3 of the Gross Monthly Income.
              </p>
            </Section>

            {/* Application Requirements Note */}
            <div className="requirements-card card">
              <h3 className="requirements-title">Application Requirements:</h3>
              <ul className="requirements-list">
                <li>Provide COPY of last 4 paystubs</li>
                <li>Provide COPY of at least 1 month of bank statements</li>
                <li>Provide COPY of State ID / Driver’s License</li>
                <li>Provide COPY of Social Security Card or Tax ID</li>
                <li>A $50 NON REFUNDABLE APPLICATION FEE</li>
              </ul>
            </div>
            {/* Document Uploads Section */}
            <Section title="Document Uploads">
              <p className="card-description">
                Please upload the required documents.
              </p>
              <div className="form-field">
                <label htmlFor="file-upload" className="form-label">
                  Select Files
                </label>
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileChange}
                  className="file-input"
                />
                {uploadedFiles.length > 0 && (
                  <div className="uploaded-files-list">
                    <h4>Uploaded Files:</h4>
                    <ul className="file-list-container">
                      {uploadedFiles.map((item, index) => (
                        <li key={index} className="file-item">
                          {item.objectURL ? (
                            <img src={item.objectURL} alt={item.file.name} className="file-thumbnail" />
                          ) : (
                            <div className="file-thumbnail file-icon"></div>
                          )}
                          <span className="file-name">{item.file.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="remove-file-btn"
                          >
                            X
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Section>

            {/* Submission and Dialog */}
            <div className="submit-btn-container">
              <button
                type="submit"
                className="submit-btn"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Landlord Dashboard Component
const Dashboard = ({ handleLogout }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "applications"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenApplication = (application) => {
    setSelectedApplication(application);
  };

  const handleCloseApplication = () => {
    setSelectedApplication(null);
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="form-card card">
          <div className="dashboard-header">
            <h1 className="card-title">Landlord Dashboard</h1>
            <button onClick={handleLogout} className="logout-btn">Log out</button>
          </div>
          <div className="loading-state">Loading applications...</div>
        </div>
      </div>
    );
  }

  if (selectedApplication) {
    return (
      <div className="app-container">
        <div className="form-card card">
          <div className="dashboard-header">
            <h1 className="card-title">{selectedApplication.applicantFullName}'s Application</h1>
            <div className="button-group">
              <button onClick={handleCloseApplication} className="back-btn">Back to Dashboard</button>
              <button onClick={handleLogout} className="logout-btn">Log out</button>
            </div>
          </div>
          <div className="application-detail">
            <p><strong>Date Submitted:</strong> {selectedApplication.createdAt.toDate().toLocaleDateString()}</p>
            <p><strong>Applying For:</strong> {selectedApplication.applyingFor}</p>
            <p><strong>Email:</strong> {selectedApplication.email}</p>
            <p><strong>Phone:</strong> {selectedApplication.phone}</p>
            <h3 className="section-title">Personal Information</h3>
            <p><strong>Full Name:</strong> {selectedApplication.applicantFullName}</p>
            <p><strong>Date of Birth:</strong> {selectedApplication.applicantDob}</p>
            <p><strong>Social Security #:</strong> {selectedApplication.applicantSsn}</p>
            
            <h3 className="section-title">Residential History</h3>
            <p><strong>Present Address:</strong> {selectedApplication.presentAddress}</p>
            <p><strong>Present Landlord Name:</strong> {selectedApplication.presentLandlordName}</p>

            <h3 className="section-title">Uploaded Files</h3>
            <ul className="file-list-container">
              {selectedApplication.uploadedFiles && selectedApplication.uploadedFiles.length > 0 ? (
                selectedApplication.uploadedFiles.map((file, index) => (
                  <li key={index} className="file-item-dashboard">
                    <span className="file-name">{file.name}</span>
                    <a href={file.url} target="_blank" rel="noopener noreferrer" download={file.name} className="download-btn">Download</a>
                  </li>
                ))
              ) : (
                <li>No files uploaded.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="form-card card">
        <div className="dashboard-header">
          <h1 className="card-title">Landlord Dashboard</h1>
          <button onClick={handleLogout} className="logout-btn">Log out</button>
        </div>
        <div className="dashboard-content">
          <ul className="applications-list">
            {applications.length > 0 ? (
              applications.map(app => (
                <li key={app.id} className="application-item" onClick={() => handleOpenApplication(app)}>
                  <div className="application-summary">
                    <h2 className="app-title">{app.applicantFullName}</h2>
                    <p className="app-date">
                      {app.createdAt.toDate().toLocaleDateString()
                    }</p>
                  </div>
                </li>
              ))
            ) : (
              <p>No applications have been submitted yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [view, setView] = useState('login');
  
  // Replace with the specific landlord email
  const LANDLORD_EMAIL = "ygnh00@gmail.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        if (authUser.email === LANDLORD_EMAIL) {
          setView('dashboard');
        } else {
          setView('application');
        }
      } else {
        setView('login');
      }
    });
    return unsubscribe;
  }, [LANDLORD_EMAIL]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  if (view === 'login') {
    return <LoginScreen setView={setView} />;
  }
  if (view === 'signup') {
    return <SignupScreen setView={setView} />;
  }
  if (view === 'application') {
    return <ApplicationForm handleLogout={handleLogout} />;
  }
  if (view === 'dashboard') {
    return <Dashboard handleLogout={handleLogout} />;
  }
};

export default App;