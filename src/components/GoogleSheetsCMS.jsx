
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useDropzone } from 'react-dropzone';


// ------------------------------------------

const MODEL_BASE_URL = "https://cdn.jsdelivr.net/gh/ArhamMobarat/portfolio-3d-models@main/";

function ImageUpload({ label, value, onChange, projectId }) {
  const [imagePreview, setImagePreview] = useState(value || "");
  useEffect(() => {
    setImagePreview(value || "");
  }, [value]);

  const [uploading, setUploading] = useState(false);

 const onDrop = async (acceptedFiles) => {
  const file = acceptedFiles[0];
  if (!file) return;

  try {
    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
      });

    const base64 = await toBase64(file);
    const API_URL = "https://portfolio-backend-servercode2.onrender.com"
    const res = await fetch(`${API_URL}/upload-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: `${Date.now()}-${file.name}`,
        fileBase64: base64,
        projectId,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.url) {
      throw new Error("Upload failed");
    }

    // ✅ ONLY HERE do we update state
    onChange(data.url);

  } catch (err) {
    console.error("Image upload error:", err);
    alert("Image upload failed. Check console.");
  }
};


  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop,
  });

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="md:col-span-2">
      <label className="block text-sm font-semibold text-gray-300 mb-2">
        {label}
      </label>

      <div
        {...getRootProps()}
        className="border-2 border-dashed border-cyan-500 rounded-lg p-6 text-center cursor-pointer hover:border-cyan-400 transition-colors"
      >
        <input {...getInputProps()} />

        {uploading ? (
          <p className="text-cyan-400">Uploading image...</p>
        ) : (
          <p className="text-gray-400">
            Drag & drop image here or click to upload
          </p>
        )}
      </div>

      {imagePreview && (
        <img
          src={imagePreview}
          alt="Uploaded preview"
          className="mt-4 w-full max-w-md rounded-lg border border-slate-600"
        />
      )}
    </div>
  );
}





// -------------------------------------------------

export default function GoogleSheetsCMS() {

  const [isAuthed, setIsAuthed] = useState(
    localStorage.getItem('admin-auth') === 'true'
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const API_BASE = "https://portfolio-backend-servercode2.onrender.com";

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    id: Date.now().toString(),
    category: '3d-modeling',
    title: '',
    subtitle: '',
    description: '',
    image: '',
    fullDescription: '',
    details: '',
    videoUrl: '',
    modelUrl: '',

    // NEW
    img1: '', p1: '',
    img2: '', p2: '',
    img3: '', p3: '',
    img4: '', p4: '',
    img5: '', p5: '',


    code1: '',
    code1Lang: 'javascript',
    code2: '',
    code2Lang: 'javascript',
  });

  // === CONFIG ===
  // const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbw3lIuhQML1XFB48_NsSGcr6PPY0f6dfJwCtmIzXPi0WSDv4HP7sxgoHjJZK7O1PTWh/exec';  
          // e.g. https://script.google.com/macros/s/XXXX/exec
          //        // same as API_KEY in Apps Script
  // For safety: you can inject these via env vars (Vite/Next) and not commit them.

  // === HELPERS ===

  
const callApi = async (action, data) => {
  const res = await fetch(`${API_BASE}/sheets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-auth': 'true',
    },
    body: JSON.stringify({ action, data }),
  });

  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'API error');
  return json;
};



  // const listApi = async () => {
  //   const url = `${WEB_APP_URL}?apiKey=${encodeURIComponent(API_KEY)}`;
  //   const res = await fetch(url, { method: 'GET' });
  //   const json = await res.json();
  //   if (!json.ok) throw new Error(json.error || 'API error');
  //   return json.rows || [];
  // };
  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await callApi('list', {});
      setProjects(res.rows || []);
    } catch {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => { loadProjects(); }, []);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      id: Date.now().toString(),
      category: '3d-modeling',
      title: '',
      subtitle: '',
      description: '',
      image: '',
      fullDescription: '',
      details: '',
      videoUrl: '',
      modelUrl: '',

      img1: '', p1: '',
      img2: '', p2: '',
      img3: '', p3: '',
      img4: '', p4: '',
      img5: '', p5: '',

      code1: '',
      code1Lang: 'javascript',
      code2: '',
      code2Lang: 'javascript',
    });
    setEditingId(null);
    setShowAddForm(false);
  };


  const handleToggleForm = () => {
    if (showAddForm) {
      // Closing the form → reset everything
      resetForm();
    } else {
      // Opening the form → just show it
      setShowAddForm(true);
    }
  };



  const handleEdit = (project) => {
    setFormData({
      ...project,
      modelUrl: project.modelUrl?.startsWith(MODEL_BASE_URL)
        ? project.modelUrl.replace(MODEL_BASE_URL, "")
        : "",
      details: Array.isArray(project.details)
        ? project.details.join('; ')
        : project.details
    });

    setEditingId(project.id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    setSaving(true);
    setError('');
    try {
      await callApi('delete', { id });
      setProjects(prev => prev.filter(p => p.id !== id));
      setSuccess('Project deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete project');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (!formData.title || !formData.category) {
        setError('Title and Category are required');
        setSaving(false);
        return;
      }

      const fullModelUrl =
  formData.modelUrl.trim() !== ""
    ? MODEL_BASE_URL + formData.modelUrl.trim()
    : "";

const payload = {
  ...formData,
  id: editingId || formData.id || Date.now().toString(),
  modelUrl: fullModelUrl,
  details: typeof formData.details === 'string'
    ? formData.details
    : (formData.details ?? '')
};


      if (editingId) {
        await callApi('update', payload);
        setProjects(prev => prev.map(p => (p.id === editingId ? payload : p)));
        setSuccess('Project updated successfully!');
      } else {
        await callApi('create', payload);
        setProjects(prev => [...prev, payload]);
        setSuccess('Project added successfully!');
      }

      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save project');
    }
     finally {
      setSaving(false);
    }
  };
  // console.log('LIST RESPONSE:', data);

// ----------------------------
  if (!isAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="bg-slate-800 p-6 rounded-xl w-96">
          <h2 className="text-xl font-bold mb-4 text-cyan-400">Admin Login</h2>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                const res = await fetch(`${API_BASE}/login`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ password }),
                });

                if (res.ok) {
                  localStorage.setItem("admin-auth", "true");
                  setIsAuthed(true);
                } else {
                  alert("Wrong password");
                }
              }
            }}
            className="w-full mb-3 px-4 py-2 rounded bg-slate-900 border border-slate-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-sm text-cyan-400 hover:underline mb-4"
          >
            {showPassword ? "Hide password" : "Show password"}
          </button>



            
        </div>
      </div>
    );
  }

