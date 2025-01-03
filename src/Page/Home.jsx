import React, { useEffect, useState } from 'react'
import { FaArrowCircleUp, FaMicrophone, FaSpinner } from 'react-icons/fa'
import { PiButterfly } from "react-icons/pi";


const Home = () => {
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [hasMessages, setHasMessages] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestion, setSuggestion] = useState('')

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



  // For hugging face api integration making sure everything is ready



  // hugging face api key
  async function query(data) {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-v0.1",
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    const result = await response.json();
    return result;
  }
  // hugging face api key

  const GetHuggingFaceResponse = async () => {
    setIsLoading(true);
    try {
      console.log("Sending request with message:", message);

      const response = await fetch(
        "https://api-inference.huggingface.co/models/gpt2",
        {
          headers: {
            Authorization: "Bearer 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",
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            inputs: message,
            parameters: {
              max_new_tokens: 20,
              temperature: 0.7,
              top_p: 0.9,
              do_sample: true
            }
          }),
        }
      );

      console.log("Response status:", response.status);
      const result = await response.json();
      console.log("API Response:", result[0].generated_text);
      if (typeof result === 'string') {
        setSuggestion(result);
      } else if (Array.isArray(result) && result[0] && result[0].generated_text) {
        setSuggestion(result[0].generated_text);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const [isTyping, setIsTyping] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);


  const handleChange = (e) => {
    const inputText = e.target.value;
    setIsTyping(inputText);
    setMessage(inputText); // Ensure message state is updated
    
    // Clear suggestion if input is empty
    if (inputText.length === 0) {
      setSuggestion('');
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      return;
    }

    // Only get suggestions if there's text
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const newTypingTimeout = setTimeout(() => {
      console.log('Run')
      setIsTyping('');
      GetHuggingFaceResponse();
    }, 3000);

    setTypingTimeout(newTypingTimeout);
  };

  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  // Add new useEffect to handle suggestion height adjustment
  useEffect(() => {
    const textarea = document.querySelector('textarea');
    if (textarea && suggestion) {
      // Store original height
      const originalHeight = textarea.style.height;
      // Temporarily set content to include suggestion to measure full height
      textarea.value = message + suggestion.slice(message.length);
      textarea.style.height = 'inherit';
      const newHeight = Math.min(textarea.scrollHeight, 90);
      textarea.style.height = `${newHeight}px`;
      // Reset content back to original
      textarea.value = message;
    }
  }, [suggestion, message]);

  // =================================================================


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
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => {
                    handleChange(e);
                    setMessage(e.target.value);
                    e.target.style.height = 'inherit';
                    const newHeight = Math.min(e.target.scrollHeight, 60);
                    e.target.style.height = `${newHeight}px`;
                    e.target.scrollTop = e.target.scrollHeight;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab' && suggestion) {
                      e.preventDefault();
                      setMessage(message + suggestion.slice(message.length));
                      setSuggestion('');
                    }
                  }}
                  placeholder="Message . . ."
                  className="w-full resize-none rounded-full border border-purple-400/30 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-3 pl-5 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-400 overflow-y-auto text-purple-50 placeholder-[#ccc] whatTheFukotha"
                  rows="1"
                />
                {suggestion && (
                  <div 
                    className="absolute left-0 top-0 p-3 pl-5 text-[#2e2e2e] pointer-events-none whitespace-pre-wrap"
                    style={{
                      paddingRight: '3rem' // Space for microphone icon
                    }}
                  >
                    <span className="invisible">{message}</span>
                    <span>{suggestion.slice(message.length)}</span>
                  </div>
                )}
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
