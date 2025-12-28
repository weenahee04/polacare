
import React, { useEffect, useState } from 'react';
import { Article } from '../types';
import { generateArticleContent } from '../services/geminiService';
import { ArrowLeft, Share2, Clock, Calendar, BookOpen } from 'lucide-react';

interface ArticleReaderProps {
    article: Article;
    onClose: () => void;
}

export const ArticleReader: React.FC<ArticleReaderProps> = ({ article, onClose }) => {
    const [content, setContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // Use static service which returns immediate string
        const fetchContent = async () => {
            setIsLoading(true);
            const text = await generateArticleContent(article.title, article.category);
            setContent(text);
            setIsLoading(false);
        };
        fetchContent();
    }, [article]);

    return (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-fade-in pb-20 sm:pb-0">
            {/* Nav Bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors active:bg-slate-200">
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div className="flex gap-2">
                    <button className="p-2 rounded-full hover:bg-slate-100 text-slate-600 active:bg-slate-200">
                        <Share2 className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Hero Image */}
            <div className="w-full h-56 sm:h-80 relative">
                <img 
                    src={article.imageUrl} 
                    alt={article.title} 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 sm:p-6 w-full">
                     <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold font-kanit mb-2 backdrop-blur-md ${
                        article.category === 'Eye Care' ? 'bg-blue-500/80 text-white' : 'bg-green-500/80 text-white'
                     }`}>
                        {article.category}
                     </span>
                     <h1 className="text-xl sm:text-3xl font-bold text-white font-kanit leading-tight drop-shadow-md">
                         {article.title}
                     </h1>
                </div>
            </div>

            {/* Meta Data */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-4 text-slate-500 text-[10px] sm:text-xs font-kanit border-b border-slate-100">
                <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {article.readTime} Read
                </div>
                <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {article.date}
                </div>
                <div className="ml-auto flex items-center gap-1 text-[#0056b3]">
                    <BookOpen className="h-3.5 w-3.5" />
                    Knowledge
                </div>
            </div>

            {/* Content Body */}
            <div className="px-5 sm:px-6 py-6 sm:py-8 max-w-3xl mx-auto min-h-[50vh]">
                <div className="prose prose-slate prose-headings:font-kanit prose-p:font-kanit prose-p:text-slate-600 max-w-none text-sm sm:text-base">
                    {/* Simple rendering preserving newlines and bold */}
                    {content.split('\n').map((line, idx) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                            return <h3 key={idx} className="text-base sm:text-lg font-bold text-slate-800 mt-6 mb-2">{line.replace(/\*\*/g, '')}</h3>;
                        } else if (line.startsWith('# ')) {
                            return <h2 key={idx} className="text-lg sm:text-xl font-bold text-slate-800 mt-6 mb-3">{line.replace(/# /g, '')}</h2>;
                        } else if (line.startsWith('## ')) {
                            return <h3 key={idx} className="text-base sm:text-lg font-bold text-slate-800 mt-5 mb-2">{line.replace(/## /g, '')}</h3>;
                        } else if (line.startsWith('- ')) {
                            return <li key={idx} className="ml-4 list-disc text-slate-600 mb-1 leading-relaxed">{line.replace(/- /g, '')}</li>;
                        } else if (line.trim() === '') {
                            return <br key={idx} />;
                        } else {
                            // Handle inline bolding basic logic
                            const parts = line.split(/(\*\*.*?\*\*)/g);
                            return (
                                <p key={idx} className="mb-3 leading-relaxed">
                                    {parts.map((part, i) => 
                                        part.startsWith('**') && part.endsWith('**') 
                                        ? <strong key={i} className="text-slate-800">{part.replace(/\*\*/g, '')}</strong> 
                                        : part
                                    )}
                                </p>
                            );
                        }
                    })}
                </div>
            </div>
            
            <div className="p-8 text-center bg-slate-50 border-t border-slate-100">
                <p className="text-[10px] sm:text-xs text-slate-400 font-kanit">
                    บทความนี้เป็นลิขสิทธิ์ของ Polacare ห้ามคัดลอกหรือดัดแปลงโดยไม่ได้รับอนุญาต
                </p>
            </div>
        </div>
    );
};
