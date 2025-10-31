import React, { useState } from 'react';
import { FaTimes, FaSpinner, FaExpandAlt } from 'react-icons/fa';
import CampaignReport from './CampaignReport';

const CampaignGalleryModal = ({ isOpen, onClose, images, campaignName, campaign }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageLoading, setImageLoading] = useState({});

  if (!isOpen) return null;

  const handleImageLoad = (imageId) => {
    setImageLoading(prev => ({
      ...prev,
      [imageId]: false
    }));
  };

  const handleImageError = (imageId) => {
    setImageLoading(prev => ({
      ...prev,
      [imageId]: false
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{campaignName} - Campaign Images</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FaTimes size={24} />
            </button>
          </div>
          
          <div className="flex justify-end">
            {images.length > 0 && campaign && (
              <CampaignReport campaign={campaign} images={images} />
            )}
          </div>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-100px)]">
          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
              <FaSpinner className="animate-spin text-4xl mb-4" />
              <p className="text-center">No images uploaded yet for this campaign</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div 
                  key={image._id || index} 
                  className="relative group bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-[4/3]">
                    {imageLoading[image._id] !== false && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <FaSpinner className="animate-spin text-gray-400 text-2xl" />
                      </div>
                    )}
                    <img
                      src={image.imageUrl}
                      alt={`Campaign ${campaignName}`}
                      className="w-full h-full object-cover"
                      onLoad={() => handleImageLoad(image._id)}
                      onError={() => handleImageError(image._id)}
                    />
                    <button
                      onClick={() => setSelectedImage(image)}
                      className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaExpandAlt size={14} />
                    </button>
                  </div>
                  <div className="p-3 bg-white">
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-gray-800">
                        Uploaded by: {image.uploadedBy || image.serviceManEmail}
                        <span className="ml-1 text-xs text-gray-500">
                          ({image.role || 'serviceman'})
                        </span>
                      </p>
                      <p className="text-gray-600">
                        Location: {image.location || image.liveLocation || 'N/A'}
                      </p>
                      <p className="text-gray-600">
                        City: {image.city || 'N/A'}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Uploaded: {formatDate(image.createdAt || image.dateTime)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full-size image modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-60 bg-black bg-opacity-90 flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-[90vw] max-h-[90vh]">
            <img
              src={selectedImage.imageUrl}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignGalleryModal;