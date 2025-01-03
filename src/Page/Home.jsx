import React, { useState } from 'react'
import { FaArrowCircleUp, FaMicrophone, FaSpinner } from 'react-icons/fa'
import { PiButterfly } from "react-icons/pi";


const Home = () => {
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [hasMessages, setHasMessages] = useState(false)
  const [isListening, setIsListening] = useState(false)

  const handleSpeechToText = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      setIsListening(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prevMessage => {
          const newMessage = prevMessage + ' ' + transcript;
          // Add setTimeout to ensure DOM is updated before adjusting height
          setTimeout(() => {
            const textarea = document.querySelector('textarea');
            if (textarea) {
              textarea.style.height = 'inherit';
              const newHeight = Math.min(textarea.scrollHeight, 90);
              textarea.style.height = `${newHeight}px`;
              // Auto scroll to bottom
              textarea.scrollTop = textarea.scrollHeight;
            }
          }, 0);
          return newMessage;
        });
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Chat history area */}
      <div className="w-full max-w-2xl mx-auto flex-1 overflow-y-auto p-4 space-y-4 whatTheFukotha">
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`flex ${
              chat.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[50%] p-4 rounded-lg ${
                chat.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-blue-50'
                  : chat.isError 
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 text-red-100'
                    : 'bg-gradient-to-r from-purple-600 to-pink-500 text-purple-50'
              }`}
            >
              {chat.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input container */}
      <div 
        className={`w-full transition-transform duration-300 ease-linear ${
          hasMessages 
            ? 'transform translate-y-0' 
            : 'transform translate-y-[-30vh]'
        }`}
      >
        <div className="w-full max-w-2xl mx-auto px-4">
          {!hasMessages && (
            <h1 className="text-blue-50 text-4xl font-medium mb-8 text-center">
              Hugging Face 🤗
            </h1>
          )}
          <form className="flex space-x-4 mb-4">
            <div className="flex-1 relative">
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  e.target.style.height = 'inherit';
                  const newHeight = Math.min(e.target.scrollHeight, 60);
                  e.target.style.height = `${newHeight}px`;
                  e.target.scrollTop = e.target.scrollHeight;
                }}
                placeholder="Message . . ."
                className="w-full resize-none rounded-full border border-purple-400/30 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-3 pl-5 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-400 overflow-y-auto text-purple-50 placeholder-[#ccc] whatTheFukotha"
                rows="1"
              />
              <button
                type="button"
                onClick={handleSpeechToText}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-purple-100"
              >
                {isListening ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaMicrophone />
                )}
              </button>
            </div>
            <button
              type="submit"
              className="text-5xl self-end text-purple-200 hover:text-purple-100"
            >
              <PiButterfly />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Home
