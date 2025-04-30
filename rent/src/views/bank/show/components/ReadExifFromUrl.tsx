import React, { useEffect, useState } from 'react';
import EXIF from 'exif-js';
import ChangeLocation from '../../add/components/ChangeLocation';

interface ReadExifFromUrlProps {
  imageUrl: string;
  bankId: string;
}

const ReadExifFromUrl: React.FC<ReadExifFromUrlProps> = ({ imageUrl, bankId }) => {
   const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const handleLoadExif = async () => {
    try {
      // Fetch image as a Blob
      const response = await fetch(imageUrl, {  mode: 'cors' });
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = function (e) {
        const result = e.target?.result;
        if (!result || typeof result !== 'string') return;
        const img = new Image();
        img.onload = function () {
          EXIF.getData(img, function () {
            const lat = EXIF.getTag(this, 'GPSLatitude');
            const lon = EXIF.getTag(this, 'GPSLongitude');
            const latRef = EXIF.getTag(this, 'GPSLatitudeRef') || 'N';
            const lonRef = EXIF.getTag(this, 'GPSLongitudeRef') || 'E';

             if (lat && lon) {
                const toDecimal = (coords: number[], ref: string) => {
                const decimal = coords[0] + coords[1] / 60 + coords[2] / 3600;
                return (ref === 'S' || ref === 'W') ? -decimal : decimal;
              };

              const latitude = toDecimal(lat, latRef);
              const longitude = toDecimal(lon, lonRef);
              console.log('Latitude:', latitude, 'Longitude:', longitude);
              setLocation({ lat: latitude, lng:  longitude });
            } else {
              console.log('No GPS metadata found.');
            }
          });
        };
        img.src = result;
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error fetching image or reading EXIF:', error);
    }
  };
    useEffect(() => {
      handleLoadExif()
    }, [bankId, imageUrl]);
  return (
    <div>
      { location && <ChangeLocation location={location} bankId={bankId} ></ChangeLocation> }
    </div>
  );
};

export default ReadExifFromUrl;
