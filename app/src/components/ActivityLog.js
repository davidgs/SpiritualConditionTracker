function ActivityLog({ setCurrentView, onSave }) {
  const { useState } = React;
  const [activityType, setActivityType] = useState('prayer');
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!activityType) newErrors.activityType = 'Activity type is required';
    if (!duration) newErrors.duration = 'Duration is required';
    if (!date) newErrors.date = 'Date is required';
    
    // If there are errors, show them and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create new activity object
    const newActivity = {
      type: activityType,
      duration: parseInt(duration, 10),
      date: new Date(date).toISOString(),
      notes: notes.trim(),
    };
    
    // Save the activity
    onSave(newActivity);
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center mb-6">
        <button 
          className="mr-2 text-blue-500"
          onClick={() => setCurrentView('dashboard')}
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1 className="text-2xl font-bold">Log New Activity</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Activity Type</label>
          <select
            className="w-full p-2 border border-gray-300 rounded"
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
          >
            <option value="prayer">Prayer</option>
            <option value="meditation">Meditation</option>
            <option value="literature">Reading Literature</option>
            <option value="service">Service Work</option>
            <option value="sponsee">Sponsee Call/Meeting</option>
            <option value="meeting">AA Meeting</option>
          </select>
          {errors.activityType && (
            <p className="text-red-500 text-sm">{errors.activityType}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Duration (minutes)</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter duration in minutes"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1"
          />
          {errors.duration && (
            <p className="text-red-500 text-sm">{errors.duration}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Date</label>
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
          {errors.date && (
            <p className="text-red-500 text-sm">{errors.date}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Notes (optional)</label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Add any notes about this activity..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
          ></textarea>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded font-medium"
          >
            Save Activity
          </button>
        </div>
      </form>
    </div>
  );
}