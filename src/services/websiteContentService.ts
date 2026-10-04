// Chanakya University — Public Website Content & Events Management Service
// Managed by the Public Website Controller role to push live announcements, ticker updates, and events with images.

import { dbStorageService } from './dbStorageService';

export interface WebsiteEvent {
  id: string;
  title: string;
  category: 'RESEARCH' | 'ACADEMIC' | 'ADMISSIONS' | 'CULTURAL' | 'SUSTAINABILITY';
  date: string;
  time: string;
  venue: string;
  imageUrl: string;
  description: string;
  registrationLink?: string;
  isPublished: boolean;
}

export interface WebsiteNotification {
  id: string;
  text: string;
  linkText?: string;
  linkUrl?: string;
  badge: string;
  isActive: boolean;
  publishedAt: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  badge: string;
  ctaText: string;
  ctaLink: string;
}

export interface WebsiteMasterInfo {
  universityName: string;
  tagline: string;
  address: string;
  admissionsHelpline: string;
  admissionsEmail: string;
  chancellorName: string;
  chancellorTitle: string;
  vcName: string;
  vcTitle: string;
  registrarName: string;
  registrarTitle: string;
  campusAcres: number;
  totalSchools: number;
  classroomsCount: number;
  researchLabsCount: number;
  aboutText: string;
  solarCapacityMw: number;
}

export const INITIAL_MASTER_INFO: WebsiteMasterInfo = {
  universityName: 'Chanakya University',
  tagline: 'Rooted in Indian Ethos, Transformative in Vision & Global in Impact',
  address: 'Vidyaranya Global Campus, Haraluru, Devanahalli, Bengaluru, Karnataka 562110',
  admissionsHelpline: '+91 80 2990 4100 / +91 96069 98850',
  admissionsEmail: 'admissions@chanakyauniversity.edu.in',
  chancellorName: 'Prof. M. K. Sridhar',
  chancellorTitle: 'Chancellor & Chairman of Board of Governors',
  vcName: 'Prof. Yashavantha Dongre',
  vcTitle: 'Vice-Chancellor',
  registrarName: 'Dr. Sushant T. Joshi',
  registrarTitle: 'Registrar & Head of University Administration',
  campusAcres: 116,
  totalSchools: 9,
  classroomsCount: 100,
  researchLabsCount: 45,
  solarCapacityMw: 1.2,
  aboutText: 'Chanakya University is established as an autonomous global university under the Karnataka Act No. 24 of 2021. Nestled within a 116-acre sustainable green campus near Kempegowda International Airport, the university integrates foundational knowledge with futuristic technologies like AI, Clean Energy, and Cyber Law.'
};

const STORAGE_KEY = 'cu_public_website_content_v1';

export const INITIAL_NOTIFICATIONS: WebsiteNotification[] = [
  {
    id: 'notif_01',
    text: 'Admissions Open 2026-27: Apply now for B.Tech (AI & Robotics), MCA, MBA, and Ph.D. Programs at Global Campus Bengaluru.',
    linkText: 'Apply Online',
    linkUrl: '#admissions',
    badge: 'ADMISSIONS 2026',
    isActive: true,
    publishedAt: '2026-09-01'
  },
  {
    id: 'notif_02',
    text: 'Chanakya Centre for Sustainability commissions 1.2 MW Solar PV array, fulfilling over 60% of university clean energy needs.',
    linkText: 'Read Research Report',
    linkUrl: '#sustainability',
    badge: 'SUSTAINABILITY',
    isActive: true,
    publishedAt: '2026-09-03'
  },
  {
    id: 'notif_03',
    text: 'National Symposium on Generative AI and Spatial Informatics scheduled at Vidyaranya Auditorium on Oct 14, 2026.',
    linkText: 'Register Free',
    linkUrl: '#events',
    badge: 'CONFERENCE',
    isActive: true,
    publishedAt: '2026-09-05'
  }
];

