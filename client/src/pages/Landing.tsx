import { Link } from "wouter";
import { BookOpen, Search, GraduationCap, ArrowRight, Library, Globe, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="font-display font-bold text-xl text-slate-900">E-Biblio UPC</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/api/login">
                <button className="text-slate-600 hover:text-primary font-medium text-sm px-4 py-2 transition-colors">
                  Sign In
                </button>
              </Link>
              <Link href="/api/login">
                <button className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 opacity-10">
          <svg width="800" height="800" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#2563EB" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-4.9C93.5,9.3,82.2,22.9,71.3,34.3C60.4,45.7,49.9,54.9,38.3,62.8C26.7,70.7,14,77.3,0.4,76.6C-13.2,75.9,-25.6,67.9,-36.4,59.3C-47.2,50.7,-56.4,41.5,-64.3,30.5C-72.2,19.5,-78.8,6.7,-77.8,-5.6C-76.8,-17.9,-68.2,-29.7,-58.5,-39.8C-48.8,-49.9,-38,-58.3,-26.3,-66.8C-14.6,-75.3,-2,-83.9,11.9,-85.2C25.8,-86.5,30.5,-75.6,44.7,-76.4Z" transform="translate(100 100)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-6xl font-display font-bold text-slate-900 tracking-tight mb-6"
            >
              Your Gateway to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Infinite Knowledge</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-slate-600 mb-10 leading-relaxed"
            >
              Access thousands of books, articles, and academic resources from OpenLibrary, DOAJ, and our internal collections. Designed for the scholars of tomorrow.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center gap-4"
            >
              <Link href="/api/login">
                <button className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  Explore Library <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl mb-3">Global Resources</h3>
              <p className="text-slate-600">Instantly search and access materials from OpenLibrary, DOAJ, Persée, and more.</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl mb-3">Academic Growth</h3>
              <p className="text-slate-600">Curated collections for students and professors to support research and learning.</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl mb-3">Collaborative</h3>
              <p className="text-slate-600">Students and professors can submit resources for approval, building a living library.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-white text-lg">E-Biblio UPC</span>
          </div>
          <div className="text-sm">
            © {new Date().getFullYear()} E-Biblio UPC. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
