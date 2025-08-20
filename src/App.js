import React, { useState } from 'react';
import './App.css';
import emailjs from '@emailjs/browser';

// Main Application Component
const App = () => {
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  // Handle changes for additional occupants
  const handleOccupantChange = (index, e) => {
    const { name, value } = e.target;
    const list = [...formData.additionalOccupants];
    list[index][name] = value;
    setFormData(prevState => ({
      ...prevState,
      additionalOccupants: list
    }));
  };

  // Add a new occupant row
  const handleAddOccupant = () => {
    setFormData(prevState => ({
      ...prevState,
      additionalOccupants: [...prevState.additionalOccupants, { name: '', relationship: '', dob: '' }]
    }));
  };

  // Handle file uploads
  const handleFileChange = (e) => {
    setUploadedFiles(Array.from(e.target.files));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare files for email attachments
    let fileAttachments = [];
    if (uploadedFiles.length > 0) {
      const filePromises = uploadedFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            resolve({
              name: file.name,
              data: reader.result
            });
          };
        });
      });
      fileAttachments = await Promise.all(filePromises);
    }
    
    // Prepare data for EmailJS
    const templateParams = {
      ...formData,
      additionalOccupants: JSON.stringify(formData.additionalOccupants, null, 2),
      // Format files for a human-readable email body (optional)
      uploaded_files_list: fileAttachments.map(file => file.name).join(', '),
      // This is the key for the attachment in your EmailJS template
      attachments: fileAttachments
    };
    
    try {
      await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams, 'YOUR_PUBLIC_KEY');
      console.log('Application submitted successfully!');
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Failed to send application:', error);
      alert('Failed to submit application. Please try again.');
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
        </div>

        <div className="card-content">
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
                  placeholder="name@example.com"
                  required
                />
                <FormField
                  label="Phone Number"
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 555-5555"
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
                placeholder="Jane Doe"
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
                  placeholder="XXX-XX-XXXX"
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
                placeholder="John Doe"
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
                    placeholder="Name"
                  />
                  <FormField
                    label="Relationship"
                    id={`occupant-relationship-${index}`}
                    name="relationship"
                    value={occupant.relationship}
                    onChange={(e) => handleOccupantChange(index, e)}
                    placeholder="e.g., Son, Sister"
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
                    <ul>
                      {uploadedFiles.map((file, index) => (
                        <li key={index}>{file.name}</li>
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

export default App;