import React from 'react';
import {
  GraduationCap, CheckCircle2, ArrowRight, FileText,
  Shield, Clock, Award, Users
} from 'lucide-react';
import { SharedLandingPageProps } from './LandingHomePage';

const PROCESS_STEPS = [
  { step: '01', title: 'Online Application', desc: 'Submit your application via the UniSphere portal. Fill personal details, academic history, and choose your programme.' },
  { step: '02', title: 'Document Verification', desc: 'Upload certified copies of mark sheets, ID proof, category certificate, and migration certificate for verification.' },
  { step: '03', title: 'Entrance / Merit Review', desc: 'CUET scores, Board merit rank, or departmental entrance test results evaluated by the Admissions Committee.' },
  { step: '04', title: 'Offer Letter & Fee Payment', desc: 'Shortlisted candidates receive a digital offer letter. Confirm your seat by paying the semester fee within 7 days.' },
];

const UG_PROGRAMS = [
  { name: 'B.Tech in Computer Science & Engineering', seats: 120, fee: '1,80,000 / year', duration: '4 Years' },
  { name: 'B.Tech in Artificial Intelligence & Data Science', seats: 60, fee: '1,80,000 / year', duration: '4 Years' },
  { name: 'Bachelor of Computer Applications (BCA)', seats: 60, fee: '90,000 / year', duration: '3 Years' },
  { name: 'B.A. LL.B. (Honours)', seats: 60, fee: '1,20,000 / year', duration: '5 Years' },
  { name: 'B.B.A. LL.B. (Honours)', seats: 60, fee: '1,20,000 / year', duration: '5 Years' },
  { name: 'Bachelor of Business Administration (BBA)', seats: 90, fee: '85,000 / year', duration: '3 Years' },
];

const PG_PROGRAMS = [
  { name: 'Master of Computer Applications (MCA)', seats: 60, fee: '1,20,000 / year', duration: '2 Years' },
  { name: 'Master of Business Administration (MBA)', seats: 60, fee: '1,50,000 / year', duration: '2 Years' },
  { name: 'M.Sc. in Biotechnology & Bioinformatics', seats: 30, fee: '95,000 / year', duration: '2 Years' },
  { name: 'Master of Public Policy (MPP)', seats: 30, fee: '1,10,000 / year', duration: '2 Years' },
  { name: 'M.Sc. in Applied Mathematics', seats: 30, fee: '75,000 / year', duration: '2 Years' },
];

