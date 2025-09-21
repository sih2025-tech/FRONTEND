'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface ChatMessage {
  question: string;
  answer: string;
  timestamp: Date;
}

interface ImageAnalysis {
  file: File;
  label: string;
  timestamp: Date;
}

export default function AgriAIChatbotPage() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis[]>([]);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:5000';

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: currentQuestion }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }

      const data = await response.json();
      
      const newMessage: ChatMessage = {
        question: currentQuestion,
        answer: data.answer,
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, newMessage]);
      setCurrentQuestion('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageAnalysis = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await fetch(`${API_BASE_URL}/analyze-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      
      const newAnalysis: ImageAnalysis = {
        file: selectedImage,
        label: data.label,
        timestamp: new Date(),
      };

      setImageAnalysis(prev => [...prev, newAnalysis]);
      setSelectedImage(null);
      setImagePreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  const clearImageAnalysis = () => {
    setImageAnalysis([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🌾 Agri AI Chatbot
          </h1>
          <p className="text-lg text-gray-600">
            Advanced Agricultural Intelligence Platform
          </p>
          <Badge variant="outline" className="mt-2">
            Connected to {API_BASE_URL}
          </Badge>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <div className="text-red-800">{error}</div>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chat Section */}
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r p-4 from-green-600 to-green-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                💬 AI Chat Assistant
              </CardTitle>
              <CardDescription className="text-green-100">
                Ask questions about agriculture, farming, and crops
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto mb-4 space-y-4 bg-gray-50 rounded-lg p-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">🤖</div>
                    <p>Start a conversation with the AI assistant!</p>
                  </div>
                ) : (
                  chatMessages.map((message, index) => (
                    <div key={index} className="space-y-2">
                      <div className="bg-blue-500 text-white p-3 rounded-lg ml-8">
                        <p className="font-medium">You:</p>
                        <p>{message.question}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg mr-8 border">
                        <p className="font-medium text-green-600">AI Assistant:</p>
                        <p className="text-gray-800">{message.answer}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <Input
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  placeholder="Ask about crops, diseases, farming techniques..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !currentQuestion.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? 'Thinking...' : 'Send'}
                </Button>
              </form>

              <div className="flex gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearChat}
                  className="text-gray-600"
                >
                  Clear Chat
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Image Analysis Section */}
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r  p-4 from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                📸 Image Analysis
              </CardTitle>
              <CardDescription className="text-blue-100">
                Upload images for AI-powered crop and plant analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {/* Image Upload */}
              <div className="mb-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {imagePreview ? (
                    <div className="space-y-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-h-48 mx-auto rounded-lg shadow"
                      />
                      <div className="flex gap-2 justify-center">
                        <Button 
                          onClick={handleImageAnalysis}
                          disabled={isLoading}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isLoading ? 'Analyzing...' : 'Analyze Image'}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-gray-600 mb-4">
                        Upload an image of crops, plants, or agricultural scenes
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="max-w-xs mx-auto"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Analysis Results */}
              <div className="h-64 overflow-y-auto space-y-3">
                {imageAnalysis.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">🔍</div>
                    <p>Upload images to see AI analysis results</p>
                  </div>
                ) : (
                  imageAnalysis.map((analysis, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">🌱</div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            Analysis Result:
                          </p>
                          <Badge variant="secondary" className="mt-1">
                            {analysis.label}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-2">
                            {analysis.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearImageAnalysis}
                  className="text-gray-600"
                >
                  Clear Results
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">
              Backend API Status: Connected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}