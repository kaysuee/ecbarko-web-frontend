import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import instance from "../../services/ApiEndpoint";
import { SetUser } from "../../redux/AuthSlice";

export default function TCSettings() {
  const user = useSelector((state) => state.Auth.user);
  const dispatch = useDispatch();
  
  // Profile state
  const [name, setName] = useState(user?.name || "");
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Password visibility state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log("File selected:", selectedFile);
    
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("=== Frontend Submit Debug ===");
    console.log("Name:", name);
    console.log("File object:", file);
    console.log("File exists:", !!file);

    try {
      const formData = new FormData();
      formData.append("name", name);
      
      if (file) {
        formData.append("profileImage", file);
        console.log("File appended to FormData");
      }

      // Log FormData contents
      console.log("FormData contents:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const res = await instance.post('/api/ticketclerks/update-profile', formData);

      console.log("Response:", res.data);

      if (res.status === 200) {
        dispatch(SetUser(res.data.user));
        alert("Profile updated successfully!");
        
        // Clear file input and preview
        setFile(null);
        setPreviewImage(null);
        
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      }
    } catch (err) {
      console.error("=== Profile Update Error ===");
      console.error("Error:", err);
      console.error("Error response:", err.response);
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
    return regex.test(password);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!validatePassword(newPassword)) {
      alert("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    
    setPasswordLoading(true);

    try {
      const res = await instance.post('/api/ticketclerks/change-password', {
        currentPassword,
        newPassword
      });

      if (res.status === 200) {
        alert("Password changed successfully!");
        
        // Clear password fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error("=== Password Change Error ===");
      console.error("Error:", err);
      console.error("Error response:", err.response);
      alert(err.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Get current profile image URL
  const getCurrentImageUrl = () => {
    if (previewImage) return previewImage;
    if (user?.profileImage) {
      if (user.profileImage.startsWith('http')) {
        return user.profileImage;
      }
      return `https://ecbarko-back.onrender.com${user.profileImage}`;
    }
    return null;
  };

  return (
    <div className="settings-container" style={{ maxWidth: '100%', margin: '0 auto', padding: '20px', height: '87vh' }}>
      <div className="head-title">
        <div className="left">
          <h1 className="page-title">Settings</h1>
        </div>
      </div>
      
      <div className="edit-page-container">
        <h2 className="section-title">Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          {/* Profile Image Preview */}
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            {getCurrentImageUrl() ? (
              <img
                src={getCurrentImageUrl()}
                alt="Profile Preview"
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #ddd",
                }}
              />
            ) : (
              <div
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  backgroundColor: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "48px",
                  fontWeight: "bold",
                  color: "#666",
                  margin: "0 auto",
                  border: "3px solid #ddd",
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Profile Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            {file && (
              <small style={{ display: "block", marginTop: "5px", color: "#666" }}>
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </small>
            )}
            <small style={{ display: "block", marginTop: "5px", color: "#999" }}>
              Max file size: 5MB. Supported formats: JPG, PNG, GIF
            </small>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`submit-button ${loading ? 'disabled' : ''}`}
          >
            {loading ? "Saving..." : "Save Profile Changes"}
          </button>
        </form>
      </div>

      <div className="edit-page-container" style={{ marginBottom: "30px", marginTop: "30px" }}>
        <h2 className="section-title" style={{ marginBottom: "40px" }}>Change Password</h2>
        <form onSubmit={handlePasswordChange}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Current Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Enter your current password"
                style={{
                  width: "100%",
                  padding: "10px",
                  paddingRight: "40px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
              <i
                className={`fa ${showCurrentPassword ? 'fa-eye' : 'fa-eye-slash'}`}
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#666",
                  fontSize: "16px",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              New Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password (min. 8 chars, uppercase, lowercase, number, special char)"
                style={{
                  width: "100%",
                  padding: "10px",
                  paddingRight: "40px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
              <i
                className={`fa ${showNewPassword ? 'fa-eye' : 'fa-eye-slash'}`}
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#666",
                  fontSize: "16px",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Confirm New Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter new password"
                style={{
                  width: "100%",
                  padding: "10px",
                  paddingRight: "40px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
              <i
                className={`fa ${showConfirmPassword ? 'fa-eye' : 'fa-eye-slash'}`}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#666",
                  fontSize: "16px",
                }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={passwordLoading}
            className={`submit-button ${passwordLoading ? 'disabled' : ''}`}
          >
            {passwordLoading ? "Changing Password..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}