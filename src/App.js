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
  signInWithPopup,
  sendPasswordResetEmail
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  deleteDoc
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
          <p className="auth-switch-text" style={{ marginTop: '1rem', marginBottom: 0 }}>
            <button className="link-btn" onClick={() => setView('forgotPassword')}>Forgot Password?</button>
          </p>
          <div className="auth-separator"></div>
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Failed to create account. Password should be at least 6 characters and can include '@' and '#'.");
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
              <FormField
                label="Confirm Password"
                id="signup-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

// Forgot Password Component
const ForgotPasswordScreen = ({ setView }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError("Failed to send password reset email. Please check the address.");
      console.error(err);
    }
  };

  return (
    <div className="app-container">
      <div className="form-card card">
        <div className="card-header">
          <h1 className="card-title">Reset Password</h1>
          <p className="card-description">Enter your email to receive a reset link.</p>
        </div>
        <div className="card-content">
          <form onSubmit={handlePasswordReset}>
            <Section>
              <FormField
                label="Email"
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {message && <p className="success-message">{message}</p>}
              {error && <p className="auth-error">{error}</p>}
            </Section>
            <div className="submit-btn-container">
              <button type="submit" className="submit-btn">Send Reset Link</button>
            </div>
          </form>
          <p className="auth-switch-text">
            Remembered your password? <button className="link-btn" onClick={() => setView('login')}>Login</button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Main Application Form Component
const ApplicationForm = ({ handleLogout, existingApplication, setView, setUserApplication }) => {
  const [formData, setFormData] = useState(existingApplication || {
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

  const [uploadedFiles, setUploadedFiles] = useState(existingApplication?.uploadedFiles || []);
  const [successMessage, setSuccessMessage] = useState(null);

  const isEditMode = !!existingApplication;

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
        name: file.name,
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

    const dataToSubmit = { ...formData };

    const filteredOccupants = dataToSubmit.additionalOccupants.filter(occupant =>
      occupant.name || occupant.relationship || occupant.dob
    );
    dataToSubmit.additionalOccupants = filteredOccupants;

    let uploadedFileMetadata = [];
    try {
      const fileUploadPromises = uploadedFiles.map(item => {
        if (item.file) { // Only upload new files
          const file = item.file;
          const fileExtension = file.name.split('.').pop();
          const applicantFolder = dataToSubmit.applicantFullName || 'uploads';
          const storageRef = ref(storage, `applications/${applicantFolder}/${uuidv4()}.${fileExtension}`);

          return uploadBytes(storageRef, file).then(snapshot =>
            getDownloadURL(snapshot.ref).then(url => ({
              name: file.name,
              url: url
            }))
          );
        }
        return Promise.resolve(item); // Keep existing files
      });

      uploadedFileMetadata = await Promise.all(fileUploadPromises);
    } catch (error) {
      console.error('Failed to upload files:', error);
      setSuccessMessage("Error uploading files. Please try again.");
      return;
    }

    const applicationData = {
      ...dataToSubmit,
      uploadedFiles: uploadedFileMetadata,
      createdAt: isEditMode ? existingApplication.createdAt : new Date(),
      updatedAt: new Date(),
      userId: auth.currentUser.uid
    };

    for (const key in applicationData) {
      if (applicationData[key] === '') {
        delete applicationData[key];
      }
    }

    try {
      if (isEditMode) {
        const appDocRef = doc(db, "applications", existingApplication.id);
        await updateDoc(appDocRef, applicationData);
        setSuccessMessage("Application updated successfully!");
        setUserApplication({ id: existingApplication.id, ...applicationData });
      } else {
        const docRef = await addDoc(collection(db, "applications"), applicationData);
        setSuccessMessage("Application submitted successfully!");
        setUserApplication({ id: docRef.id, ...applicationData });
      }

      setTimeout(() => {
        setSuccessMessage(null);
        setView('tenantDashboard');
      }, 3000);

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
                            <img src={item.objectURL} alt={item.name} className="file-thumbnail" />
                          ) : (
                            <div className="file-thumbnail file-icon"></div>
                          )}
                          <span className="file-name">{item.name}</span>
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
                {isEditMode ? 'Update Application' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Helper component for individual data points in the detail view
const DetailItem = ({ label, value }) => (
  <div className="detail-item">
    <span className="detail-label">{label}</span>
    <span className="detail-value">{value || 'N/A'}</span>
  </div>
);

// Landlord Dashboard Component
const Dashboard = ({ handleLogout }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');

  // This useEffect sets up the real-time listener
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

    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, []);

  const handleOpenApplication = (application) => {
    setSelectedApplication(application);
  };

  const handleCloseApplication = () => {
    setSelectedApplication(null);
  };

  // New function for manual data synchronization
  const handleSync = async () => {
    setIsSyncing(true);
    setApplications([]); // This line clears the state before fetching
    try {
      const q = query(collection(db, "applications"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q); // One-time fetch from the database
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(docs);
    } catch (error) {
      console.error("Failed to sync applications:", error);
    }
    setTimeout(() => setIsSyncing(false), 1000); // Give user feedback
  };

  const handleDeleteApplication = async () => {
    if (confirmInput.toLowerCase() === 'delete application') {
      try {
        const docRef = doc(db, "applications", selectedApplication.id);
        await deleteDoc(docRef);
        handleCloseApplication();
        setConfirmInput('');
        setShowDeleteModal(false);
      } catch (error) {
        console.error("Error deleting document: ", error);
        alert("Failed to delete the application. Please try again.");
      }
    } else {
      alert("You must type 'Delete Application' to confirm.");
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="form-card card">
          <div className="loading-state">Loading applications...</div>
        </div>
      </div>
    );
  }
  
  if (selectedApplication) {
    return (
      <div className="app-container">
        <div className="form-card card dashboard-container">
          <div className="dashboard-header">
            <div>
              <h1 className="card-title">{selectedApplication.applicantFullName}</h1>
              <p className="card-description">Application Details</p>
              <div className="button-group">
                <button onClick={handleCloseApplication} className="back-btn">Back to Dashboard</button>
                <button onClick={() => setShowDeleteModal(true)} className="logout-btn" style={{ border: '1px solid #f43f5e' }}>Delete Application</button>
              </div>
            </div>
            <div>
              <button onClick={handleLogout} className="logout-btn">Log out</button>
            </div>
          </div>
          
          <div className="application-detail-grid">
            {/* Primary Applicant Section */}
            <section className="detail-section">
              <h2 className="detail-section-title">Primary Applicant</h2>
              <DetailItem label="Full Name" value={selectedApplication.applicantFullName} />
              <DetailItem label="Date of Birth" value={selectedApplication.applicantDob} />
              <DetailItem label="SSN" value={selectedApplication.applicantSsn} />
              <DetailItem label="Email" value={selectedApplication.email} />
              <DetailItem label="Phone" value={selectedApplication.phone} />
            </section>

            {/* Co-Resident Section */}
            {selectedApplication.coResidentName && (
              <section className="detail-section">
                <h2 className="detail-section-title">Co-Resident</h2>
                <DetailItem label="Full Name" value={selectedApplication.coResidentName} />
                <DetailItem label="Date of Birth" value={selectedApplication.coResidentDob} />
                <DetailItem label="SSN" value={selectedApplication.coResidentSsn} />
              </section>
            )}

            {/* Residential History Section */}
            <section className="detail-section">
              <h2 className="detail-section-title">Residential History</h2>
              <h3 className="detail-subsection-title">Current Address</h3>
              <DetailItem label="Address" value={`${selectedApplication.presentAddress}, ${selectedApplication.presentCity}, ${selectedApplication.presentState} ${selectedApplication.presentZip}`} />
              <DetailItem label="Landlord" value={selectedApplication.presentLandlordName} />
              <DetailItem label="Landlord Phone" value={selectedApplication.presentLandlordPhone} />
              <DetailItem label="Monthly Rent" value={`$${selectedApplication.presentMonthlyRent}`} />
              <DetailItem label="Reason for Leaving" value={selectedApplication.presentReasonForLeaving} />
            </section>
            
            {/* Employment Info Section */}
            <section className="detail-section">
              <h2 className="detail-section-title">Employment</h2>
              <DetailItem label="Company" value={selectedApplication.companyName} />
              <DetailItem label="Position" value={selectedApplication.jobRole} />
              <DetailItem label="Time at Company" value={selectedApplication.timeAtCompany} />
              <DetailItem label="Weekly Income" value={`$${selectedApplication.weeklyIncome}`} />
            </section>

            {/* Uploaded Files Section */}
            <section className="detail-section detail-section-full">
              <h2 className="detail-section-title">Uploaded Documents</h2>
              <ul className="file-list-container">
                {selectedApplication.uploadedFiles && selectedApplication.uploadedFiles.length > 0 ? (
                  selectedApplication.uploadedFiles.map((file, index) => (
                    <li key={index} className="file-item-dashboard">
                      <span className="file-name">{file.name}</span>
                      <a href={file.url} target="_blank" rel="noopener noreferrer" download={file.name} className="download-btn">Download</a>
                    </li>
                  ))
                ) : (
                  <li>No files were uploaded with this application.</li>
                )}
              </ul>
            </section>
          </div>
        </div>
        {showDeleteModal && (
          <div className="app-container" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 10 }}>
            <div className="form-card card" style={{ maxWidth: '40rem', padding: '2rem', textAlign: 'center' }}>
              <h2 className="card-title" style={{ color: '#f43f5e' }}>Confirm Deletion</h2>
              <p className="card-description">This action cannot be undone. To confirm, please type **Delete Application** below.</p>
              <div className="form-field">
                <input
                  type="text"
                  className="form-input"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="Delete Application"
                />
              </div>
              <div className="button-group" style={{ marginTop: '1.5rem', justifyContent: 'center' }}>
                <button onClick={handleDeleteApplication} className="submit-btn" disabled={confirmInput.toLowerCase() !== 'delete application'}>
                  Confirm Delete
                </button>
                <button onClick={() => setShowDeleteModal(false)} className="back-btn" style={{ backgroundColor: '#475569' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Main dashboard view with all applications
  return (
    <div className="app-container">
      <div className="form-card card dashboard-container">
        <div className="dashboard-header">
          <h1 className="card-title">Landlord Dashboard</h1>
          <div className="button-group">
            <button onClick={handleSync} className="sync-btn" disabled={isSyncing}>
              {isSyncing ? 'Syncing...' : 'Sync Data'}
            </button>
            <button onClick={handleLogout} className="logout-btn">Log out</button>
          </div>
        </div>
        <div className="dashboard-grid">
          {applications.length > 0 ? (
            applications.map(app => (
              <div key={app.id} className="application-card" onClick={() => handleOpenApplication(app)}>
                <div className="card-content">
                  <h2 className="app-card-title">{app.applicantFullName}</h2>
                  <p className="app-card-subtitle">Applying for: {app.applyingFor}</p>
                  <div className="app-card-footer">
                    <span className="app-card-date">
                      {app.createdAt.toDate().toLocaleDateString()}
                    </span>
                    <span className="app-card-status">
                      <span className="status-dot"></span>
                      Needs Review
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No applications have been submitted yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};


// Tenant Dashboard Component
const TenantDashboard = ({ handleLogout, userApplication, setView, setExistingApplication }) => {
  const handleEdit = () => {
    setExistingApplication(userApplication);
    setView('application');
  };

  if (!userApplication) {
    return (
      <div className="app-container">
        <div className="form-card card">
          <div className="loading-state">Loading application...</div>
        </div>
      </div>
    );
  }
  
  const getDisplayDate = () => {
    if (!userApplication.createdAt) return 'N/A';
    if (typeof userApplication.createdAt.toDate === 'function') {
      return userApplication.createdAt.toDate().toLocaleDateString();
    }
    return new Date(userApplication.createdAt).toLocaleDateString();
  };

  return (
    <div className="app-container">
      <div className="form-card card tenant-dashboard">
        <div className="dashboard-header">
          <h1 className="card-title">My Application Portal</h1>
          <button onClick={handleLogout} className="logout-btn">Log out</button>
        </div>

        <div className="tenant-dashboard-content">
          <div className="status-card">
              <div className="status-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
              </div>
              <h2 className="status-title">Application Submitted</h2>
              <p className="status-description">
                  Your application for <strong>{userApplication.applyingFor || 'N/A'}</strong> submitted on <strong>{getDisplayDate()}</strong> is currently under review.
              </p>
          </div>

          <div className="actions-card">
              <h3 className="actions-title">Manage Your Application</h3>
              <p className="actions-description">You can make changes to your application, upload additional documents, or correct information as needed.</p>
              <button onClick={handleEdit} className="submit-btn edit-btn">
                  Edit My Application
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// Main App Component
const App = () => {
  const [view, setView] = useState('login');
  const [userApplication, setUserApplication] = useState(null);
  const [existingApplication, setExistingApplication] = useState(null);

  const LANDLORD_EMAIL = "ygnh00@gmail.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        if (authUser.email === LANDLORD_EMAIL) {
          setView('dashboard');
        } else {
          // Avoid refetching if we just submitted and have the data
          if (!userApplication) {
            const q = query(collection(db, "applications"), where("userId", "==", authUser.uid));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const appData = querySnapshot.docs[0].data();
              setUserApplication({ id: querySnapshot.docs[0].id, ...appData });
              setView('tenantDashboard');
            } else {
              setView('application');
            }
          } else {
            setView('tenantDashboard');
          }
        }
      } else {
        // Clear state on logout
        setView('login');
        setUserApplication(null);
        setExistingApplication(null);
      }
    });
    return unsubscribe;
  }, [userApplication]); // Run only once on mount

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
  if (view === 'forgotPassword') {
    return <ForgotPasswordScreen setView={setView} />;
  }
  if (view === 'application') {
    return <ApplicationForm handleLogout={handleLogout} existingApplication={existingApplication} setView={setView} setUserApplication={setUserApplication} />;
  }
  if (view === 'dashboard') {
    return <Dashboard handleLogout={handleLogout} />;
  }
  if (view === 'tenantDashboard') {
    return <TenantDashboard handleLogout={handleLogout} userApplication={userApplication} setView={setView} setExistingApplication={setExistingApplication} />;
  }
  
  return <div className="loading-state">Loading...</div>; // Fallback for initial render
};

export default App;