// ---------------------------
  // ---- UI (unchanged styling) ----
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/98 backdrop-blur-lg border-b border-slate-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Projects CMS
            </h1>
            <button
              onClick={() => {
                handleToggleForm();
              }}

              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:scale-105"
            >
              {showAddForm ? <X size={18} /> : <Plus size={18} />}
              {showAddForm ? 'Cancel' : 'Add Project'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-400" size={20} />
            <p className="text-red-400">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-green-400" size={20} />
            <p className="text-green-400">{success}</p>
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div key={editingId || "new"} className="mb-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-cyan-500/30 p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">
              {editingId ? 'Edit Project' : 'Add New Project'}
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="3d-modeling">3D Modeling</option>
                    <option value="electronics">Electronics</option>
                    <option value="documentation">Documentation</option>
                    <option value="website">Website</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="Enter project title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="Enter subtitle"
                  />
                </div>
                <div className="md:col-span-2">
                  <ImageUpload
                    label="Main Image"
                    value={formData.image}
                    projectId={formData.id}
                    onChange={(url) =>
                      setFormData((prev) => ({ ...prev, image: url }))
                    }
                  />

                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Short Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                    placeholder="Brief description for the card"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Full Description
                  </label>
                  <textarea
                    name="fullDescription"
                    value={formData.fullDescription}
                    onChange={handleInputChange}
                    rows="5"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                    placeholder="Detailed description shown in expanded view"
                  />
                </div>
                {/* ------------------------------------------------------------ */}
                <ImageUpload
                  label="Image 1 URL"
                  value={formData.img1}
                  projectId={formData.id}
                  onChange={(url) =>
                    setFormData((prev) => ({ ...prev, img1: url }))
                  }
                />



                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Paragraph 1
                  </label>
                  <textarea
                    name="p1"
                    value={formData.p1}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg resize-none"
                    placeholder="Text shown below Image 1"
                  />
                </div>



                {/* -------------------------------------------------------------------- */}
                  {/* ------------------------------------------------------------ */}
                <ImageUpload
                  label="Image 2 URL"
                  value={formData.img2}
                  projectId={formData.id}
                  onChange={(url) =>
                    setFormData((prev) => ({ ...prev, img2: url }))
                  }
                />


                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Paragraph 2
                  </label>
                  <textarea
                    name="p2"
                    value={formData.p2}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg resize-none"
                    placeholder="Text shown below Image 2"
                  />
                </div>



                {/* -------------------------------------------------------------------- */}
                  {/* ------------------------------------------------------------ */}
               <ImageUpload
                  label="Image 3 URL"
                  value={formData.img3}
                  projectId={formData.id}
                  onChange={(url) =>
                    setFormData((prev) => ({ ...prev, img3: url }))
                  }
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Paragraph 3
                  </label>
                  <textarea
                    name="p3"
                    value={formData.p3}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg resize-none"
                    placeholder="Text shown below Image 3"
                  />
                </div>



                {/* -------------------------------------------------------------------- */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Code Block 1
                  </label>

                  <textarea
                    name="code1"
                    value={formData.code1}
                    onChange={handleInputChange}
                    rows={12}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg font-mono text-sm text-gray-200 resize-y"
                    placeholder={`Paste code here...\nPreserves spacing & indentation`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Code Language
                  </label>

                  <select
                    name="code1Lang"
                    value={formData.code1Lang}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="bash">Bash</option>
                    <option value="json">JSON</option>
                  </select>
                </div>

                  {/* ------------------------------------------------------------ */}
                <ImageUpload
                  label="Image 4 URL"
                  value={formData.img4}
                  projectId={formData.id}
                  onChange={(url) =>
                    setFormData((prev) => ({ ...prev, img4: url }))
                  }
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Paragraph 4
                  </label>
                  <textarea
                    name="p4"
                    value={formData.p4}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg resize-none"
                    placeholder="Text shown below Image 4"
                  />
                </div>



                {/* -------------------------------------------------------------------- */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Code Block 2
                  </label>

                  <textarea
                    name="code2"
                    value={formData.code2}
                    onChange={handleInputChange}
                    rows={12}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg font-mono text-sm text-gray-200 resize-y"
                    placeholder={`Paste code here...\nPreserves spacing & indentation`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Code Language
                  </label>

                  <select
                    name="code2Lang"
                    value={formData.code2Lang}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="bash">Bash</option>
                    <option value="json">JSON</option>
                  </select>
                </div>

                  {/* ------------------------------------------------------------ */}
                <ImageUpload
                  label="Image 5 URL"
                  value={formData.img5}
                  projectId={formData.id}
                  onChange={(url) =>
                    setFormData((prev) => ({ ...prev, img5: url }))
                  }
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Paragraph 5
                  </label>
                  <textarea
                    name="p5"
                    value={formData.p5}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg resize-none"
                    placeholder="Text shown below Image 5"
                  />
                </div>



                {/* -------------------------------------------------------------------- */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Details (separate with semicolons)
                  </label>
                  <textarea
                    name="details"
                    value={formData.details}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                    placeholder="Detail 1; Detail 2; Detail 3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Video URL (YouTube or MP4)
                  </label>
                  <input
                    type="url"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                <div>
                  {/* <label className="block text-sm font-semibold text-gray-300 mb-2">
                    3D Model URL (.glb or .gltf)
                  </label> */}
                  <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    3D Model URL (.glb or .gltf)
                  </label>

                  <div className="flex rounded-lg overflow-hidden border border-slate-600 bg-slate-900/50 focus-within:border-cyan-500">
                    {/* Fixed prefix */}
                    <span
                      className="px-3 py-3 text-gray-400 text-sm bg-slate-800 border-r border-slate-600 whitespace-nowrap"
                      title={MODEL_BASE_URL}
                    >
                      {MODEL_BASE_URL}
                    </span>

                    {/* Editable suffix */}
                    <input
                      type="text"
                      name="modelUrl"
                      value={formData.modelUrl}
                      onChange={handleInputChange}
                      className="flex-1 px-4 py-3 bg-transparent text-white focus:outline-none"
                      placeholder="model-name.glb"
                    />
                  </div>
                </div>

                  {/* <input
                    type="url"
                    name="modelUrl"
                    value={formData.modelUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="https://example.com/model.glb"
                  /> */}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {saving ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {editingId ? 'Update Project' : 'Add Project'}
                    </>
                  )}
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Projects List */}
        {loading ? (
          <div className="text-center py-20">
            <Loader className="animate-spin mx-auto mb-4 text-cyan-400" size={48} />
            <p className="text-gray-400">Loading projects...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">
              Existing Projects ({projects.length})
            </h2>

            {projects.length === 0 ? (
              <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700">
                <p className="text-gray-400 text-xl">No projects yet. Add your first project!</p>
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-full text-xs font-semibold text-cyan-400">
                          {project.category}
                        </span>
                        <h3 className="text-xl font-bold text-white">{project.title}</h3>
                      </div>
                      {project.subtitle && (
                        <p className="text-cyan-400 font-semibold mb-2">{project.subtitle}</p>
                      )}
                      <p className="text-gray-400 mb-3">{project.description}</p>
                      {project.image && (
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full max-w-md h-48 object-cover rounded-lg border border-slate-600 mb-3"
                        />
                      )}
                      <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                        {project.videoUrl && (
                          <span className="flex items-center gap-1">🎥 Video included</span>
                        )}
                        {project.modelUrl && (
                          <span className="flex items-center gap-1">🎨 3D Model included</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} className="text-cyan-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        disabled={saving}
                        className="p-3 bg-slate-700 hover:bg-red-600/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 size={18} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </main>
    </div>
  );
}
