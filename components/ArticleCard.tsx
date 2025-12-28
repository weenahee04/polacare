import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { Article } from '../types';

interface ArticleCardProps {
    article: Article;
    onClick?: () => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick }) => {
    return (
        <div 
            onClick={onClick} 
            className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm active:scale-[0.99] transition-transform cursor-pointer hover:shadow-md"
        >
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 relative">
                <img src={article.imageUrl} alt={article.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-110" />
            </div>
            <div className="flex flex-col justify-between py-0.5 flex-1">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-kanit ${
                            article.category === 'Eye Care' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                        }`}>
                            {article.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-kanit flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {article.readTime}
                        </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 font-kanit line-clamp-2 leading-tight">
                        {article.title}
                    </h3>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-slate-400 font-kanit">{article.date}</span>
                    <div className="p-1 rounded-full bg-slate-50 text-slate-400 group-hover:bg-slate-100 transition-colors">
                        <ChevronRight className="h-4 w-4" />
                    </div>
                </div>
            </div>
        </div>
    );
};