"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Trash2,
  Download,
  Calendar,
  Building,
  FileText,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit,
  Copy,
  Eye,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ToastGlobal";

interface CoverLetter {
  id: string;
  title: string;
  company: string;
  created_at: string;
  updated_at: string;
  meta?: any;
}

interface CoverLettersPageClientProps {
  initialCoverLetters: CoverLetter[];
  totalCount: number;
}

export default function CoverLettersPageClient({ 
  initialCoverLetters, 
  totalCount 
}: CoverLettersPageClientProps) {
  const toast = useToast();
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>(initialCoverLetters);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"updated_at" | "created_at" | "title" | "company">("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  const itemsPerPage = 20;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Filter and sort cover letters
  const filteredLetters = useMemo(() => {
    let filtered = coverLetters.filter(letter => 
      letter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "company":
          aValue = a.company.toLowerCase();
          bValue = b.company.toLowerCase();
          break;
        case "created_at":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [coverLetters, searchTerm, sortBy, sortOrder]);

  const loadPage = async (page: number) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      
      if (!auth?.user) return;

      const offset = (page - 1) * itemsPerPage;
      
      const { data, error } = await supabase
        .from("cover_letters")
        .select("id, title, company, created_at, updated_at, meta")
        .eq("user_id", auth.user.id)
        .order(sortBy, { ascending: sortOrder === "asc" })
        .range(offset, offset + itemsPerPage - 1);

      if (error) {
        console.error("Error loading cover letters:", error);
        toast.show({ message: "Failed to load cover letters" });
        return;
      }

      setCoverLetters(data || []);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error loading cover letters:", error);
      toast.show({ message: "Failed to load cover letters" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      
      if (!auth?.user) return;

      const { error } = await supabase
        .from("cover_letters")
        .delete()
        .eq("id", id)
        .eq("user_id", auth.user.id);

      if (error) {
        console.error("Error deleting cover letter:", error);
        toast.show({ message: "Failed to delete cover letter" });
        return;
      }

      setCoverLetters(prev => prev.filter(letter => letter.id !== id));
      toast.show({ message: "Cover letter deleted successfully" });
    } catch (error) {
      console.error("Error deleting cover letter:", error);
      toast.show({ message: "Failed to delete cover letter" });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLetters.length === 0) return;

    try {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      
      if (!auth?.user) return;

      const { error } = await supabase
        .from("cover_letters")
        .delete()
        .in("id", selectedLetters)
        .eq("user_id", auth.user.id);

      if (error) {
        console.error("Error deleting cover letters:", error);
        toast.show({ message: "Failed to delete cover letters" });
        return;
      }

      setCoverLetters(prev => prev.filter(letter => !selectedLetters.includes(letter.id)));
      setSelectedLetters([]);
      toast.show({ message: `${selectedLetters.length} cover letters deleted successfully` });
    } catch (error) {
      console.error("Error deleting cover letters:", error);
      toast.show({ message: "Failed to delete cover letters" });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedLetters(prev => 
      prev.includes(id) 
        ? prev.filter(letterId => letterId !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedLetters(filteredLetters.map(letter => letter.id));
  };

  const clearSelection = () => {
    setSelectedLetters([]);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cover Letters</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {totalCount} cover letter{totalCount !== 1 ? 's' : ''} total
              </p>
            </div>
            
            <Link href="/Dashboard/Coverletters/new">
              <Button className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-violet-500 hover:from-emerald-600 hover:to-violet-600 text-white border-0">
                <FileText className="h-4 w-4" />
                New Cover Letter
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by title or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="updated_at">Last Modified</option>
                  <option value="created_at">Date Created</option>
                  <option value="title">Title</option>
                  <option value="company">Company</option>
                </select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </Button>
              </div>

              {/* View Mode */}
              <div className="flex gap-1 border border-gray-300 rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedLetters.length > 0 && (
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-700">
                    {selectedLetters.length} cover letter{selectedLetters.length !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                    >
                      Clear Selection
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete Selected
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cover Letters */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredLetters.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No cover letters found" : "No cover letters yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? "Try adjusting your search terms" 
                  : "Create your first cover letter to get started"
                }
              </p>
              {!searchTerm && (
                <Link href="/Dashboard/Coverletters/new">
                  <Button className="bg-gradient-to-r from-emerald-500 to-violet-500 hover:from-emerald-600 hover:to-violet-600 text-white border-0">
                    <FileText className="h-4 w-4 mr-2" />
                    Create Cover Letter
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === "grid" ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredLetters.map((letter) => (
                  <Card key={letter.id} className="hover-lift group h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4 h-full flex flex-col">
                      {/* Header with checkbox and delete */}
                      <div className="flex items-start justify-between mb-3">
                        <input
                          type="checkbox"
                          checked={selectedLetters.includes(letter.id)}
                          onChange={() => toggleSelect(letter.id)}
                          className="rounded border-gray-300 mt-1"
                        />
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(letter.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Title and Company */}
                      <div className="flex-1 mb-3">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight mb-2 line-clamp-2">
                          {letter.title || 'Untitled Cover Letter'}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Building className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{letter.company || 'Unknown Company'}</span>
                        </div>
                      </div>
                      
                      {/* Dates */}
                      <div className="space-y-1 mb-4">
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span>Created {formatDate(letter.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span>Modified {formatDate(letter.updated_at)}</span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="mt-auto">
                        <Link href={`/Dashboard/Coverletters/${letter.id}`} className="block">
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit Cover Letter
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* List View */
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredLetters.map((letter) => (
                      <div key={letter.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={selectedLetters.includes(letter.id)}
                              onChange={() => toggleSelect(letter.id)}
                              className="rounded border-gray-300"
                            />
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                {letter.title || 'Untitled Cover Letter'}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <div className="flex items-center gap-1">
                                  <Building className="h-3 w-3" />
                                  <span>{letter.company || 'Unknown Company'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Created {formatDate(letter.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Modified {formatDate(letter.updated_at)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/Dashboard/Coverletters/${letter.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(letter.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} cover letters
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => loadPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
