import React, { useState, useEffect } from 'react';
import { 
  Globe, Bell, Calendar, Image as ImageIcon, Plus, Trash2, 
  CheckCircle2, Eye, EyeOff, ExternalLink, Sparkles, Upload, 
  Tag, MapPin, Clock, ArrowRight, Layers, Database, Save, 
  Phone, Mail, Building, FileText, Cloud, Check
} from 'lucide-react';
import { 
  websiteContentService, 
  WebsiteEvent, 
  WebsiteNotification, 
  HeroSlide,
  WebsiteMasterInfo 
} from '../../services/websiteContentService';
import { FirebaseSettingsModal } from './FirebaseSettingsModal';
import { firebaseConfigManager } from '../../services/firebaseConfig';
import { dbStorageService } from '../../services/dbStorageService';

const AVAILABLE_CAMPUS_IMAGES = [
  { url: '/campus/videoframe_0.png', label: '116-Acre Global Campus Aerial' },
  { url: '/campus/videoframe_25737.png', label: 'Centre for Sustainability & Solar PV' },
  { url: '/campus/videoframe_1848.png', label: 'Vidyaranya Central Library' },
  { url: '/campus/videoframe_36364.png', label: 'High Performance Computing Lab' },
  { url: '/campus/videoframe_10723.png', label: 'Academic Quad & Amphitheatre' },
  { url: '/campus/videoframe_18482.png', label: 'Kautilya Hall of Governance' },
  { url: '/campus/videoframe_26542.png', label: 'Solar Lab & Research Facility' },
  { url: '/campus/videoframe_32469.png', label: 'Smart Seminar Theater' },
  { url: '/campus/videoframe_41907.png', label: 'Residential Green Hostels' },
  { url: '/campus/videoframe_52513.png', label: 'Campus Innovation Plaza' }
];

