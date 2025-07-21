"use client";

import { useState } from "react";
import {
  Edit,
  Save,
  X,
  AlertCircle,
  Award,
  Plus,
  Calendar,
  ExternalLink,
  Building,
} from "lucide-react";
import type { Certification } from "@/types/api";
import { useEditMode } from "@/contexts/edit-mode-context";

interface EditCertificationsProps {
  memberId: string;
  initialData: {
    certifications: Certification[];
  };
  onCertificationsUpdated: () => void;
}

export function EditCertifications({
  memberId,
  initialData,
  onCertificationsUpdated,
}: EditCertificationsProps) {
  const { isEditMode } = useEditMode();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    certifications: [...initialData.certifications],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [newCert, setNewCert] = useState({
    name: "",
    organization: "",
    issueDate: "",
    expiryDate: "",
    credentialId: "",
    credentialUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Only send changed fields
      const changedFields: any = {};

      // Compare certifications arrays
      const certificationsChanged =
        JSON.stringify(formData.certifications) !==
        JSON.stringify(initialData.certifications);
      if (certificationsChanged) {
        changedFields.certifications = formData.certifications;
      }

      // If no fields were changed, just close the edit mode
      if (Object.keys(changedFields).length === 0) {
        setIsEditing(false);
        return;
      }

      const response = await fetch(`/api/users/${memberId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(changedFields),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Certifications updated successfully!");
        setIsEditing(false);
        onCertificationsUpdated();
        setMessage(null);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to update certifications.",
        });
      }
    } catch (error) {
      console.error("Certifications update failed:", error);
      setMessage({ type: "error", text: "Network error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      certifications: [...initialData.certifications],
    });
    setNewCert({
      name: "",
      organization: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      credentialUrl: "",
    });
    setEditingCertId(null);
    setIsEditing(false);
    setMessage(null);
  };

  const addCertification = () => {
    if (newCert.name && newCert.organization && newCert.issueDate) {
      const certification: Certification = {
        id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newCert.name,
        organization: newCert.organization,
        issueDate: newCert.issueDate,
        expiryDate: newCert.expiryDate || null,
        credentialId: newCert.credentialId || null,
        credentialUrl: newCert.credentialUrl || null,
      };

      setFormData((prev) => ({
        certifications: [...prev.certifications, certification],
      }));

      setNewCert({
        name: "",
        organization: "",
        issueDate: "",
        expiryDate: "",
        credentialId: "",
        credentialUrl: "",
      });
    }
  };

  const removeCertification = (certId: string) => {
    setFormData((prev) => ({
      certifications: prev.certifications.filter((cert) => cert.id !== certId),
    }));
  };

  const updateCertification = (
    certId: string,
    updatedCert: Partial<Certification>
  ) => {
    setFormData((prev) => ({
      certifications: prev.certifications.map((cert) =>
        cert.id === certId ? { ...cert, ...updatedCert } : cert
      ),
    }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      timeZone: "UTC",
    });
  };

  if (!isEditing) {
    return (
      <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Certifications
            </h2>
            {isEditMode && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Edit Certifications"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        <div className="p-6">
          {formData.certifications.length > 0 ? (
            <div className="space-y-4">
              {formData.certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {cert.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Building className="w-4 h-4" />
                          <span>{cert.organization}</span>
                        </div>
                      </div>
                    </div>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 transition-colors"
                        title="View Credential"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Issued {formatDate(cert.issueDate)}</span>
                    </div>
                    {cert.expiryDate && (
                      <span>• Expires {formatDate(cert.expiryDate)}</span>
                    )}
                    {cert.credentialId && (
                      <span>• ID: {cert.credentialId}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No certifications added yet.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Edit Certifications
          </h2>
          <button
            onClick={handleCancel}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
            message.type === "error"
              ? "bg-red-50 dark:bg-red-900/20"
              : "bg-green-50 dark:bg-green-900/20"
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span
              className={`text-sm font-medium ${
                message.type === "error"
                  ? "text-red-800 dark:text-red-200"
                  : "text-green-800 dark:text-green-200"
              }`}
            >
              {message.text}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Add New Certification */}
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Add New Certification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Certification Name *
              </label>
              <input
                type="text"
                value={newCert.name}
                onChange={(e) =>
                  setNewCert({ ...newCert, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., AWS Certified Solutions Architect"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Issuing Organization *
              </label>
              <input
                type="text"
                value={newCert.organization}
                onChange={(e) =>
                  setNewCert({ ...newCert, organization: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Amazon Web Services"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Issue Date *
              </label>
              <input
                type="date"
                value={newCert.issueDate}
                onChange={(e) =>
                  setNewCert({ ...newCert, issueDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                value={newCert.expiryDate}
                onChange={(e) =>
                  setNewCert({ ...newCert, expiryDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Credential ID
              </label>
              <input
                type="text"
                value={newCert.credentialId}
                onChange={(e) =>
                  setNewCert({ ...newCert, credentialId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Credential ID or License Number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Credential URL
              </label>
              <input
                type="url"
                value={newCert.credentialUrl}
                onChange={(e) =>
                  setNewCert({ ...newCert, credentialUrl: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="URL to verify certification"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={addCertification}
            disabled={
              !newCert.name || !newCert.organization || !newCert.issueDate
            }
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Certification
          </button>
        </div>

        {/* Existing Certifications */}
        {formData.certifications.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Current Certifications
            </h3>
            <div className="space-y-3">
              {formData.certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-blue-500" />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {cert.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        by {cert.organization}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCertification(cert.id)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
