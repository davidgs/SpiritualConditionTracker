import React from 'react';
import Modal from './Modal';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Modal component that explains how the Spiritual Fitness score is calculated
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when the modal should close
 * @returns {React.ReactElement} The modal component
 */
const SpiritualFitnessModal = ({ isOpen, onClose }) => {
  const { darkMode } = useTheme();
  
  const sectionClass = "space-y-2";
  const headingClass = "text-md font-semibold " + 
    (darkMode ? "text-gray-300" : "text-gray-700") + 
    " mb-2";
  const listClass = "text-sm " + 
    (darkMode ? "text-gray-400" : "text-gray-600") + 
    " list-disc pl-5 space-y-1";
  const paragraphClass = "text-sm " + 
    (darkMode ? "text-gray-400" : "text-gray-600");
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Spiritual Fitness Score"
      size="md"
    >
      <div className="space-y-5">
        <section className={sectionClass}>
          <h3 className={headingClass}>
            Base Points for Activities
          </h3>
          <ul className={listClass}>
            <li>AA Meeting: 5 points (speaker +3, shared +1, chair +1)</li>
            <li>Reading Literature: 2 points per 30 min</li>
            <li>Prayer/Meditation: 2 points per 30 min</li>
            <li>Talking with Sponsor: 3 points per 30 min</li>
            <li>Working with Sponsee: 4 points per 30 min (max 20)</li>
            <li>AA Calls: 1 point each (no limit)</li>
            <li>Variety of activities: 1-5 bonus points</li>
          </ul>
        </section>
        
        <section className={sectionClass}>
          <h3 className={headingClass}>
            Timeframe Adjustments
          </h3>
          <ul className={listClass}>
            <li>Consistency bonus for regular activity across weeks</li>
            <li>Higher expectations for longer timeframes</li>
            <li>Recent activity weighted more heavily</li>
            <li>Score reflects sustained engagement over time</li>
          </ul>
        </section>
        
        <section className={sectionClass}>
          <h3 className={headingClass}>
            How Timeframes Affect Your Score
          </h3>
          <p className={paragraphClass}>
            Shorter timeframes (30 days) focus on recent activity, while 
            longer timeframes (60-365 days) measure your consistent 
            engagement over time. A high score over a 365-day period 
            demonstrates sustained spiritual fitness.
          </p>
        </section>
        
        <div className="pt-2 text-center">
          <p className={"font-semibold " + paragraphClass}>
            Maximum score is 100
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default SpiritualFitnessModal;