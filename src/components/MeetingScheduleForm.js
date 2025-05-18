import React from 'react';

const DayDropdown = ({ value, hasTime, onChange }) => {
  return (
    <select
      className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
      value={value || "none"}
      onChange={onChange}
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
  );
};

const MeetingScheduleForm = ({ schedule, onChange }) => {
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
      const existingIndex = schedule.findIndex(item => item.day === day);
      
      if (existingIndex >= 0) {
        // Update existing day
        const newSchedule = [...schedule];
        newSchedule[existingIndex] = { day, time: value };
        onChange(newSchedule);
      } else {
        // Add new day
        onChange([...schedule, { day, time: value }]);
      }
    }
  };

  return (
    <div className="meeting-schedule-form">
      <label className="block text-gray-700 dark:text-gray-300 mb-2 text-xl font-medium">
        Meeting Schedule
      </label>

      <div className="space-y-3">
        {days.map(day => {
          const scheduleItem = schedule.find(item => item.day === day.key);
          const hasTime = !!scheduleItem;
          const timeValue = scheduleItem ? scheduleItem.time : '';
          
          return (
            <div key={day.key} className="flex items-center">
              <div className="w-12 flex-shrink-0 font-medium text-gray-700 dark:text-gray-300">
                {day.label}
              </div>
              <div className="flex-grow">
                <DayDropdown 
                  value={timeValue}
                  hasTime={hasTime}
                  onChange={(e) => handleTimeChange(day.key, e.target.value)}
                />
              </div>
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

export default MeetingScheduleForm;