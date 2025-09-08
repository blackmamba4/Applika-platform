"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, FileText, Calendar, ChevronDown, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface RecentCoverLetter {
  id: string;
  title: string;
  company: string;
  created_at: string;
  updated_at: string;
}

export default function RecentCard() {
  const [recentLetters, setRecentLetters] = useState<RecentCoverLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentLetters();
  }, []);

  const fetchRecentLetters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const supabase = createClient();
      
      // Get current user
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth?.user) {
        setError('Not authenticated');
        return;
      }
      
      const { data, error } = await supabase
        .from('cover_letters')
        .select('id, title, company, created_at, updated_at')
        .eq('user_id', auth.user.id)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching cover letters:', error);
        setError('Failed to load recent cover letters');
        return;
      }

      setRecentLetters(data || []);
    } catch (err) {
      console.error('Error fetching cover letters:', err);
      setError('Failed to load recent cover letters');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      
      // Get current user
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth?.user) {
        console.error('Not authenticated');
        return;
      }
      
      const { error } = await supabase
        .from('cover_letters')
        .delete()
        .eq('id', id)
        .eq('user_id', auth.user.id);

      if (error) {
        console.error('Error deleting cover letter:', error);
        return;
      }

      // Remove from local state
      setRecentLetters(prev => prev.filter(letter => letter.id !== id));
    } catch (err) {
      console.error('Error deleting cover letter:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Recent Cover Letters
          </h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-4 hover-lift">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Recent Cover Letters
        </h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>
      
      {!isCollapsed && (
        <>
          {error ? (
            <div className="text-center py-4 text-red-600">
              <p className="text-sm">{error}</p>
              <button
                onClick={fetchRecentLetters}
                className="text-xs underline mt-1 hover:no-underline"
              >
                Try again
              </button>
            </div>
          ) : recentLetters.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No cover letters yet</p>
              <p className="text-xs">Create your first one above!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentLetters.map((letter) => (
                <div
                  key={letter.id}
                  className={`group flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer hover:shadow-sm ${
                    selectedId === letter.id 
                      ? "border-emerald-300 bg-emerald-50" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedId(letter.id)}
                >
                  <Link 
                    href={`/Dashboard/Coverletters/${letter.id}`}
                    className="flex-1 min-w-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {letter.title || 'Untitled Cover Letter'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{letter.company || 'Unknown Company'}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(letter.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(letter.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 text-red-600 transition-all"
                    title="Delete cover letter"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
