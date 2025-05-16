import React from 'react';

const SimpleMeetingSchedule = ({ schedule, onChange }) => {
  const days = [
    { key: 'sunday', label: 'Sun' },
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' }
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
    <div className="mb-6">
      <label className="block text-gray-700 dark:text-gray-300 mb-2 text-xl font-medium">
        Meeting Schedule
      </label>

      <div className="space-y-2">
        {days.map((day) => {
          const existingItem = schedule.find(item => item.day === day.key);
          const hasTime = !!existingItem;
          const timeValue = existingItem ? existingItem.time : '';
          
          return (
            <div key={day.key} className="flex items-center space-x-2">
              <label className="w-10 font-medium text-gray-700 dark:text-gray-300">
                {day.label}
              </label>
              <select
                className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
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
            </div>
          );
        })}
      </div>

      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded">
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          <i className="fa-solid fa-circle-info text-blue-500 dark:text-blue-400 mr-2"></i>
          Select times for each day this meeting occurs.
        </p>
      </div>
    </div>
  );
};

export default SimpleMeetingSchedule;