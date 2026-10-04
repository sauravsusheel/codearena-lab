import React from 'react';
import { FacultyDirectorySection } from '../FacultyDirectorySection';
import { SharedLandingPageProps } from './LandingHomePage';

export const LandingFacultyPage: React.FC<SharedLandingPageProps> = () => (
  <div>
    <FacultyDirectorySection />
  </div>
);

export default LandingFacultyPage;
