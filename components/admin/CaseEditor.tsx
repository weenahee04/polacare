/**
 * Case Editor Component
 * 
 * Create and edit patient cases with checklist, images, and notes.
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  Send,
  Plus,
  Trash2,
  Upload,
  Search,
  User,
  Eye,
  CheckCircle,
  X,
  AlertCircle
} from 'lucide-react';
import ImageUpload from '../ImageUpload';

interface ChecklistItem {
  id?: string;
  category: string;
  label: string;
  isObserved: boolean;
  isVerified: boolean;
}

interface Patient {
  id: string;
  name: string;
  hn: string;
  phoneNumber: string;
  avatarUrl?: string;
}

interface CaseData {
  id?: string;
  patientId: string;
  diagnosis: string;
  doctorNotes: string;
  aiAnalysisText?: string;
  status: 'Draft' | 'Finalized';
  leftEye?: {
    visualAcuity?: string;
    intraocularPressure?: string;
    diagnosis?: string;
    note?: string;
  };
  rightEye?: {
    visualAcuity?: string;
    intraocularPressure?: string;
    diagnosis?: string;
    note?: string;
  };
  checklistItems: ChecklistItem[];
}

interface CaseEditorProps {
  caseId?: string;
  onBack: () => void;
  onSaved?: () => void;
}

const CaseEditor: React.FC<CaseEditorProps> = ({
  caseId,
  onBack,
  onSaved
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [images, setImages] = useState<any[]>([]);

  const [caseData, setCaseData] = useState<CaseData>({
    patientId: '',
    diagnosis: '',
    doctorNotes: '',
    status: 'Draft',
    checklistItems: []
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

  const isEditing = !!caseId;

  useEffect(() => {
    if (caseId) {
      fetchCase();
    } else {
      fetchDefaultChecklist();
    }
  }, [caseId]);

  const fetchCase = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/cases/${caseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch case');

      const data = await response.json();
      const c = data.case;
      
      setCaseData({
        id: c.id,
        patientId: c.patientId,
        diagnosis: c.diagnosis || '',
        doctorNotes: c.doctorNotes || '',
        aiAnalysisText: c.aiAnalysisText,
        status: c.status,
        leftEye: {
          visualAcuity: c.leftEyeVisualAcuity,
          intraocularPressure: c.leftEyeIntraocularPressure,
          diagnosis: c.leftEyeDiagnosis,
          note: c.leftEyeNote
        },
        rightEye: {
          visualAcuity: c.rightEyeVisualAcuity,
          intraocularPressure: c.rightEyeIntraocularPressure,
          diagnosis: c.rightEyeDiagnosis,
          note: c.rightEyeNote
        },
        checklistItems: c.checklistItems || []
      });

      if (c.patient) {
        setSelectedPatient(c.patient);
      }

      if (c.images) {
        setImages(c.images);
      }
    } catch (error) {
      console.error('Error fetching case:', error);
      showNotification('error', 'Failed to load case');
    } finally {
      setLoading(false);
    }
  };

  const fetchDefaultChecklist = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/cases/checklist/default`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch checklist');

      const data = await response.json();
      setCaseData(prev => ({
        ...prev,
        checklistItems: data.items || []
      }));
    } catch (error) {
      console.error('Error fetching checklist:', error);
    }
  };

  const searchPatients = async (query: string) => {
    if (query.length < 2) {
      setPatients([]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/patients/search?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setPatients(data.patients || []);
    } catch (error) {
      console.error('Error searching patients:', error);
    }
  };

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setCaseData(prev => ({ ...prev, patientId: patient.id }));
    setShowPatientSearch(false);
    setPatientSearch('');
    setPatients([]);
  };

  const updateChecklist = (index: number, field: keyof ChecklistItem, value: any) => {
    setCaseData(prev => ({
      ...prev,
      checklistItems: prev.checklistItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addChecklistItem = () => {
    setCaseData(prev => ({
      ...prev,
      checklistItems: [...prev.checklistItems, {
        category: 'Other',
        label: '',
        isObserved: false,
        isVerified: false
      }]
    }));
  };

  const removeChecklistItem = (index: number) => {
    setCaseData(prev => ({
      ...prev,
      checklistItems: prev.checklistItems.filter((_, i) => i !== index)
    }));
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const saveCase = async (finalize: boolean = false) => {
    if (!selectedPatient) {
      showNotification('error', 'Please select a patient');
      return;
    }

    if (!caseData.diagnosis) {
      showNotification('error', 'Please enter a diagnosis');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      const payload = {
        ...caseData,
        status: finalize ? 'Finalized' : caseData.status
      };

      const url = caseId
        ? `${API_URL}/admin/cases/${caseId}`
        : `${API_URL}/admin/cases`;

      const response = await fetch(url, {
        method: caseId ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to save case');

      const data = await response.json();
      showNotification('success', finalize ? 'Case finalized!' : 'Case saved!');

      if (!caseId && data.case?.id) {
        // Update caseId for image uploads
        setCaseData(prev => ({ ...prev, id: data.case.id }));
      }

      if (finalize) {
        setTimeout(() => onSaved?.(), 1000);
      }
    } catch (error) {
      console.error('Error saving case:', error);
      showNotification('error', 'Failed to save case');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Case' : 'New Case'}
            </h1>
            <p className="text-gray-600">
              {selectedPatient ? `${selectedPatient.name} (${selectedPatient.hn})` : 'Select a patient'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => saveCase(false)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          <button
            onClick={() => saveCase(true)}
            disabled={saving || caseData.status === 'Finalized'}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Finalize
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Selection */}
          {!isEditing && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Patient
              </h2>

              {selectedPatient ? (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                      {selectedPatient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{selectedPatient.name}</p>
                      <p className="text-sm text-gray-600">{selectedPatient.hn} • {selectedPatient.phoneNumber}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPatient(null);
                      setCaseData(prev => ({ ...prev, patientId: '' }));
                    }}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by HN, phone, or name..."
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      searchPatients(e.target.value);
                    }}
                    onFocus={() => setShowPatientSearch(true)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {showPatientSearch && patients.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-10">
                      {patients.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => selectPatient(patient)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-0"
                        >
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-sm text-gray-500">{patient.hn} • {patient.phoneNumber}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Diagnosis */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Diagnosis</h2>
            <input
              type="text"
              placeholder="Primary diagnosis..."
              value={caseData.diagnosis}
              onChange={(e) => setCaseData(prev => ({ ...prev, diagnosis: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <textarea
              placeholder="Doctor's notes..."
              value={caseData.doctorNotes}
              onChange={(e) => setCaseData(prev => ({ ...prev, doctorNotes: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Eye Examination */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Eye Examination
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Eye */}
              <div className="space-y-3">
                <h3 className="font-medium text-blue-600">Left Eye (OS)</h3>
                <input
                  type="text"
                  placeholder="Visual Acuity"
                  value={caseData.leftEye?.visualAcuity || ''}
                  onChange={(e) => setCaseData(prev => ({
                    ...prev,
                    leftEye: { ...prev.leftEye, visualAcuity: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="IOP (mmHg)"
                  value={caseData.leftEye?.intraocularPressure || ''}
                  onChange={(e) => setCaseData(prev => ({
                    ...prev,
                    leftEye: { ...prev.leftEye, intraocularPressure: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Diagnosis"
                  value={caseData.leftEye?.diagnosis || ''}
                  onChange={(e) => setCaseData(prev => ({
                    ...prev,
                    leftEye: { ...prev.leftEye, diagnosis: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Right Eye */}
              <div className="space-y-3">
                <h3 className="font-medium text-green-600">Right Eye (OD)</h3>
                <input
                  type="text"
                  placeholder="Visual Acuity"
                  value={caseData.rightEye?.visualAcuity || ''}
                  onChange={(e) => setCaseData(prev => ({
                    ...prev,
                    rightEye: { ...prev.rightEye, visualAcuity: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="IOP (mmHg)"
                  value={caseData.rightEye?.intraocularPressure || ''}
                  onChange={(e) => setCaseData(prev => ({
                    ...prev,
                    rightEye: { ...prev.rightEye, intraocularPressure: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Diagnosis"
                  value={caseData.rightEye?.diagnosis || ''}
                  onChange={(e) => setCaseData(prev => ({
                    ...prev,
                    rightEye: { ...prev.rightEye, diagnosis: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Examination Checklist</h2>
              <button
                onClick={addChecklistItem}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {caseData.checklistItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <input
                    type="text"
                    placeholder="Category"
                    value={item.category}
                    onChange={(e) => updateChecklist(index, 'category', e.target.value)}
                    className="w-32 px-3 py-1 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Label"
                    value={item.label}
                    onChange={(e) => updateChecklist(index, 'label', e.target.value)}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.isObserved}
                      onChange={(e) => updateChecklist(index, 'isObserved', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    Observed
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.isVerified}
                      onChange={(e) => updateChecklist(index, 'isVerified', e.target.checked)}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    Verified
                  </label>
                  <button
                    onClick={() => removeChecklistItem(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Status</h2>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              caseData.status === 'Finalized'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {caseData.status === 'Finalized' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {caseData.status}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Images</h2>
              {caseData.id && (
                <button
                  onClick={() => setShowImageUpload(!showImageUpload)}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </button>
              )}
            </div>

            {!caseData.id ? (
              <p className="text-sm text-gray-500">Save the case first to upload images</p>
            ) : showImageUpload ? (
              <ImageUpload
                caseId={caseData.id}
                onUploadComplete={(image) => {
                  setImages(prev => [...prev, image]);
                  setShowImageUpload(false);
                }}
                onError={(error) => showNotification('error', error)}
              />
            ) : images.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {images.map((image) => (
                  <div key={image.id} className="relative">
                    <img
                      src={`${API_URL}/images/${image.id}/proxy?thumbnail=true`}
                      alt=""
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No images uploaded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseEditor;