export const INITIAL_EVENTS: WebsiteEvent[] = [
  {
    id: 'evt_01',
    title: 'International Green Energy & Solar Photovoltaics Conclave 2026',
    category: 'SUSTAINABILITY',
    date: 'Sep 28, 2026',
    time: '10:00 AM – 04:30 PM',
    venue: 'Centre for Sustainability Auditorium, Block 4',
    imageUrl: '/campus/videoframe_25737.png',
    description: 'Chaired by Dr. K. S. Rajeshwari, featuring keynotes from MNRE scientists on perovskite solar microgrids and industrial net-zero carbon pathways.',
    registrationLink: 'https://chanakya.edu.in/solar-conclave-2026',
    isPublished: true
  },
  {
    id: 'evt_02',
    title: 'Hack-Chanakya: 36-Hour National AI & Systems Hackathon',
    category: 'RESEARCH',
    date: 'Oct 08 – 09, 2026',
    time: '09:00 AM onwards',
    venue: 'High Performance Computing Centre, Turing Block',
    imageUrl: '/campus/videoframe_36364.png',
    description: 'Build production-ready AI applications using Chanakya NVIDIA A300 GPU clusters. Prizes worth INR 5.0 Lakhs sponsored by tech industry partners.',
    registrationLink: 'https://chanakya.edu.in/hack-chanakya',
    isPublished: true
  },
  {
    id: 'evt_03',
    title: 'Annual Convocation & Doctoral Degree Conferment Ceremony 2026',
    category: 'ACADEMIC',
    date: 'Nov 14, 2026',
    time: '11:00 AM – 01:30 PM',
    venue: 'Vidyaranya Central Amphitheatre',
    imageUrl: '/campus/videoframe_0.png',
    description: 'Presided over by the Chancellor and distinguished global scientists, awarding degrees to undergraduate, postgraduate, and PhD scholars.',
    registrationLink: 'https://chanakya.edu.in/convocation-2026',
    isPublished: true
  },
  {
    id: 'evt_04',
    title: 'Civil Services & Public Policy Leadership Summit',
    category: 'ACADEMIC',
    date: 'Oct 22, 2026',
    time: '02:00 PM – 06:00 PM',
    venue: 'Kautilya Hall of Governance',
    imageUrl: '/campus/videoframe_18482.png',
    description: 'Interactive session with senior IAS/IPS officers and alumni on Civil Services Examination Preparation (CSEP) strategies.',
    registrationLink: 'https://chanakya.edu.in/csep-summit',
    isPublished: true
  }
];

export const INITIAL_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide_01',
    title: '116-Acre Global Residential Campus',
    subtitle: 'Near Kempegowda International Airport, Devanahalli, Bengaluru. World-class learning infrastructure designed for transformative leaders.',
    imageUrl: '/campus/videoframe_0.png',
    badge: 'WORLD-CLASS CAMPUS',
    ctaText: 'Explore Campus',
    ctaLink: '#campus'
  },
  {
    id: 'slide_02',
    title: 'Chanakya Centre for Sustainability',
    subtitle: 'Over 60% of university electricity generated via campus 1.2 MW rooftop Solar PV systems with advanced microgrid storage.',
    imageUrl: '/campus/videoframe_25737.png',
    badge: 'NET-ZERO CLEAN ENERGY',
    ctaText: 'Solar Research',
    ctaLink: '#sustainability'
  },
  {
    id: 'slide_03',
    title: 'Vidyaranya Central Library & IEEE Archives',
    subtitle: 'A knowledge sanctuary housing extensive physical collections, IEEE Xplore, ACM Digital Library, and Springer Nature journals.',
    imageUrl: '/campus/videoframe_1848.png',
    badge: 'KNOWLEDGE COMMONS',
    ctaText: 'Digital Archive',
    ctaLink: '#library'
  },
  {
    id: 'slide_04',
    title: 'High-Performance NVIDIA GPU Computing Lab',
    subtitle: 'Supercomputing infrastructure driving experimental and computational research across AI, Robotics, and Computational Biology.',
    imageUrl: '/campus/videoframe_36364.png',
    badge: 'NEXT-GEN STEM',
    ctaText: 'View Labs',
    ctaLink: '#labs'
  },
  {
    id: 'slide_05',
    title: 'Jnana, Ichha, Kriya — Ancient Wisdom & Modern STEM',
    subtitle: 'Rooted in Indian traditions and universal values, nurturing transformative leaders across 6 specialized academic schools.',
    imageUrl: '/campus/videoframe_10723.png',
    badge: 'MULTIDISCIPLINARY EXCELLENCE',
    ctaText: 'View Programs',
    ctaLink: '#programs'
  }
];

