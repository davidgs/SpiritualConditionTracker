function Profile({ setCurrentView, user, onUpdate }) {
  const { useState, useEffect } = React;
  const [name, setName] = useState('');
  const [sobrietyDate, setSobrietyDate] = useState('');
  const [homeGroup, setHomeGroup] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorPhone, setSponsorPhone] = useState('');
  const [errors, setErrors] = useState({});

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSobrietyDate(user.sobrietyDate ? user.sobrietyDate.split('T')[0] : '');
      setHomeGroup(user.homeGroup || '');
      setSponsorName(user.sponsorName || '');
      setSponsorPhone(user.sponsorPhone || '');
    }
  }, [user]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!sobrietyDate) newErrors.sobrietyDate = 'Sobriety date is required';
    
    // If there are errors, show them and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create updates object
    const updates = {
      name,
      sobrietyDate: sobrietyDate ? new Date(sobrietyDate).toISOString() : '',
      homeGroup,
      sponsorName,
      sponsorPhone
    };
    
    // Update the profile
    onUpdate(updates);
  };

  // Calculate sobriety information if user has a sobriety date
  const sobrietyDays = sobrietyDate 
    ? window.db?.calculateSobrietyDays(sobrietyDate) || 0
    : 0;
  
  const sobrietyYears = sobrietyDate 
    ? window.db?.calculateSobrietyYears(sobrietyDate, 2) || 0
    : 0;

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center mb-6">
        <button 
          className="mr-2 text-blue-500"
          onClick={() => setCurrentView('dashboard')}
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1 className="text-2xl font-bold">Your Profile</h1>
      </div>
      
      {sobrietyDate && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">Sobriety Milestone</h2>
          <div className="flex justify-around">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{sobrietyDays}</div>
              <div className="text-sm text-blue-700">Days</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{sobrietyYears}</div>
              <div className="text-sm text-blue-700">Years</div>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg shadow p-4">
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Your Name</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Sobriety Date *</label>
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded"
            value={sobrietyDate}
            onChange={(e) => setSobrietyDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
          {errors.sobrietyDate && (
            <p className="text-red-500 text-sm">{errors.sobrietyDate}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Home Group</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter your home group"
            value={homeGroup}
            onChange={(e) => setHomeGroup(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Sponsor's Name</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter your sponsor's name"
            value={sponsorName}
            onChange={(e) => setSponsorName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Sponsor's Phone</label>
          <input
            type="tel"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter your sponsor's phone number"
            value={sponsorPhone}
            onChange={(e) => setSponsorPhone(e.target.value)}
          />
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded font-medium"
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}