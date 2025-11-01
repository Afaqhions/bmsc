import React, { useState } from 'react';
import { FaPrint, FaMapMarkerAlt, FaClock, FaTable, FaStream, FaFileDownload, FaSpinner } from 'react-icons/fa';
import pptxgen from 'pptxgenjs';
import { saveAs } from 'file-saver';

const CampaignReport = ({ campaign, images }) => {
  const [viewMode, setViewMode] = useState('timeline');
  const [generating, setGenerating] = useState(false);

  const generatePPT = async () => {
    try {
      setGenerating(true);

      // Create new presentation
      const pptx = new pptxgen();

      // Add title slide with enhanced design
      const slide1 = pptx.addSlide();

      // Add background gradient
      slide1.addShape(pptx.ShapeType.rectangle, {
        x: 0,
        y: 0,
        w: '100%',
        h: '100%',
        fill: {
          type: 'gradient',
          color1: 'FFFFFF',
          color2: 'F0F4F8',
          angle: 135
        }
      });

      // Add decorative accent bar
      slide1.addShape(pptx.ShapeType.rectangle, {
        x: 0,
        y: 0,
        w: 0.3,
        h: '100%',
        fill: {
          type: 'gradient',
          color1: '1E40AF',
          color2: '3B82F6'
        }
      });

      // Add campaign name with shadow
      slide1.addText(campaign.name, {
        x: 1,
        y: 0.8,
        w: '80%',
        fontSize: 48,
        bold: true,
        color: '1F2937',
        align: 'left',
        shadow: {
          type: 'outer',
          color: '000000',
          opacity: 0.2,
          blur: 3,
          offset: 2
        }
      });

      // Add subtitle
      slide1.addText('Campaign Report', {
        x: 1,
        y: 1.8,
        w: '80%',
        fontSize: 28,
        color: '4B5563',
        align: 'left'
      });

      // Add campaign details with icons
      slide1.addText([
        { text: '📅 ', options: { fontSize: 16 } },
        { text: 'Generated: ', options: { bold: true, fontSize: 14, color: '4B5563' } },
        { text: `${new Date().toLocaleDateString()}\n\n`, options: { fontSize: 14, color: '374151' } },
        
        { text: '👤 ', options: { fontSize: 16 } },
        { text: 'Client: ', options: { bold: true, fontSize: 14, color: '4B5563' } },
        { text: `${campaign.clientEmail}\n\n`, options: { fontSize: 14, color: '374151' } },
        
        { text: '⏱️ ', options: { fontSize: 16 } },
        { text: 'Duration: ', options: { bold: true, fontSize: 14, color: '4B5563' } },
        { text: `${new Date(campaign.startDate).toLocaleDateString()} - ${new Date(campaign.endDate).toLocaleDateString()}\n\n`, options: { fontSize: 14, color: '374151' } },
        
        { text: '🎯 ', options: { fontSize: 16 } },
        { text: 'Number of Boards: ', options: { bold: true, fontSize: 14, color: '4B5563' } },
        { text: `${campaign.noOfBoards}`, options: { fontSize: 14, color: '374151' } }
      ], {
        x: 1,
        y: 2.8,
        w: '80%',
        lineSpacing: 16,
        shadow: {
          type: 'outer',
          color: '000000',
          opacity: 0.1,
          blur: 1,
          offset: 1
        }
      });

      // Function to convert image URL to base64
      const getImageBase64 = async (url) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      };

      // Add image slides with optimized layout
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const slide = pptx.addSlide();

        try {
          const imageData = await getImageBase64(image.imageUrl);
          
          // Calculate optimal image dimensions while maintaining aspect ratio
          const maxWidth = 5.5;  // Max width in inches
          const maxHeight = 6.5; // Max height in inches
          const padding = 0.5;   // Padding from edges
          
          // Add a subtle background rectangle for the whole slide
          slide.addShape(pptx.ShapeType.rectangle, {
            x: 0,
            y: 0,
            w: '100%',
            h: '100%',
            fill: { color: 'FFFFFF' },
            line: { color: 'FFFFFF', width: 0 }
          });

          // Add image with shadow effect
          slide.addImage({
            data: imageData,
            x: padding,
            y: padding,
            w: maxWidth,
            h: maxHeight,
            sizing: {
              type: 'contain',
              w: maxWidth,
              h: maxHeight
            },
            shadow: {
              type: 'outer',
              color: '000000',
              opacity: 0.25,
              blur: 3,
              offset: 3
            }
          });

          // Add gradient details panel on the right side
          slide.addShape(pptx.ShapeType.rectangle, {
            x: maxWidth + (padding * 2),
            y: padding,
            w: 3.5,
            h: maxHeight,
            fill: {
              type: 'gradient',
              color1: 'F8F9FA',
              color2: 'F0F2F5',
              angle: 45
            },
            line: { color: 'E0E0E0', width: 1 },
            shadow: {
              type: 'outer',
              color: '000000',
              opacity: 0.1,
              blur: 2,
              offset: 1
            }
          });

          // Add slide number
          slide.addText(`Image ${i + 1} of ${images.length}`, {
            x: 0.5,
            y: 7,
            fontSize: 10,
            color: '666666',
            italic: true
          });

          // Calculate text position based on image dimensions
          const textX = maxWidth + (padding * 2.4);
          const textY = padding + 0.2;

          // Add image details with enhanced formatting
          slide.addText([
            { text: 'Image Details\n', options: { 
              bold: true, 
              fontSize: 20, 
              color: '1F2937',
              underline: { color: '4B5563', style: 'single' }
            }},
            { text: '\nLocation\n', options: { 
              bold: true, 
              fontSize: 14,
              color: '4B5563'
            }},
            { text: `${image.location || image.liveLocation || 'N/A'}\n\n`, options: {
              color: '374151'
            }},
            { text: 'Uploaded By\n', options: { 
              bold: true,
              fontSize: 14,
              color: '4B5563'
            }},
            { text: `${image.uploadedBy || image.serviceManEmail}\n\n`, options: {
              color: '374151'
            }},
            { text: 'Date & Time\n', options: { 
              bold: true,
              fontSize: 14,
              color: '4B5563'
            }},
            { text: `${new Date(image.createdAt || image.dateTime).toLocaleString()}\n\n`, options: {
              color: '374151'
            }},
            { text: 'City\n', options: { 
              bold: true,
              fontSize: 14,
              color: '4B5563'
            }},
            { text: `${image.city || 'N/A'}\n\n`, options: {
              color: '374151'
            }},
            { text: 'Role\n', options: { 
              bold: true,
              fontSize: 14,
              color: '4B5563'
            }},
            { text: `${image.role || 'serviceman'}`, options: {
              color: '374151'
            }}
          ], {
            x: textX,
            y: textY,
            w: 3.1,
            align: 'left',
            fontSize: 12,
            lineSpacing: 16,
            shadow: {
              type: 'outer',
              color: '000000',
              opacity: 0.1,
              blur: 1,
              offset: 1
            }
          });
        } catch (error) {
          console.error('Error processing image:', error);
          // Add error slide instead
          slide.addText('Error loading image', {
            x: 0.5,
            y: 2.5,
            fontSize: 24,
            color: 'FF0000'
          });
        }
      }

      // Save the presentation
      const fileName = `${campaign.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.pptx`;
      await pptx.writeFile({ fileName });
      setGenerating(false);
    } catch (error) {
      console.error('Error generating report:', error);
      setGenerating(false);
      alert('Error generating report. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 bg-gray-50">
      {/* Report Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Campaign Report</h1>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 rounded ${
                  viewMode === 'timeline'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                <FaStream className="inline mr-2" /> Timeline
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                <FaTable className="inline mr-2" /> Grid
              </button>
            </div>
            <button
              onClick={handlePrint}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors print:hidden"
            >
              <FaPrint className="inline mr-2" /> Print Report
            </button>
            <button
              onClick={generatePPT}
              disabled={generating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50 print:hidden"
            >
              {generating ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Generating PPT...
                </>
              ) : (
                <>
                  <FaFileDownload />
                  Export to PPT
                </>
              )}
            </button>
          </div>
        </div>

        {/* Campaign Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Campaign Details</h2>
            <div className="space-y-3">
              <p><strong>Name:</strong> {campaign.name}</p>
              <p><strong>Client:</strong> {campaign.clientEmail}</p>
              <p><strong>Duration:</strong> {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</p>
              <p><strong>City:</strong> {campaign.city}</p>
              <p><strong>Number of Boards:</strong> {campaign.noOfBoards}</p>
              <p>
                <strong>Service Personnel:</strong><br />
                {Array.isArray(campaign.serviceManEmail) 
                  ? campaign.serviceManEmail.map(email => (
                      <span key={email} className="inline-block bg-gray-100 px-2 py-1 rounded mr-2 mb-2">
                        {email}
                      </span>
                    ))
                  : campaign.serviceManEmail}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Image Statistics</h2>
            <div className="space-y-3">
              <p><strong>Total Images:</strong> {images.length}</p>
              <p>
                <strong>Coverage:</strong> {
                  Math.round((images.length / campaign.noOfBoards) * 100)
                }%
              </p>
              <p><strong>First Upload:</strong> {
                images.length > 0 
                  ? formatDate(images[0].timestamp || images[0].createdAt || images[0].dateTime)
                  : 'N/A'
              }</p>
              <p><strong>Latest Upload:</strong> {
                images.length > 0
                  ? formatDate(images[images.length - 1].timestamp || images[images.length - 1].createdAt || images[images.length - 1].dateTime)
                  : 'N/A'
              }</p>
            </div>
          </div>
        </div>
      </div>

      {/* Images Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Campaign Images</h2>
        {viewMode === 'timeline' ? (
          <div className="space-y-4">
            {images.map((image, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm flex gap-4">
                <div className="w-48 h-48 flex-shrink-0">
                  <img
                    src={image.imageUrl || image.url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-medium">Upload #{index + 1}</p>
                      <p className="text-gray-500 flex items-center gap-2">
                        <FaClock className="inline" /> 
                        {formatDate(image.timestamp || image.createdAt || image.dateTime)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-gray-400" />
                      {image.location || image.liveLocation || 'Location not specified'}
                    </p>
                    {image.latitude && image.longitude && (
                      <p className="text-sm text-gray-500">
                        Coordinates: {image.latitude}, {image.longitude}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      Uploaded by: {image.uploadedBy || image.serviceManEmail || 'Unknown'}
                    </p>
                    {image.city && (
                      <p className="text-sm text-gray-600">
                        City: {image.city}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm">
                <div className="aspect-w-4 aspect-h-3">
                  <img
                    src={image.imageUrl || image.url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium">
                    {formatDate(image.timestamp || image.createdAt || image.dateTime)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {image.location || image.liveLocation || 'Location not specified'}
                  </p>
                  <p className="text-sm text-gray-500">
                    By: {image.uploadedBy || image.serviceManEmail || 'Unknown'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .print\\:hidden {
              display: none !important;
            }
            .shadow-sm {
              box-shadow: none !important;
            }
            .bg-gray-50 {
              background-color: white !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default CampaignReport;