import React from 'react';
import { GovernanceSection } from '../GovernanceSection';
import { SharedLandingPageProps } from './LandingHomePage';

export const LandingAboutPage: React.FC<SharedLandingPageProps> = ({ onOpenLogin, onApplyUG }) => (
  <div>
    <GovernanceSection />
  </div>
);

export default LandingAboutPage;