export const LandingAdmissionsPage: React.FC<SharedLandingPageProps> = ({ onApplyUG, onApplyPG, onOpenLogin }) => (
  <div className="flex flex-col">
    {/* Hero */}
    <section className="bg-gradient-to-r from-cu-navydark to-cu-navy text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center space-y-5">
        <span className="inline-block px-3 py-1 rounded-full bg-cu-gold/20 border border-cu-gold/40 text-cu-gold text-xs font-bold uppercase tracking-wider">
          Admissions 2026-27 Open
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold">
          Begin Your Journey at <span className="text-cu-gold">Chanakya University</span>
        </h1>
        <p className="text-sm text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Applications are now open for UG, PG, and Ph.D. programmes across all 6 Schools of Excellence. Join India's foremost NEP 2020 exemplar university.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <button onClick={onApplyUG}
            className="bg-cu-saffron hover:bg-cu-saffronlight text-white font-bold px-8 py-3.5 rounded-lg shadow-lg transition flex items-center gap-2">
            <GraduationCap size={16} />
            Apply for UG Programme
            <ArrowRight size={15} />
          </button>
          <button onClick={onApplyPG}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold px-8 py-3.5 rounded-lg shadow transition flex items-center gap-2">
            <GraduationCap size={16} />
            Apply for PG Programme
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>

    {/* Key facts */}
    <section className="bg-cu-navy border-t border-b border-cu-gold/20 py-8 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          { Icon: Users, val: '40+', label: 'Programmes Available' },
          { Icon: Award, val: '100%', label: 'Scholarship Eligible Students' },
          { Icon: Clock, val: '7 Days', label: 'Seat Confirmation Window' },
          { Icon: Shield, val: 'DPDP 2023', label: 'Data Privacy Compliant' },
        ].map(({ Icon, val, label }) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <Icon size={20} className="text-cu-gold" />
            <div className="font-serif text-2xl font-bold text-cu-gold">{val}</div>
            <div className="text-xs text-gray-300 uppercase tracking-wider font-semibold">{label}</div>
          </div>
        ))}
      </div>
    </section>

    {/* Admission Process */}
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        <div className="text-center">
          <span className="text-xs font-bold text-cu-saffron uppercase tracking-widest">How to Apply</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-cu-navy mt-1">Admission Process</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROCESS_STEPS.map((s) => (
            <div key={s.step} className="bg-white p-6 rounded-xl border border-cu-border shadow-sm space-y-3 relative">
              <div className="font-serif text-4xl font-bold text-cu-gold/25 absolute top-4 right-5">{s.step}</div>
              <div className="w-10 h-10 rounded-full bg-cu-navy text-white flex items-center justify-center font-bold text-sm">{s.step}</div>
              <h3 className="font-serif font-bold text-cu-navy">{s.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* UG Programmes table */}
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <h2 className="font-serif text-2xl font-bold text-cu-navy">Undergraduate (UG) Programmes</h2>
        <div className="overflow-x-auto rounded-xl border border-cu-border shadow-sm">
          <table className="w-full text-xs">
            <thead className="bg-cu-navy text-white">
              <tr>
                <th className="p-4 text-left font-bold">Programme</th>
                <th className="p-4 text-center font-bold">Intake Seats</th>
                <th className="p-4 text-center font-bold">Duration</th>
                <th className="p-4 text-center font-bold">Annual Fee (INR)</th>
                <th className="p-4 text-center font-bold">Apply</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {UG_PROGRAMS.map(p => (
                <tr key={p.name} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-semibold text-cu-navy">{p.name}</td>
                  <td className="p-4 text-center text-gray-600">{p.seats}</td>
                  <td className="p-4 text-center text-gray-600">{p.duration}</td>
                  <td className="p-4 text-center font-mono text-cu-navy font-bold">{p.fee}</td>
                  <td className="p-4 text-center">
                    <button onClick={onApplyUG}
                      className="bg-cu-navy text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-cu-navylight transition">
                      Apply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="font-serif text-2xl font-bold text-cu-navy pt-4">Postgraduate (PG) Programmes</h2>
        <div className="overflow-x-auto rounded-xl border border-cu-border shadow-sm">
          <table className="w-full text-xs">
            <thead className="bg-cu-navy text-white">
              <tr>
                <th className="p-4 text-left font-bold">Programme</th>
                <th className="p-4 text-center font-bold">Intake Seats</th>
                <th className="p-4 text-center font-bold">Duration</th>
                <th className="p-4 text-center font-bold">Annual Fee (INR)</th>
                <th className="p-4 text-center font-bold">Apply</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {PG_PROGRAMS.map(p => (
                <tr key={p.name} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-semibold text-cu-navy">{p.name}</td>
                  <td className="p-4 text-center text-gray-600">{p.seats}</td>
                  <td className="p-4 text-center text-gray-600">{p.duration}</td>
                  <td className="p-4 text-center font-mono text-cu-navy font-bold">{p.fee}</td>
                  <td className="p-4 text-center">
                    <button onClick={onApplyPG}
                      className="bg-cu-saffron text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-cu-saffronlight transition">
                      Apply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Documents required */}
        <div className="bg-gray-50 rounded-xl border border-cu-border p-6 space-y-4">
          <h3 className="font-serif font-bold text-cu-navy">Documents Required for Application</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              'Class X & XII Mark Sheets (certified copies)',
              'Degree Certificate / Provisional Certificate (for PG)',
              'Aadhar Card / Passport (Government ID)',
              'Category Certificate (SC / ST / OBC / EWS if applicable)',
              'Migration Certificate (if applicable)',
              'Passport-size photograph (recent, white background)',
              'CUET Score Card (if applicable)',
              'Income Certificate (for scholarship consideration)',
            ].map(doc => (
              <div key={doc} className="flex items-center gap-2 text-xs text-gray-700">
                <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                <span>{doc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default LandingAdmissionsPage;
