import { Lightbulb, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { analyzeSEO } from '../lib/seoUtils';

export default function SEOScorePanel({ title, metaDescription, content, focusKeyword }) {
  const analysis = analyzeSEO(title, metaDescription, content, focusKeyword);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 60) return 'Needs Work';
    return 'Poor';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">SEO Score</h3>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getScoreBgColor(analysis.score)}`}>
            <TrendingUp className={`w-4 h-4 ${getScoreColor(analysis.score)}`} />
            <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
              {analysis.score}
            </span>
            <span className={`text-sm font-medium ${getScoreColor(analysis.score)}`}>
              / 100
            </span>
          </div>
        </div>
        <p className={`text-sm font-medium ${getScoreColor(analysis.score)}`}>
          {getScoreLabel(analysis.score)}
        </p>
      </div>

      {analysis.issues.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            Issues ({analysis.issues.length})
          </h4>
          <ul className="space-y-2">
            {analysis.issues.map((issue, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-red-500 mt-0.5">•</span>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.recommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-500" />
            Recommendations
          </h4>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Tips</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-gray-400">•</span>
            <span>Use your focus keyword in the first paragraph</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400">•</span>
            <span>Include internal links to related content</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400">•</span>
            <span>Add alt text to all images</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400">•</span>
            <span>Keep sentences short and readable</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