export const WebsiteContentManagerView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'NOTIFICATIONS' | 'EVENTS' | 'SLIDES' | 'MASTER_INFO'>('EVENTS');
  const [notifications, setNotifications] = useState<WebsiteNotification[]>(websiteContentService.getNotifications());
  const [events, setEvents] = useState<WebsiteEvent[]>(websiteContentService.getEvents());
  const [slides, setSlides] = useState<HeroSlide[]>(websiteContentService.getHeroSlides());
  const [masterInfo, setMasterInfo] = useState<WebsiteMasterInfo>(websiteContentService.getMasterInfo());
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [masterSaveSuccess, setMasterSaveSuccess] = useState(false);
  const [customUploading, setCustomUploading] = useState(false);

  // New Notification Form state
  const [newNotifText, setNewNotifText] = useState('');
  const [newNotifBadge, setNewNotifBadge] = useState('ANNOUNCEMENT');
  const [newNotifLinkText, setNewNotifLinkText] = useState('');
  const [newNotifLinkUrl, setNewNotifLinkUrl] = useState('');

  // New Event Form state
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<'SUSTAINABILITY' | 'RESEARCH' | 'ACADEMIC' | 'ADMISSIONS' | 'CULTURAL'>('SUSTAINABILITY');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('10:00 AM – 04:00 PM');
  const [newEventVenue, setNewEventVenue] = useState('Vidyaranya Auditorium');
  const [newEventImage, setNewEventImage] = useState(AVAILABLE_CAMPUS_IMAGES[1].url);
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventRegLink, setNewEventRegLink] = useState('');

  const handleCustomImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomUploading(true);
      try {
        const res = await dbStorageService.uploadMedia(file, `events/${Date.now()}_${file.name}`);
        setNewEventImage(res.url);
      } catch (err) {
        console.error('Custom image upload failed:', err);
      } finally {
        setCustomUploading(false);
      }
    }
  };

  const handleSaveMasterInfo = (e: React.FormEvent) => {
    e.preventDefault();
    websiteContentService.updateMasterInfo(masterInfo);
    setMasterSaveSuccess(true);
    setTimeout(() => setMasterSaveSuccess(false), 3500);
  };

  // Notifications Handlers
  const handleAddNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotifText.trim()) return;
    websiteContentService.addNotification({
      text: newNotifText.trim(),
      badge: newNotifBadge.trim().toUpperCase(),
      linkText: newNotifLinkText.trim() || undefined,
      linkUrl: newNotifLinkUrl.trim() || undefined,
      isActive: true
    });
    setNotifications(websiteContentService.getNotifications());
    setNewNotifText('');
    setNewNotifLinkText('');
    setNewNotifLinkUrl('');
  };

  const handleToggleNotification = (id: string) => {
    websiteContentService.toggleNotification(id);
    setNotifications(websiteContentService.getNotifications());
  };

  const handleDeleteNotification = (id: string) => {
    websiteContentService.deleteNotification(id);
    setNotifications(websiteContentService.getNotifications());
  };

  // Events Handlers
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventDate.trim()) return;
    websiteContentService.addEvent({
      title: newEventTitle.trim(),
      category: newEventCategory,
      date: newEventDate.trim(),
      time: newEventTime.trim(),
      venue: newEventVenue.trim(),
      imageUrl: newEventImage,
      description: newEventDesc.trim() || 'Join us for this signature Chanakya University event featuring keynote academicians, researchers, and students.',
      registrationLink: newEventRegLink.trim() || '#',
      isPublished: true
    });
    setEvents(websiteContentService.getEvents());
    setNewEventTitle('');
    setNewEventDate('');
    setNewEventDesc('');
    setNewEventRegLink('');
  };

  const handleToggleEventPublish = (id: string) => {
    websiteContentService.toggleEventPublish(id);
    setEvents(websiteContentService.getEvents());
  };

  const handleDeleteEvent = (id: string) => {
    websiteContentService.deleteEvent(id);
    setEvents(websiteContentService.getEvents());
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cu-pill text-cu-navy text-[11px] font-bold uppercase tracking-wider mb-1">
            <Globe size={12} className="text-cu-gold" />
            <span>Public Website Controller &amp; Media Relations</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Chanakya Public Website Content &amp; Event Operations
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Publish live campus events with high-res photography, update top-bar ticker announcements, and manage the slidable hero gallery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFirebaseModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-amber-200 bg-amber-50/80 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-semibold shadow-2xs transition"
          >
            <Database size={14} className="text-amber-600" />
            <span>{firebaseConfigManager.isConfigured() ? 'Firebase Cloud Sync (Active)' : 'Database & Storage Settings'}</span>
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-cu-navy rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <ExternalLink size={14} />
            <span>View Public Website</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Published Events</div>
          <div className="text-2xl font-bold text-cu-navy mt-1">
            {events.filter(e => e.isPublished).length} Active
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">Visible on main landing page</div>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Ticker Announcements</div>
          <div className="text-2xl font-bold text-cu-saffron mt-1">
            {notifications.filter(n => n.isActive).length} Live
          </div>
          <div className="text-[10px] text-amber-700 font-semibold mt-1">Top-bar scrolling marquee</div>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Slidable Campus Gallery</div>
          <div className="text-2xl font-bold text-cu-gold mt-1">
            {slides.length} Slides
          </div>
          <div className="text-[10px] text-cu-navy font-semibold mt-1">116-Acre Bengaluru Campus</div>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Global Portal State</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">Live</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">CDN Edge Cache Synchronized</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('EVENTS')}
          className={`pb-2.5 flex items-center gap-1.5 transition border-b-2 ${
            activeTab === 'EVENTS'
              ? 'border-cu-navy text-cu-navy'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Calendar size={14} />
          <span>Campus Events with Images ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('NOTIFICATIONS')}
          className={`pb-2.5 flex items-center gap-1.5 transition border-b-2 ${
            activeTab === 'NOTIFICATIONS'
              ? 'border-cu-navy text-cu-navy'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Bell size={14} />
          <span>Ticker Announcements ({notifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SLIDES')}
          className={`pb-2.5 flex items-center gap-1.5 transition border-b-2 ${
            activeTab === 'SLIDES'
              ? 'border-cu-navy text-cu-navy'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <ImageIcon size={14} />
          <span>Campus Hero Gallery Slides ({slides.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('MASTER_INFO')}
          className={`pb-2.5 flex items-center gap-1.5 transition border-b-2 ${
            activeTab === 'MASTER_INFO'
              ? 'border-cu-navy text-cu-navy'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Building size={14} />
          <span>Website Master Details &amp; Governance</span>
        </button>
      </div>

      {/* TAB 1: CAMPUS EVENTS WITH IMAGES */}
      {activeTab === 'EVENTS' && (
        <div className="space-y-6">
          {/* Create New Event Form */}
          <form onSubmit={handleAddEvent} className="bg-white rounded-2xl border border-cu-border p-6 shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-cu-navy flex items-center gap-2">
              <Plus size={16} /> Post New Campus Event on Main Website
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Event Title:</label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. National Solar PV & Renewable Energy Symposium 2026"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Category:</label>
                <select
                  value={newEventCategory}
                  onChange={(e) => setNewEventCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy font-medium"
                >
                  <option value="SUSTAINABILITY">Sustainability &amp; Clean Energy</option>
                  <option value="RESEARCH">Research &amp; Innovation (AI / STEM)</option>
                  <option value="ACADEMIC">Academic &amp; Convocation</option>
                  <option value="ADMISSIONS">Admissions &amp; Open Day</option>
                  <option value="CULTURAL">Cultural &amp; Sports</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Date:</label>
                <input
                  type="text"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  placeholder="e.g. Oct 18, 2026"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Time Slot:</label>
                <input
                  type="text"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  placeholder="e.g. 10:00 AM – 04:30 PM"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Venue / Hall:</label>
                <input
                  type="text"
                  value={newEventVenue}
                  onChange={(e) => setNewEventVenue(e.target.value)}
                  placeholder="e.g. Centre for Sustainability, Block 4"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy"
                />
              </div>
            </div>

            {/* Choose Event Image */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-gray-700 font-semibold">Event Feature Photo:</label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 bg-cu-pill text-cu-navy border border-cu-border rounded-xl text-[11px] font-bold hover:bg-cu-gold hover:text-cu-navy transition">
                    <Upload size={13} />
                    <span>{customUploading ? 'Uploading...' : 'Upload Custom Image'}</span>
                    <input type="file" accept="image/*" onChange={handleCustomImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {AVAILABLE_CAMPUS_IMAGES.slice(0, 5).map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setNewEventImage(img.url)}
                    className={`cursor-pointer rounded-xl border-2 overflow-hidden transition relative group ${
                      newEventImage === img.url ? 'border-cu-navy ring-2 ring-cu-gold' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-16 object-cover" />
                    <div className="p-1 text-[9px] font-semibold text-gray-600 truncate bg-white">
                      {img.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-gray-400 font-semibold">Or Image URL:</span>
                <input
                  type="text"
                  value={newEventImage}
                  onChange={(e) => setNewEventImage(e.target.value)}
                  placeholder="https://... or /campus/videoframe_*.png"
                  className="flex-1 px-3 py-1.5 border border-gray-200 rounded-xl font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-cu-navy"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Description / Summary:</label>
              <textarea
                rows={2}
                value={newEventDesc}
                onChange={(e) => setNewEventDesc(e.target.value)}
                placeholder="Brief description of the event, speakers, and audience..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="w-full sm:w-1/2">
                <input
                  type="text"
                  value={newEventRegLink}
                  onChange={(e) => setNewEventRegLink(e.target.value)}
                  placeholder="Registration Link e.g. https://chanakya.edu.in/rsvp"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-cu-navy hover:bg-cu-navy-light text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <Plus size={14} />
                <span>Publish Event to Main Website</span>
              </button>
            </div>
          </form>

          {/* Existing Events Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-cu-navy">Active Website Events ({events.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map(evt => (
                <div key={evt.id} className="bg-white rounded-2xl border border-cu-border shadow-sm overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="relative h-40 bg-gray-100 overflow-hidden">
                      <img src={evt.imageUrl} alt={evt.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 text-cu-navy shadow-sm backdrop-blur-xs">
                          {evt.category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleEventPublish(evt.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition backdrop-blur-xs ${
                            evt.isPublished ? 'bg-emerald-600/90 text-white' : 'bg-gray-800/80 text-gray-200'
                          }`}
                        >
                          {evt.isPublished ? 'Published' : 'Hidden'}
                        </button>
                      </div>
                    </div>

                    <div className="p-4 space-y-2 text-xs">
                      <h4 className="font-bold text-cu-navy text-sm">{evt.title}</h4>
                      <p className="text-gray-600 text-[11px] leading-relaxed line-clamp-2">{evt.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-gray-500 text-[10px] pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-cu-saffron" />
                          <span>{evt.date}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-gray-400" />
                          <span>{evt.time}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-gray-400" />
                          <span>{evt.venue}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-gray-400 font-mono">ID: {evt.id}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 transition rounded-lg hover:bg-white"
                        title="Delete event"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TICKER ANNOUNCEMENTS */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="bg-white rounded-2xl border border-cu-border p-6 shadow-sm space-y-6 text-xs">
          {/* Add Notification Form */}
          <form onSubmit={handleAddNotification} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
            <h4 className="font-bold text-sm text-cu-navy flex items-center gap-1.5">
              <Plus size={15} /> Add Top-Bar Ticker Announcement
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-3">
                <label className="block text-gray-600 font-semibold mb-1">Announcement Text:</label>
                <input
                  type="text"
                  value={newNotifText}
                  onChange={(e) => setNewNotifText(e.target.value)}
                  placeholder="e.g. Admissions Open 2026-27: Apply now for B.Tech, MCA, MBA & Ph.D."
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Badge Tag:</label>
                <input
                  type="text"
                  value={newNotifBadge}
                  onChange={(e) => setNewNotifBadge(e.target.value)}
                  placeholder="e.g. ADMISSIONS 2026"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Link Button Text (Optional):</label>
                <input
                  type="text"
                  value={newNotifLinkText}
                  onChange={(e) => setNewNotifLinkText(e.target.value)}
                  placeholder="e.g. Apply Online"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Link Destination URL (Optional):</label>
                <input
                  type="text"
                  value={newNotifLinkUrl}
                  onChange={(e) => setNewNotifLinkUrl(e.target.value)}
                  placeholder="e.g. https://chanakya.edu.in/apply"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-cu-navy text-white text-xs font-bold rounded-xl hover:bg-cu-navy-light transition shadow-xs"
            >
              Broadcast Ticker Notification
            </button>
          </form>

          {/* Existing Notifications */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-cu-navy">Active &amp; Archived Ticker Announcements ({notifications.length})</h4>
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
              {notifications.map(notif => (
                <div key={notif.id} className="p-3.5 bg-white hover:bg-gray-50/80 transition flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cu-pill text-cu-navy">
                      {notif.badge}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-800">{notif.text}</div>
                      <div className="text-[10px] text-gray-400 font-mono">Published: {notif.publishedAt}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleNotification(notif.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                        notif.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {notif.isActive ? 'Active' : 'Muted'}
                    </button>
                    <button
                      onClick={() => handleDeleteNotification(notif.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 transition"
                      title="Delete announcement"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HERO GALLERY SLIDES */}
      {activeTab === 'SLIDES' && (
        <div className="space-y-4 text-xs">
          <div className="bg-white rounded-2xl border border-cu-border p-5 shadow-sm">
            <h4 className="font-bold text-sm text-cu-navy mb-1">Interactive Campus Visual Experience Slides</h4>
            <p className="text-gray-500">
              These 5 slides are rendered in the auto-playing interactive carousel on the public website homepage using the official 116-acre Chanakya campus video captures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {slides.map(slide => (
              <div key={slide.id} className="bg-white rounded-2xl border border-cu-border shadow-sm overflow-hidden">
                <div className="h-44 relative overflow-hidden">
                  <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cu-navy text-cu-gold shadow-md">
                      {slide.badge}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <h5 className="font-bold text-cu-navy text-sm">{slide.title}</h5>
                  <p className="text-gray-600 text-[11px] leading-relaxed">{slide.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: WEBSITE MASTER DETAILS & GOVERNANCE */}
      {activeTab === 'MASTER_INFO' && (
        <form onSubmit={handleSaveMasterInfo} className="bg-white rounded-2xl border border-cu-border p-6 shadow-sm space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h4 className="font-bold text-sm text-cu-navy flex items-center gap-2">
                <Building size={16} className="text-cu-gold" />
                <span>University Master Information &amp; Public Metadata</span>
              </h4>
              <p className="text-gray-500 text-[11px] mt-0.5">
                These master parameters are broadcast across the public landing page hero banner, governance cards, about section, and contact footer.
              </p>
            </div>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-cu-navy hover:bg-cu-navy-light text-white rounded-xl font-bold text-xs shadow-sm transition"
            >
              <Save size={13} />
              <span>Save Master Details</span>
            </button>
          </div>

          {masterSaveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-bold animate-fadeIn">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Website master metadata successfully updated and synchronized across all landing page views!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">University Name:</label>
              <input
                type="text"
                value={masterInfo.universityName}
                onChange={(e) => setMasterInfo({ ...masterInfo, universityName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy font-bold"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Institutional Motto / Tagline:</label>
              <input
                type="text"
                value={masterInfo.tagline}
                onChange={(e) => setMasterInfo({ ...masterInfo, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Official Vidyaranya Campus Address:</label>
            <input
              type="text"
              value={masterInfo.address}
              onChange={(e) => setMasterInfo({ ...masterInfo, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Central Admissions Helpline:</label>
              <input
                type="text"
                value={masterInfo.admissionsHelpline}
                onChange={(e) => setMasterInfo({ ...masterInfo, admissionsHelpline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Admissions Inquiries Email:</label>
              <input
                type="email"
                value={masterInfo.admissionsEmail}
                onChange={(e) => setMasterInfo({ ...masterInfo, admissionsEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Chancellor Name:</label>
              <input
                type="text"
                value={masterInfo.chancellorName}
                onChange={(e) => setMasterInfo({ ...masterInfo, chancellorName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy font-semibold"
              />
              <input
                type="text"
                value={masterInfo.chancellorTitle}
                onChange={(e) => setMasterInfo({ ...masterInfo, chancellorTitle: e.target.value })}
                placeholder="Designation & Role"
                className="w-full px-3 py-1.5 mt-1 border border-gray-100 rounded-lg text-[11px] text-gray-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Vice-Chancellor Name:</label>
              <input
                type="text"
                value={masterInfo.vcName}
                onChange={(e) => setMasterInfo({ ...masterInfo, vcName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy font-semibold"
              />
              <input
                type="text"
                value={masterInfo.vcTitle}
                onChange={(e) => setMasterInfo({ ...masterInfo, vcTitle: e.target.value })}
                placeholder="Designation & Role"
                className="w-full px-3 py-1.5 mt-1 border border-gray-100 rounded-lg text-[11px] text-gray-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Registrar Name:</label>
              <input
                type="text"
                value={masterInfo.registrarName}
                onChange={(e) => setMasterInfo({ ...masterInfo, registrarName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy font-semibold"
              />
              <input
                type="text"
                value={masterInfo.registrarTitle}
                onChange={(e) => setMasterInfo({ ...masterInfo, registrarTitle: e.target.value })}
                placeholder="Designation & Role"
                className="w-full px-3 py-1.5 mt-1 border border-gray-100 rounded-lg text-[11px] text-gray-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-gray-600 font-medium mb-1">Campus Acres:</label>
              <input
                type="number"
                value={masterInfo.campusAcres}
                onChange={(e) => setMasterInfo({ ...masterInfo, campusAcres: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Academic Schools:</label>
              <input
                type="number"
                value={masterInfo.totalSchools}
                onChange={(e) => setMasterInfo({ ...masterInfo, totalSchools: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Smart Classrooms:</label>
              <input
                type="number"
                value={masterInfo.classroomsCount}
                onChange={(e) => setMasterInfo({ ...masterInfo, classroomsCount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Research Labs:</label>
              <input
                type="number"
                value={masterInfo.researchLabsCount}
                onChange={(e) => setMasterInfo({ ...masterInfo, researchLabsCount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Solar PV (MW):</label>
              <input
                type="number"
                step="0.1"
                value={masterInfo.solarCapacityMw}
                onChange={(e) => setMasterInfo({ ...masterInfo, solarCapacityMw: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">About Chanakya University Narrative:</label>
            <textarea
              rows={3}
              value={masterInfo.aboutText}
              onChange={(e) => setMasterInfo({ ...masterInfo, aboutText: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy leading-relaxed"
            />
          </div>
        </form>
      )}

      {/* Firebase Database & Cloud Storage Settings Modal */}
      <FirebaseSettingsModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />
    </div>
  );
};
export default WebsiteContentManagerView;
