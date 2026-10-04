import React, { useState } from 'react';
import { Video, Mic, FileText, CheckCircle2, Star, Sparkles, Clock, AlertCircle } from 'lucide-react';

export const PresentAiView: React.FC = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  const handleRunAiEvaluation = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setEvaluation({
        contentScore: 18.5,
        deliveryScore: 17.0,
        qaScore: 18.0,
        timeScore: 19.0,
        totalScore: 72.5,
        maxTotal: 80,
        grade: 'Distinction (A+)',
        transcriptSample: '"Good afternoon examiners, today our team is presenting the UniSphere distributed architecture..."',
        strengths: 'Clear structural narrative, accurate explanation of PostgreSQL database-per-service isolation, confident voice modulation.',
        improvements: 'Pacing was slightly hurried during the Judge0 sandbox slide. Recommend pausing before switching slides.'
      });
      setAnalyzing(false);
    }, 1000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cu-border pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cu-pill text-cu-navy text-xs font-semibold mb-1">
            <Video size={13} />
            <span>PresentAI Module 05</span>
          </div>
          <h2 className="text-2xl font-bold text-cu-navy">AI-Evaluated Presentation & Viva System</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            WebRTC oral presentation rooms, speech transcription, slide analysis, and Gemini AI rubric assessment.
          </p>
        </div>

        <button 
          onClick={handleRunAiEvaluation}
          disabled={analyzing}
          className="bg-cu-navy hover:bg-cu-navylight text-white text-xs font-semibold px-4 py-2 rounded-lg shadow transition flex items-center gap-1.5"
        >
          <Sparkles size={14} className="text-cu-gold" />
          <span>{analyzing ? 'Evaluating Transcript...' : 'Trigger AI Speech & Slide Audit'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Presentation Session Card */}
        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-3">
          <div className="text-xs text-cu-saffron font-bold uppercase tracking-wider">MCA Viva-Voce Room #04</div>
          <h3 className="font-bold text-base text-cu-navy">MCA301 Final Major Project Defense</h3>
          <p className="text-xs text-gray-600">Presenter: Arjun Kumar (24MCA003)</p>
          <div className="bg-gray-100 rounded-lg h-40 flex items-center justify-center border border-gray-200 text-gray-400 text-xs">
            [WebRTC MinIO Video Playback: 14m 28s]
          </div>
        </div>

        {/* Rubric Evaluation Results */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-cu-navy">AI-Assisted Rubric Marks (Gemini 1.5 Pro)</h3>
          {evaluation ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500">Content</div>
                  <div className="text-lg font-bold text-cu-navy">{evaluation.contentScore}/20</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500">Delivery</div>
                  <div className="text-lg font-bold text-cu-navy">{evaluation.deliveryScore}/20</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500">Viva Q&A</div>
                  <div className="text-lg font-bold text-cu-navy">{evaluation.qaScore}/20</div>
                </div>
                <div className="bg-cu-navy text-white p-3 rounded-lg">
                  <div className="text-xs text-cu-gold">Total Score</div>
                  <div className="text-lg font-bold">{evaluation.totalScore}/{evaluation.maxTotal}</div>
                </div>
              </div>

              <div className="text-xs text-gray-700 space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div><strong>Verbatim Transcript:</strong> <span className="italic">{evaluation.transcriptSample}</span></div>
                <div><strong>AI Qualitative Critique:</strong> {evaluation.strengths}</div>
                <div><strong>Correction Areas:</strong> {evaluation.improvements}</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-gray-400">
              Click 'Trigger AI Speech & Slide Audit' above to evaluate speech audio and presentation deck.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default PresentAiView;