class WebsiteContentService {
  private notifications: WebsiteNotification[] = [];
  private events: WebsiteEvent[] = [];
  private slides: HeroSlide[] = [];
  private masterInfo: WebsiteMasterInfo = INITIAL_MASTER_INFO;

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.notifications = parsed.notifications || INITIAL_NOTIFICATIONS;
        this.events = parsed.events || INITIAL_EVENTS;
        this.slides = parsed.slides || INITIAL_HERO_SLIDES;
        this.masterInfo = parsed.masterInfo || INITIAL_MASTER_INFO;
      } else {
        this.notifications = INITIAL_NOTIFICATIONS;
        this.events = INITIAL_EVENTS;
        this.slides = INITIAL_HERO_SLIDES;
        this.masterInfo = INITIAL_MASTER_INFO;
        this.saveData();
      }
    } catch {
      this.notifications = INITIAL_NOTIFICATIONS;
      this.events = INITIAL_EVENTS;
      this.slides = INITIAL_HERO_SLIDES;
      this.masterInfo = INITIAL_MASTER_INFO;
    }
  }

  private saveData(): void {
    try {
      const payload = {
        notifications: this.notifications,
        events: this.events,
        slides: this.slides,
        masterInfo: this.masterInfo
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      
      // Sync to Firestore / Cloud Storage when configured
      dbStorageService.saveRecord('website_content', 'master', payload);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('chanakya_website_content_updated'));
      }
    } catch (e) {
      console.error('Failed to save website content to localStorage', e);
    }
  }

  // Master Information
  public getMasterInfo(): WebsiteMasterInfo {
    return { ...this.masterInfo };
  }

  public updateMasterInfo(updated: Partial<WebsiteMasterInfo>): void {
    this.masterInfo = { ...this.masterInfo, ...updated };
    this.saveData();
  }

  // Notifications
  public getNotifications(): WebsiteNotification[] {
    return [...this.notifications];
  }

  public getActiveNotifications(): WebsiteNotification[] {
    return this.notifications.filter(n => n.isActive);
  }

  public addNotification(notif: Omit<WebsiteNotification, 'id' | 'publishedAt'>): void {
    const newNotif: WebsiteNotification = {
      ...notif,
      id: `notif_${Date.now()}`,
      publishedAt: new Date().toISOString().slice(0, 10)
    };
    this.notifications = [newNotif, ...this.notifications];
    this.saveData();
  }

  public toggleNotification(id: string): void {
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, isActive: !n.isActive } : n);
    this.saveData();
  }

  public deleteNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveData();
  }

  // Events
  public getEvents(): WebsiteEvent[] {
    return [...this.events];
  }

  public getPublishedEvents(): WebsiteEvent[] {
    return this.events.filter(e => e.isPublished);
  }

  public addEvent(evt: Omit<WebsiteEvent, 'id'>): void {
    const newEvt: WebsiteEvent = {
      ...evt,
      id: `evt_${Date.now()}`
    };
    this.events = [newEvt, ...this.events];
    this.saveData();
  }

  public toggleEventPublish(id: string): void {
    this.events = this.events.map(e => e.id === id ? { ...e, isPublished: !e.isPublished } : e);
    this.saveData();
  }

  public deleteEvent(id: string): void {
    this.events = this.events.filter(e => e.id !== id);
    this.saveData();
  }

  // Hero Slides
  public getHeroSlides(): HeroSlide[] {
    return [...this.slides];
  }

  public addHeroSlide(slide: Omit<HeroSlide, 'id'>): void {
    const newSlide: HeroSlide = {
      ...slide,
      id: `slide_${Date.now()}`
    };
    this.slides = [...this.slides, newSlide];
    this.saveData();
  }

  public deleteHeroSlide(id: string): void {
    this.slides = this.slides.filter(s => s.id !== id);
    this.saveData();
  }
}

export const websiteContentService = new WebsiteContentService();
export default websiteContentService;
