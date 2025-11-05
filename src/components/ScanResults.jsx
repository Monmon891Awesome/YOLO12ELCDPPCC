import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, Download, Share2, Eye } from 'lucide-react';
import './ScanResults.css';

const ScanResults = ({ scanData }) => {
  const [showAnnotations, setShowAnnotations] = useState(true);

  if (!scanData || !scanData.results) {
    return null;
  }

  const { results, metadata, uploadTime, scanId } = scanData;
  const { detected, confidence, riskLevel, detections } = results;

  const getRiskColor = (level) => {
    switch (level) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#ffc107';
      default:
        return '#4caf50';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'high':
      case 'medium':
        return <AlertTriangle color={getRiskColor(level)} size={32} />;
      case 'low':
        return <Info color={getRiskColor(level)} size={32} />;
      default:
        return <CheckCircle color={getRiskColor(level)} size={32} />;
    }
  };

  const handleDownloadReport = () => {
    // Create a downloadable report
    const reportData = {
      scanId,
      uploadTime,
      detected,
      confidence,
      riskLevel,
      detections,
      metadata
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-report-${scanId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="scan-results-container">
      {/* Header */}
      <div className="results-header">
        <h2>Scan Analysis Results</h2>
        <div className="results-actions">
          <button className="action-button" onClick={handleDownloadReport} type="button">
            <Download size={18} />
            Download Report
          </button>
          <button className="action-button" type="button">
            <Share2 size={18} />
            Share with Doctor
          </button>
        </div>
      </div>

      {/* Overall Assessment */}
      <div className="overall-assessment" style={{ borderColor: getRiskColor(riskLevel) }}>
        <div className="assessment-icon">
          {getRiskIcon(riskLevel)}
        </div>
        <div className="assessment-content">
          <h3>Overall Assessment</h3>
          <p className="assessment-status">
            {detected ? 'Potential abnormality detected' : 'No significant abnormalities detected'}
          </p>
          <div className="assessment-details">
            <div className="detail-item">
              <span className="detail-label">Risk Level:</span>
              <span className="detail-value" style={{ color: getRiskColor(riskLevel) }}>
                {riskLevel.toUpperCase()}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Confidence:</span>
              <span className="detail-value">{(confidence * 100).toFixed(1)}%</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Scan ID:</span>
              <span className="detail-value">{scanId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Image Visualization */}
      {results.imageUrl && (
        <div className="image-visualization">
          <div className="visualization-header">
            <h3>CT Scan Image</h3>
            <div className="image-toggle">
              <button
                className={`toggle-button ${showAnnotations ? 'active' : ''}`}
                onClick={() => setShowAnnotations(true)}
                type="button"
              >
                <Eye size={16} />
                With Annotations
              </button>
              <button
                className={`toggle-button ${!showAnnotations ? 'active' : ''}`}
                onClick={() => setShowAnnotations(false)}
                type="button"
              >
                Original
              </button>
            </div>
          </div>
          <div className="scan-image-container">
            <img
              src={showAnnotations && results.annotatedImageUrl ? results.annotatedImageUrl : results.imageUrl}
              alt="CT Scan"
              className="scan-image"
            />
          </div>
        </div>
      )}

      {/* Detections List */}
      {detected && detections && detections.length > 0 && (
        <div className="detections-section">
          <h3>Detected Findings ({detections.length})</h3>
          <div className="detections-list">
            {detections.map((detection, index) => (
              <div key={index} className="detection-card">
                <div className="detection-header">
                  <span className="detection-class">{detection.class}</span>
                  <span className="detection-confidence">
                    {(detection.confidence * 100).toFixed(1)}% confidence
                  </span>
                </div>
                {detection.characteristics && (
                  <div className="detection-characteristics">
                    {detection.characteristics.size_mm && (
                      <div className="characteristic">
                        <span className="char-label">Size:</span>
                        <span className="char-value">{detection.characteristics.size_mm} mm</span>
                      </div>
                    )}
                    {detection.characteristics.shape && (
                      <div className="characteristic">
                        <span className="char-label">Shape:</span>
                        <span className="char-value">{detection.characteristics.shape}</span>
                      </div>
                    )}
                    {detection.characteristics.density && (
                      <div className="characteristic">
                        <span className="char-label">Density:</span>
                        <span className="char-value">{detection.characteristics.density}</span>
                      </div>
                    )}
                  </div>
                )}
                {detection.boundingBox && (
                  <div className="detection-location">
                    <span className="location-label">Location:</span>
                    <span className="location-value">
                      X: {Math.round(detection.boundingBox.x)},
                      Y: {Math.round(detection.boundingBox.y)},
                      W: {Math.round(detection.boundingBox.width)},
                      H: {Math.round(detection.boundingBox.height)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      {metadata && (
        <div className="metadata-section">
          <h3>Scan Metadata</h3>
          <div className="metadata-grid">
            {metadata.imageSize && (
              <div className="metadata-item">
                <span className="meta-label">Image Size:</span>
                <span className="meta-value">
                  {metadata.imageSize.width} x {metadata.imageSize.height}
                </span>
              </div>
            )}
            {metadata.fileSize && (
              <div className="metadata-item">
                <span className="meta-label">File Size:</span>
                <span className="meta-value">
                  {(metadata.fileSize / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}
            {metadata.format && (
              <div className="metadata-item">
                <span className="meta-label">Format:</span>
                <span className="meta-value">{metadata.format}</span>
              </div>
            )}
            {uploadTime && (
              <div className="metadata-item">
                <span className="meta-label">Upload Time:</span>
                <span className="meta-value">
                  {new Date(uploadTime).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="results-disclaimer">
        <Info size={18} />
        <p>
          <strong>Important:</strong> These results are generated by an AI model and should not be
          used as the sole basis for medical decisions. Please consult with a qualified healthcare
          professional for proper diagnosis and treatment recommendations.
        </p>
      </div>
    </div>
  );
};

export default ScanResults;
