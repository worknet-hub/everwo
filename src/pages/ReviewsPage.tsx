import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const questions = [
  'How easy is it to navigate the website?',
  'How visually appealing is the design?',
  'How satisfied are you with the website performance?',
  'How likely are you to recommend this website to others?'
];

// const avatarUrl = '/logo.png'; // Logo removed

const ReviewsPage: React.FC = () => {
  const [ratings, setRatings] = useState<number[]>(Array(questions.length).fill(0));
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleStarClick = (star: number) => {
    const newRatings = [...ratings];
    newRatings[step] = star;
    setRatings(newRatings);
    // Animate to next step after a short delay
    setTimeout(() => {
      if (step < questions.length - 1) setStep(step + 1);
    }, 200);
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleClose = () => {
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Save review to Supabase
    const { error } = await supabase.from('reviews').insert({
      ratings,
      feedback,
      created_at: new Date().toISOString(),
    });
    setLoading(false);
    if (error) {
      setError('Failed to submit review. Please try again.');
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100/60 via-purple-100/60 to-pink-100/60 dark:from-[#18181b] dark:via-[#23232b] dark:to-[#18181b] fade-in">
        <div className="max-w-xl w-full relative p-8 bg-white/90 dark:bg-[#18181b]/90 rounded-2xl shadow-2xl text-center">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          {/* <img src={avatarUrl} alt="Logo" className="mx-auto mb-4 rounded-full w-16 h-16 shadow-lg" /> */}
          <h2 className="text-3xl font-bold mb-2">Thank you for your feedback! 🎉</h2>
          <p className="mb-4">Your review helps us improve the website.</p>
          <div className="flex flex-col items-center gap-2 mb-2">
            {questions.map((q, idx) => (
              <div key={q} className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-200">{q}</span>
                <span className="flex">
                  {[1,2,3,4,5].map(star => (
                    <span key={star} className={`text-lg ${ratings[idx] >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-700'}`}>★</span>
                  ))}
                </span>
              </div>
            ))}
          </div>
          {feedback && (
            <div className="bg-gray-100 dark:bg-[#23232b] rounded-lg p-3 mt-2 text-left text-gray-700 dark:text-gray-200">
              <span className="font-semibold">Your feedback:</span>
              <div className="mt-1 whitespace-pre-line">{feedback}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100/60 via-purple-100/60 to-pink-100/60 dark:from-[#18181b] dark:via-[#23232b] dark:to-[#18181b] fade-in">
        <div className="max-w-xl w-full relative p-8 bg-white/90 dark:bg-[#18181b]/90 rounded-2xl shadow-2xl fade-in">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          {/* <img src={avatarUrl} alt="Logo" className="mx-auto mb-4 rounded-full w-16 h-16 shadow-lg" /> */}
          <h1 className="text-3xl font-bold mb-2 text-center">Website Review</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">We value your feedback! Please rate your experience below.</p>
          <form onSubmit={handleSubmit}>
            {/* Step/Progress Indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {questions.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 w-8 rounded-full transition-all duration-300 ${
                    idx === step ? 'bg-indigo-500 dark:bg-indigo-400 scale-110' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
            {/* Question Stepper */}
            <div className="mb-8">
              <label className="block mb-2 font-medium text-gray-900 dark:text-gray-100 text-lg text-center">
                {questions[step]}
              </label>
              <div className="flex items-center justify-center space-x-2 mt-2">
                {[1,2,3,4,5].map(star => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => handleStarClick(star)}
                    className={`text-4xl focus:outline-none transition-transform duration-150 ${ratings[step] >= star ? 'text-yellow-400 scale-125' : 'text-gray-300 dark:text-gray-700 hover:scale-110'}`}
                    aria-label={`Rate ${star} stars`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-4">
                <Button type="button" variant="ghost" onClick={handlePrev} disabled={step === 0} className="text-gray-500 dark:text-gray-300 disabled:opacity-50">Previous</Button>
                {step < questions.length - 1 && (
                  <Button type="button" variant="secondary" onClick={() => setStep(step + 1)} disabled={ratings[step] === 0}>
                    Next
                  </Button>
                )}
              </div>
            </div>
            {/* Feedback and Submit only on last step */}
            {step === questions.length - 1 && (
              <>
                <div className="mb-6">
                  <label className="block mb-2 font-medium text-gray-900 dark:text-gray-100">Additional Feedback</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-[#23232b] dark:text-gray-100 transition-shadow"
                    rows={4}
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="Let us know your thoughts..."
                  />
                </div>
                <Button type="submit" className="w-full py-3 text-lg font-semibold" disabled={loading || ratings.some(r => r === 0)}>
                  {loading ? 'Submitting...' : 'Submit Review'}
                </Button>
                {error && <div className="mt-2 text-red-500 text-center">{error}</div>}
              </>
            )}
          </form>
        </div>
      </div>
      <style>{`
        .fade-in { animation: fadeIn 0.7s; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
      `}</style>
    </>
  );
};

export default ReviewsPage; 