<<<<<<< HEAD

import React, { useState, useEffect } from 'react';
import {
  FaMapMarkerAlt,
  FaClock,
  FaFileDownload,
  FaSpinner,
  FaStream,
  FaTable,
  FaPrint,
} from 'react-icons/fa';
import pptxgen from 'pptxgenjs';
import LoadingSpinner from './LoadingSpinner';

const CampaignReport = ({ campaign, images }) => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
=======
import React, { useState } from 'react';
import { FaPrint, FaMapMarkerAlt, FaClock, FaTable, FaStream, FaFileDownload, FaSpinner } from 'react-icons/fa';
import pptxgen from 'pptxgenjs';
import { saveAs } from 'file-saver';

const CampaignReport = ({ campaign, images }) => {
  const [viewMode, setViewMode] = useState('timeline');
  const [generating, setGenerating] = useState(false);
>>>>>>> 11e19a4acdff04d816646f712fad3e9cd2222306

  useEffect(() => {
    if (!images || images.length === 0) {
      setImagesLoaded(true);
      return;
    }

    let loadedCount = 0;
    const totalImages = images.length;
    const errors = [];

    const preloadImage = (url, index) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
            setImageLoadErrors(errors);
          }
          resolve(true);
        };
        img.onerror = () => {
          loadedCount++;
          errors.push(index);
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
            setImageLoadErrors(errors);
          }
          resolve(false);
        };
        img.src = url;
      });
    };

    Promise.all(images.map((img, index) => preloadImage(img.imageUrl || img.url, index)));
  }, [images]);

  // ✅ Fixed and fully working generatePPT function
  const generatePPT = async () => {
    try {
      setGenerating(true);
      setError(null);
      setProgress({ current: 0, total: images?.length || 0 });

      if (!campaign || !images) throw new Error('Campaign or images data is missing');
      if (images.length === 0) throw new Error('No images available for this campaign');

      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_16x9';
      pptx.author = 'Campaign Report Generator';
      pptx.title = `Campaign Report - ${campaign.name}`;

      // === Title Slide ===
      const slide1 = pptx.addSlide();
      slide1.background = { color: '#F0F4F8' };

      // Accent bar
      slide1.addShape('rect', {
        x: 0,
        y: 0,
        w: '5%',
        h: '100%',
        fill: { color: '#1E40AF' },
      });

      // Title
      slide1.addText(campaign.name, {
        x: 1,
        y: 0.8,
        w: '80%',
        fontSize: 48,
        bold: true,
        color: '#1F2937',
      });

      // Subtitle
      slide1.addText('Campaign Report', {
        x: 1,
        y: 1.8,
        w: '80%',
        fontSize: 28,
        color: '#4B5563',
      });

      // Campaign details
      slide1.addText(
        [
          { text: '📅 Generated: ', options: { bold: true, fontSize: 14, color: '#4B5563' } },
          { text: `${new Date().toLocaleDateString()}\n\n`, options: { fontSize: 14, color: '#374151' } },

          { text: '👤 Client: ', options: { bold: true, fontSize: 14, color: '#4B5563' } },
          { text: `${campaign.clientEmail || 'N/A'}\n\n`, options: { fontSize: 14, color: '#374151' } },

          { text: '⏱️ Duration: ', options: { bold: true, fontSize: 14, color: '#4B5563' } },
          {
            text: `${new Date(campaign.startDate).toLocaleDateString()} - ${new Date(
              campaign.endDate
            ).toLocaleDateString()}\n\n`,
            options: { fontSize: 14, color: '#374151' },
          },

          { text: '🎯 Number of Boards: ', options: { bold: true, fontSize: 14, color: '#4B5563' } },
          { text: `${campaign.noOfBoards || 'N/A'}`, options: { fontSize: 14, color: '#374151' } },
        ],
        { x: 1, y: 2.8, w: '80%', lineSpacing: 16 }
      );

      // === Image Slides ===
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        setProgress((prev) => ({ ...prev, current: i + 1 }));
        const slide = pptx.addSlide();

        try {
          const imageUrl = image.imageUrl || image.url;
          const response = await fetch(imageUrl);

          if (!response.ok) throw new Error(`Failed to fetch image: ${imageUrl}`);

          const blob = await response.blob();
          if (!blob.type.startsWith('image/')) throw new Error('Invalid image format');

          const imageData = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          // Image
          slide.addImage({
            data: imageData,
            x: 0.5,
            y: 0.7,
            w: 6.5,
            h: 5,
            sizing: { type: 'contain', w: 6.5, h: 5 },
          });

          // Info box
          slide.addShape('rect', {
            x: 7.2,
            y: 0.7,
            w: 3,
            h: 5,
            fill: { color: '#F8F9FA' },
            line: { color: '#E5E7EB', width: 1 },
          });

          // Info text
          slide.addText(
            [
              { text: 'Image Details\n', options: { bold: true, fontSize: 18, color: '#1F2937' } },
              { text: '\nLocation: ', options: { bold: true, fontSize: 14, color: '#4B5563' } },
              {
                text: `${image.location || image.liveLocation || 'N/A'}\n\n`,
                options: { fontSize: 12, color: '#374151' },
              },
              { text: 'Uploaded By: ', options: { bold: true, fontSize: 14, color: '#4B5563' } },
              {
                text: `${image.uploadedBy || image.serviceManEmail || 'N/A'}\n\n`,
                options: { fontSize: 12, color: '#374151' },
              },
              { text: 'Date & Time: ', options: { bold: true, fontSize: 14, color: '#4B5563' } },
              {
                text: `${new Date(image.createdAt || image.dateTime).toLocaleString()}\n\n`,
                options: { fontSize: 12, color: '#374151' },
              },
              { text: 'City: ', options: { bold: true, fontSize: 14, color: '#4B5563' } },
              { text: `${image.city || 'N/A'}\n\n`, options: { fontSize: 12, color: '#374151' } },
              { text: 'Role: ', options: { bold: true, fontSize: 14, color: '#4B5563' } },
              { text: `${image.role || 'serviceman'}`, options: { fontSize: 12, color: '#374151' } },
            ],
            { x: 7.4, y: 0.9, w: 2.8, align: 'left', lineSpacing: 14 }
          );

          // Footer
          slide.addText(`Image ${i + 1} of ${images.length}`, {
            x: 0.5,
            y: 6.3,
            fontSize: 10,
            color: '#6B7280',
            italic: true,
          });
        } catch (imgError) {
          console.error('Error adding image:', imgError);
          slide.addText(`Error loading image #${i + 1}\n${imgError.message}`, {
            x: 1,
            y: 2,
            fontSize: 18,
            color: '#FF0000',
          });
        }
      }

      // Save file
      const fileName = `${campaign.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.pptx`;
      await pptx.writeFile({ fileName });
      setGenerating(false);
      setError(null);
    } catch (error) {
      console.error('Error generating report:', error);
      setGenerating(false);
      setError(error.message || 'Error generating report. Please try again.');
    }
  };

