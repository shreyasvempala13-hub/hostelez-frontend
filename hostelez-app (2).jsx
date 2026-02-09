import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Droplet, Pill, Heart, Users, Bell, CheckSquare, Utensils, BookOpen, AlertCircle, ChevronRight, Home, ClipboardList, Menu } from 'lucide-react';

const HostelEZApp = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [waterIntake, setWaterIntake] = useState(2.5);
  const [checkedItems, setCheckedItems] = useState({
    idCard: false,
    mathBook: false,
    assignment: false,
    wallet: false,
    keys: false
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayClasses = [
    { time: '9:00 AM', subject: 'Engineering Math', room: 'Block D', status: 'upcoming' },
    { time: '11:00 AM', subject: 'Physics Lab', room: 'Block A', status: 'reminder' },
    { time: '2:00 PM', subject: 'Programming', room: 'Block B', status: 'upcoming' }
  ];

  const attendanceData = [
    { subject: 'Math', percentage: 71, attended: 12, required: 76 },
    { subject: 'English', percentage: 82, attended: 6, required: 6 },
    { subject: 'Physics', percentage: 77, attended: 10, required: 7 }
  ];

  const roommates = [
    { name: 'Rishi', status: 'in', time: 'now' },
    { name: 'Ved', status: 'out', time: '3h ago' }
  ];

  const foodSuggestions = [
    { name: 'Kalyani Mess', price: '₹85', distance: 'Mess', icon: '🍛' },
    { name: 'Yummy Bites', price: '₹80', distance: 'Canteen', rating: '₹72', icon: '🍕' }
  ];

  const notices = [
    { title: 'Room Inspection', time: 'Friday, 4 PM', detail: 'Student rooms will undergo inspection. Ensure your room is tidy.', icon: '🔍' },
    { title: 'Laundry Day', time: 'Wednesday, 9 AM', detail: 'Laundry pickup and drop-off at hostel basement.', icon: '🧺' }
  ];

  const laundrySchedule = {
    room: 'Room 407',
    nextSlot: 'Sat 9:00 AM',
    reminder: 'Upcoming laundry tomorrow'
  };

  const toggleCheckItem = (item) => {
    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const DashboardView = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
              👤
            </div>
            <div>
              <h2 className="text-xl font-bold">{getGreeting()}, Aniket!</h2>
              <p className="text-sm text-white/80">View your schedule →</p>
            </div>
          </div>
          <Bell className="w-6 h-6" />
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-4 gap-3">
        <QuickCard icon={<Calendar className="w-6 h-6" />} title="Timetable" subtitle="View your schedule" badge="0" />
        <QuickCard icon={<span className="text-2xl">🧺</span>} title="Laundry" subtitle="Laundry slot on Sat 9:00 AM" badge="1" color="blue" />
        <QuickCard icon={<Utensils className="w-6 h-6" />} title="Food" subtitle="2 mess options open now" badge="2" color="orange" />
        <QuickCard icon={<ClipboardList className="w-6 h-6" />} title="To-Do List" subtitle="1 pending task" badge="1" color="red" />
      </div>

      {/* Today's Classes */}
      <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Today's Classes</h3>
          <ChevronRight className="w-5 h-5" />
        </div>
        <div className="space-y-2">
          {todayClasses.map((cls, idx) => (
            <div key={idx} className="bg-slate-600/50 rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{cls.time} · {cls.subject}</div>
                <div className="text-xs text-slate-300">{cls.room}</div>
              </div>
              {cls.status === 'reminder' && (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  🔔 Reminder in 10 mins
                </span>
              )}
            </div>
          ))}
          <button className="text-sm text-blue-300 hover:text-blue-200">Show Full Timetable →</button>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-2 gap-3">
        {/* Laundry Timetable */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-4 text-white">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-xl">🧺</span> Laundry Timetable
          </h3>
          <div className="bg-indigo-500/30 rounded-lg p-3 mb-2">
            <div className="text-sm font-medium">{laundrySchedule.room} | {laundrySchedule.nextSlot}</div>
            <div className="text-xs text-indigo-200 mt-1">{laundrySchedule.reminder}</div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
              <div key={idx} className={`p-2 rounded ${idx === 5 ? 'bg-orange-500' : idx === 6 ? 'bg-orange-400' : 'bg-indigo-500/30'}`}>
                {day}
              </div>
            ))}
          </div>
          <button className="text-sm text-indigo-200 hover:text-white mt-2">View All Slots →</button>
        </div>

        {/* Health Tracker */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-4 text-white">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Heart className="w-5 h-5" /> Health Tracker
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Drank: {waterIntake}L / 3.5 L</span>
              <Droplet className="w-5 h-5 text-blue-300" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Next Pill: 8:00 PM</span>
              <Pill className="w-5 h-5 text-pink-300" />
            </div>
          </div>
          <button className="text-sm text-indigo-200 hover:text-white mt-2">View All Stats</button>
        </div>
      </div>

      {/* Roommates Status & Attendance */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-4 text-white">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" /> Roommates Status
          </h3>
          {roommates.map((mate, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${mate.status === 'in' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">{mate.name}: <span className={mate.status === 'in' ? 'text-green-300' : 'text-red-300'}>{mate.status === 'in' ? 'In' : 'Out'}</span> {mate.time !== 'now' && mate.time}</span>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-4 text-white">
          <h3 className="font-semibold mb-2">Attendance Calculator</h3>
          <div className="bg-teal-500/30 rounded-lg p-3 mb-2">
            <div className="text-3xl font-bold">78%</div>
            <div className="text-xs text-teal-200">Need to attend 6 more classes to reach 80%</div>
          </div>
          <button className="bg-teal-500 hover:bg-teal-400 text-white text-sm py-2 px-4 rounded-lg w-full">
            Calculate
          </button>
        </div>
      </div>

      {/* Food & Bottom Cards */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Utensils className="w-5 h-5" /> Nearby Food Suggestions
        </h3>
        {foodSuggestions.map((food, idx) => (
          <div key={idx} className="bg-orange-400/40 rounded-lg p-3 mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{food.icon}</span>
              <div>
                <div className="text-sm font-medium">{food.name} · {food.price}</div>
                <div className="text-xs text-orange-100">{food.distance} {food.rating && `· ${food.rating}`}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation Icons */}
      <div className="grid grid-cols-4 gap-3">
        <BottomCard icon={<Users className="w-6 h-6" />} title="Roommates" />
        <BottomCard icon={<Users className="w-6 h-6" />} title="Faculty Desk" />
        <BottomCard icon={<AlertCircle className="w-6 h-6" />} title="Item Reminder" />
        <BottomCard icon={<BookOpen className="w-6 h-6" />} title="Assignments" />
      </div>
    </div>
  );

  const AttendanceView = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Attendance Monitor</h2>
      {attendanceData.map((subject, idx) => (
        <div key={idx} className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl p-5 border border-rose-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-slate-800">{subject.subject}</h3>
            <span className="text-3xl font-bold text-rose-600">{subject.percentage}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 mb-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-400 to-rose-500 h-3 rounded-full transition-all"
              style={{ width: `${subject.percentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-slate-600">
            {subject.attended} classes attended, need {subject.required}%
          </p>
        </div>
      ))}
      <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-5 text-white">
        <h3 className="font-semibold mb-2">Attendance Tip</h3>
        <p className="text-sm text-slate-200">💡 Pro Tip: Aim to attend all classes unless in emergencies to keep your attendance above 80%.</p>
      </div>
      <button className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl">
        Calculate Required Classes
      </button>
    </div>
  );

  const ChecklistView = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Essential Reminders</h2>
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-5 border border-teal-200">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          ✅ Before You Leave
        </h3>
        {Object.entries(checkedItems).map(([key, checked]) => (
          <div key={key} className="flex items-center gap-3 mb-3 bg-white/60 rounded-lg p-3">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggleCheckItem(key)}
              className="w-5 h-5 accent-teal-500"
            />
            <label className={`flex-1 ${checked ? 'line-through text-slate-400' : 'text-slate-700'}`}>
              {key === 'idCard' && '🪪 ID Card'}
              {key === 'mathBook' && '📘 Bring math book'}
              {key === 'assignment' && '📝 Assignment to submit'}
              {key === 'wallet' && '💳 Wallet'}
              {key === 'keys' && '🔑 Keys'}
            </label>
            {checked && <span className="text-green-500">✓</span>}
          </div>
        ))}
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">💚 Essential Reminder: Don't forget your essential items before leaving the hostel!</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-200">
        <h3 className="font-semibold text-slate-800 mb-2">Roommate Calculator</h3>
        <div className="bg-white/60 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-full bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 h-8 rounded-lg relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 top-0 h-full w-1 bg-slate-700"></div>
              <span className="absolute left-1/2 transform -translate-x-1/2 -top-8 text-2xl font-bold text-slate-800">78%</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 text-center">You need to attend 6 more classes to reach 80%</p>
        </div>
      </div>
    </div>
  );

  const UpdatesView = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Updates</h2>
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
        <h3 className="font-semibold text-slate-800 mb-4">Latest Notices</h3>
        {notices.map((notice, idx) => (
          <div key={idx} className="bg-white/60 rounded-lg p-4 mb-3 flex items-start gap-3">
            <span className="text-2xl">{notice.icon}</span>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-800">{notice.title}</h4>
              <p className="text-xs text-slate-500 mb-1">{notice.time}</p>
              <p className="text-sm text-slate-600">{notice.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-5 text-white">
        <h3 className="font-semibold mb-3">Roommate Check-in</h3>
        {roommates.map((mate, idx) => (
          <div key={idx} className="flex items-center justify-between mb-2 bg-slate-600/50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-slate-500 rounded-full flex items-center justify-center text-lg">
                {mate.name[0]}
              </div>
              <div>
                <div className="text-sm font-medium">{mate.name}</div>
                <div className="text-xs text-slate-300">{mate.status === 'in' ? 'Checked in' : 'Check out'}</div>
              </div>
            </div>
            <span className="text-xs text-slate-400">{mate.time === 'now' ? '10 min ago' : mate.time}</span>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-200">
        <h3 className="font-semibold text-slate-800 mb-3">Calendar</h3>
        <div className="bg-white/60 rounded-lg p-3">
          <div className="text-center text-lg font-bold text-purple-600 mb-2">April 2024</div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day, idx) => (
              <div key={idx} className="text-slate-500 font-semibold p-1">{day}</div>
            ))}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map((day) => (
              <div key={day} className={`p-2 rounded ${day === 19 ? 'bg-purple-500 text-white font-bold' : 'text-slate-700'}`}>
                {day}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const QuickCard = ({ icon, title, subtitle, badge, color = 'slate' }) => {
    const colorClasses = {
      slate: 'from-slate-600 to-slate-700',
      blue: 'from-blue-500 to-blue-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600'
    };

    return (
      <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-3 text-white relative`}>
        {badge && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {badge}
          </span>
        )}
        <div className="mb-2">{icon}</div>
        <div className="text-xs font-semibold">{title}</div>
        <div className="text-[10px] text-white/70 mt-1">{subtitle}</div>
      </div>
    );
  };

  const BottomCard = ({ icon, title }) => (
    <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl p-4 text-white flex flex-col items-center justify-center gap-2 hover:from-slate-500 hover:to-slate-600 cursor-pointer transition-all">
      {icon}
      <div className="text-xs text-center">{title}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-md mx-auto bg-white shadow-2xl min-h-screen">
        {/* App Content */}
        <div className="p-4 pb-20">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'attendance' && <AttendanceView />}
          {activeTab === 'checklist' && <ChecklistView />}
          {activeTab === 'updates' && <UpdatesView />}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 border-t border-slate-600 shadow-lg">
          <div className="grid grid-cols-4 gap-1 p-2">
            <NavButton
              icon={<Home className="w-5 h-5" />}
              label="Dashboard"
              active={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
            />
            <NavButton
              icon={<ClipboardList className="w-5 h-5" />}
              label="Attendance"
              active={activeTab === 'attendance'}
              onClick={() => setActiveTab('attendance')}
            />
            <NavButton
              icon={<CheckSquare className="w-5 h-5" />}
              label="Checklist"
              active={activeTab === 'checklist'}
              onClick={() => setActiveTab('checklist')}
            />
            <NavButton
              icon={<Bell className="w-5 h-5" />}
              label="Updates"
              active={activeTab === 'updates'}
              onClick={() => setActiveTab('updates')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const NavButton = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all ${
      active
        ? 'bg-gradient-to-br from-orange-500 to-pink-500 text-white'
        : 'text-slate-300 hover:text-white hover:bg-slate-600'
    }`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default HostelEZApp;