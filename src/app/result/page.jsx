"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import axios from "axios";

function ResultContent() {
  const searchParams = useSearchParams();
  const sample = searchParams.get("sample");
  const uploaded = searchParams.get("uploaded");
  const [loading, setLoading] = useState(true);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const response = await axios.post("/api/compare", {
          sampleUrl: sample,
          uploadedUrl: uploaded,
        });
        setComparisonResult(response.data);
      } catch (error) {
        console.error("Error fetching comparison:", error);
        setError(error.response?.data?.message || "An error occurred while loading the comparison data.");
      } finally {
        setLoading(false);
      }
    };

    if (sample && uploaded) {
      fetchComparison();
    } else {
      setError("Missing sample or uploaded document URL.");
      setLoading(false);
    }
  }, [sample, uploaded]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="lg:text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse">
                Analyzing Documents...
              </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-10 bg-neutral-950 text-white">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-200 mb-2">Analysis Error</h3>
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ScoreIndicator = ({ score }) => {
    const getScoreColor = (score) => {
      if (score >= 80) return "text-green-400";
      if (score >= 60) return "text-yellow-400";
      return "text-red-400";
    };

    return (
      <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
        {score}%
      </div>
    );
  };

  return (
    <div className="p-6 md:p-10 bg-neutral-950 text-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Document Comparison Results</h1>

        {/* Score Card */}
        <div className="bg-neutral-900/50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-3">Similarity Score</h2>
          <ScoreIndicator score={comparisonResult?.match_score || 0} />
        </div>

        {/* Differences */}
        <div className="grid gap-6 mb-8">
          {/* Missing Content */}
          <div className="bg-neutral-900/50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-6 h-6 text-red-400" />
              <h2 className="text-xl font-semibold">Missing Content</h2>
            </div>
            {comparisonResult?.differences?.missing_content?.length > 0 ? (
              <ul className="space-y-2">
                {comparisonResult.differences.missing_content.map((item, index) => (
                  <li key={index} className="flex items-center text-red-400">
                    <span className="mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No missing content detected</p>
            )}
          </div>

          {/* Additional Content */}
          <div className="bg-neutral-900/50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-semibold">Additional Content</h2>
            </div>
            {comparisonResult?.differences?.additional_content?.length > 0 ? (
              <ul className="space-y-2">
                {comparisonResult.differences.additional_content.map((item, index) => (
                  <li key={index} className="flex items-center text-yellow-400">
                    <span className="mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No additional content detected</p>
            )}
          </div>

          {/* Formatting Issues */}
          <div className="bg-neutral-900/50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold">Formatting Issues</h2>
            </div>
            {comparisonResult?.differences?.formatting_issues?.length > 0 ? (
              <ul className="space-y-2">
                {comparisonResult.differences.formatting_issues.map((item, index) => (
                  <li key={index} className="flex items-center text-blue-400">
                    <span className="mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No formatting issues detected</p>
            )}
          </div>
        </div>

        {/* Improvement Suggestions */}
        <div className="bg-neutral-900/50 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-semibold">Improvement Suggestions</h2>
          </div>
          {comparisonResult?.feedback?.length > 0 ? (
            <ul className="space-y-3">
              {comparisonResult.feedback.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No improvement suggestions available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-neutral-950">Loading...</div>}>
      <ResultContent />
    </Suspense>
  );
}