import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CampaignImageHandler = ({ campaignId, campaign, token, onSuccess }) => {
  const handleImageUpload = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg, image/jpg, image/png';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
          console.log('No file selected');
          return;
        }
        
        console.log('Selected file:', file.name, file.type, file.size);

<<<<<<< HEAD
        // Validate file type and check if file is corrupted
=======
        // Validate file type
>>>>>>> 11e19a4acdff04d816646f712fad3e9cd2222306
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
          toast.error('Please select a JPEG or PNG image');
          return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
          toast.error('Image size should be less than 5MB');
          return;
        }

<<<<<<< HEAD
        // Validate image can be loaded
        try {
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
          });
        } catch (error) {
          toast.error('Selected file appears to be corrupted or invalid');
          return;
        }

=======
>>>>>>> 11e19a4acdff04d816646f712fad3e9cd2222306
        // Show upload progress
        const uploadToastId = toast.info('Preparing to upload...', { 
          autoClose: false,
        });
        
        const formData = new FormData();
        formData.append('image', file);
        formData.append('campaignId', campaignId);
        
        // Add location data
        let locationData = {
          location: campaign.city || 'Unknown',
          city: campaign.city || 'Unknown',
          latitude: 0,
          longitude: 0
        };

        // Try to get current location
        if (navigator.geolocation) {
          try {
            const position = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
                maximumAge: 0,
                enableHighAccuracy: false
              });
            });
            
            locationData = {
              ...locationData,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            console.log('Location data:', locationData);
          } catch (err) {
            console.log('Could not get location:', err);
          }
        }

        // Add location data to form
        Object.entries(locationData).forEach(([key, value]) => {
          formData.append(key, value);
        });

        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/admin/upload-image`,
            formData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
              onUploadProgress: (progressEvent) => {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                toast.update(uploadToastId, { 
                  render: `Uploading: ${progress}%`,
                  type: toast.TYPE.INFO
                });
              }
            }
          );

          toast.dismiss(uploadToastId);
          
          if (response.data?.data) {
            toast.success('Image uploaded successfully');
            if (onSuccess) onSuccess(campaignId);
          } else {
            throw new Error('Invalid server response');
          }
        } catch (error) {
          toast.dismiss(uploadToastId);
          const errorMessage = error.response?.data?.message || 
                             error.response?.data?.error || 
                             'Failed to upload image';
          toast.error(errorMessage);
          console.error('Upload failed:', error);
        }
      };

      input.click();
    } catch (error) {
      toast.error('Failed to initiate image upload');
      console.error('Image upload initialization error:', error);
    }
  };

  return (
    <button
      onClick={handleImageUpload}
      className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
    >
      Upload Image
    </button>
  );
};

export default CampaignImageHandler;