<<<<<<< HEAD
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString('en-US', {
=======
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
>>>>>>> 11e19a4acdff04d816646f712fad3e9cd2222306
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
<<<<<<< HEAD
      minute: '2-digit',
    });

  const handlePrint = () => window.print();

  return (
    <div className="p-6 bg-gray-50">
=======
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 bg-gray-50">
      {/* Report Header */}
>>>>>>> 11e19a4acdff04d816646f712fad3e9cd2222306
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Campaign Report</h1>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 rounded ${
<<<<<<< HEAD
                  viewMode === 'timeline' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
=======
                  viewMode === 'timeline'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
>>>>>>> 11e19a4acdff04d816646f712fad3e9cd2222306
                }`}
              >
                <FaStream className="inline mr-2" /> Timeline
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded ${
<<<<<<< HEAD
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
=======
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
>>>>>>> 11e19a4acdff04d816646f712fad3e9cd2222306
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
<<<<<<< HEAD
                  <FaSpinner className="animate-spin" /> Generating PPT... ({progress.current}/
                  {progress.total})
                </>
              ) : (
                <>
                  <FaFileDownload /> Export to PPT
=======
                  <FaSpinner className="animate-spin" />
                  Generating PPT...
                </>
              ) : (
                <>
                  <FaFileDownload />
                  Export to PPT
>>>>>>> 11e19a4acdff04d816646f712fad3e9cd2222306
                </>
              )}
            </button>
          </div>
        </div>

<<<<<<< HEAD
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded mb-4">
            ⚠️ {error}
          </div>
        )}

        {!imagesLoaded ? (
          <div className="flex flex-col items-center justify-center p-8">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading campaign images...</p>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">Campaign Images</h2>
            {viewMode === 'timeline' ? (
              <div className="space-y-4">
                {images.map((image, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm flex gap-4">
                    <div className="w-48 h-48 flex-shrink-0 relative">
                      {imageLoadErrors.includes(index) ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
                          <span className="text-red-500">Failed to load image</span>
                        </div>
                      ) : (
                        <img
                          src={image.imageUrl || image.url}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            if (!imageLoadErrors.includes(index)) {
                              setImageLoadErrors((prev) => [...prev, index]);
                            }
                            e.target.parentElement.innerHTML =
                              '<div class="w-full h-full flex items-center justify-center bg-gray-100 rounded"><span class="text-red-500">Failed to load image</span></div>';
                          }}
                        />
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="text-lg font-medium">Upload #{index + 1}</p>
                      <p className="text-gray-500 flex items-center gap-2">
                        <FaClock className="inline" />
                        {formatDate(image.timestamp || image.createdAt || image.dateTime)}
                      </p>
                      <p className="flex items-center gap-2 mt-2">
                        <FaMapMarkerAlt className="text-gray-400" />
                        {image.location || image.liveLocation || 'Location not specified'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Uploaded by: {image.uploadedBy || image.serviceManEmail || 'Unknown'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm">
                    <div className="aspect-w-4 aspect-h-3">
                      {imageLoadErrors.includes(index) ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <span className="text-red-500">Failed to load image</span>
                        </div>
                      ) : (
                        <img
                          src={image.imageUrl || image.url}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
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
        )}
      </div>
=======
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
>>>>>>> 11e19a4acdff04d816646f712fad3e9cd2222306
    </div>
  );
};

export default CampaignReport;



