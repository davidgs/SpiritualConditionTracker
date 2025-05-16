import React from 'react';
import { formatTimeByPreference } from '../utils/dateUtils';

const SimpleMeetingSchedule = ({ schedule, onChange, use24HourFormat = false }) => {
  const days = [
    { key: 'sunday', label: 'Sunday' },
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' }
  ];

  const handleTimeChange = (day, value) => {
    if (value === "none") {
      // Remove this day from schedule
      const newSchedule = schedule.filter(item => item.day !== day);
      onChange(newSchedule);
    } else {
      const existingItemIndex = schedule.findIndex(item => item.day === day);
      
      if (existingItemIndex >= 0) {
        // Update existing day
        const newSchedule = [...schedule];
        newSchedule[existingItemIndex] = { day, time: value };
        onChange(newSchedule);
      } else {
        // Add new day
        onChange([...schedule, { day, time: value }]);
      }
    }
  };

  return (
    <div className="mb-6 w-full">
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden w-full">
        <table className="w-full border-collapse">
          <tbody>
            {days.map((day, index) => {
              const existingItem = schedule.find(item => item.day === day.key);
              const hasTime = !!existingItem;
              const timeValue = existingItem ? existingItem.time : '';
              
              return (
                <tr 
                  key={day.key} 
                  className={`${
                    index < days.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''
                  } ${
                    hasTime ? '' : ''
                  }`}
                >
                  <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium w-2/5">
                    {day.label}
                  </td>
                  <td className="p-2 w-3/5" style={{ paddingTop: '10px'}}>
                    <select
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      value={timeValue || "none"}
                      onChange={(e) => handleTimeChange(day.key, e.target.value)}
                    >
                      <option value="none">{hasTime ? "Remove" : "None"}</option>
                      <option value="06:00">6:00 AM</option>
                      <option value="07:00">7:00 AM</option>
                      <option value="08:00">8:00 AM</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="17:00">5:00 PM</option>
                      <option value="18:00">6:00 PM</option>
                      <option value="19:00">7:00 PM</option>
                      <option value="20:00">8:00 PM</option>
                      <option value="21:00">9:00 PM</option>
                      <option value="22:00">10:00 PM</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SimpleMeetingSchedule;