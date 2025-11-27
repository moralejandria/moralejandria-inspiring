
import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Simple parser to handle bold text (**text**)
  const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-6 py-4 shadow-sm ${
          isUser
            ? 'bg-blue-900 text-white rounded-tr-none' // Azul profundo para usuario
            : 'bg-white text-slate-800 border border-blue-100 rounded-tl-none shadow-md' // Blanco/Papel para el bot
        }`}
      >
        <div className={`text-sm leading-relaxed whitespace-pre-wrap ${!isUser ? 'serif-font text-slate-700' : 'font-light'}`}>
          {formatText(message.text)}
        </div>
        <div className={`text-[10px] mt-2 opacity-60 text-right italic`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};
