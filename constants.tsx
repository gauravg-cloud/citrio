import React from 'react';
import { 
  BarChart3, 
  Globe, 
  Search, 
  FileText, 
  Send, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  Target,
  Share2,
  Mail,
  Loader2,
  Plus,
  Trash2,
  ChevronRight,
  LayoutDashboard,
  Zap,
  Bot,
  ArrowRight,
  Edit2,
  Filter,
  Eye,
  AlertCircle,
  RefreshCcw,
  Download,
  ExternalLink,
  Maximize2,
  ChevronDown,
  X,
  Hash,
  Sparkles,
  BarChart,
  Layers,
  Copy
} from 'lucide-react';

export const ICONS = {
  Dashboard: <LayoutDashboard size={20} />,
  Chart: <BarChart3 size={20} />,
  Globe: <Globe size={20} />,
  Search: <Search size={20} />,
  File: <FileText size={20} />,
  Send: <Send size={20} />,
  Check: <CheckCircle2 size={16} className="text-white" />, // Updated for contrast
  CheckGreen: <CheckCircle2 size={16} className="text-citrio-green" />,
  X: <XCircle size={16} className="text-rose-500" />,
  Trend: <TrendingUp size={20} />,
  Target: <Target size={20} />,
  Share: <Share2 size={20} />,
  Mail: <Mail size={16} />,
  Loading: <Loader2 size={24} className="animate-spin" />,
  Plus: <Plus size={16} />,
  Trash: <Trash2 size={16} />,
  ArrowRight: <ArrowRight size={16} />,
  ChevronRight: <ChevronRight size={16} />,
  ChevronDown: <ChevronDown size={16} />,
  Zap: <Zap size={20} />,
  Bot: <Bot size={20} />,
  Edit: <Edit2 size={16} />,
  Filter: <Filter size={16} />,
  Eye: <Eye size={16} />,
  Alert: <AlertCircle size={16} />,
  Refresh: <RefreshCcw size={16} />,
  Download: <Download size={16} />,
  External: <ExternalLink size={14} />,
  Maximize: <Maximize2 size={16} />,
  Close: <X size={20} />,
  Hash: <Hash size={18} />,
  Sparkles: <Sparkles size={18} />,
  BarChart: <BarChart size={18} />,
  Layers: <Layers size={18} />,
  Copy: <Copy size={16} />
};

export const COLORS = {
  brand: '#F59E0B', // Darker Yellow/Orange for Light Mode visibility
  brandLight: '#FFD84D', // Original Citrio Yellow
  competitor: '#94a3b8', // Slate 400
  accent: '#22c55e', // Green
  bg: '#F8FAFC',
  card: '#ffffff',
  text: '#1e293b',
  grid: '#e2e8f0',
  border: '#e2e8f0'
};