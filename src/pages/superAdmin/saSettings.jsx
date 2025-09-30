import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import instance from "../../services/ApiEndpoint"; // Use configured axios instance
import { SetUser } from "../../redux/AuthSlice";

export default function saSettings() {
  const user = useSelector((state) => state.Auth.user);
  const dispatch = useDispatch();
  const [name, setName] = useState(user?.name || "");
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

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

      // Use the configured axios instance
      // It will automatically add authorization token and handle FormData correctly
      const res = await instance.post('/api/users/update-profile', formData);

      console.log("Response:", res.data);

      if (res.status === 200) {
        // Update Redux store with the complete user object
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
    <div className="settings-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Edit Profile</h2>

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
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* Debug Info - Remove after testing */}
      <div style={{ 
        marginTop: "20px",
        padding: "10px",
        backgroundColor: "#f8f9fa",
        borderRadius: "4px",
        fontSize: "12px",
        fontFamily: "monospace"
      }}>
        <strong>Debug Info:</strong>
        <div>User ID: {user?._id}</div>
        <div>Current Image: {user?.profileImage || "None"}</div>
        <div>File Selected: {file ? "Yes" : "No"}</div>
      </div>
    </div>
  );
}