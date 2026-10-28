import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  doc,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

interface Message {
  id?: string;
  role: 'user' | 'model';
  content: string;
  timestamp: any;
  userId: string;
}

interface ChatContextType {
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((u: any) => {
      setUser(u);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(db, 'users', user.uid, 'chat_messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [user]);

  const sendMessage = async (content: string) => {
    if (!user || !content.trim()) return;

    setIsLoading(true);
    try {
      const messagesRef = collection(db, 'users', user.uid, 'chat_messages');
      
      // 1. Add user message to Firestore
      const userMsg = {
        userId: user.uid,
        role: 'user',
        content,
        timestamp: serverTimestamp(),
      };
      await addDoc(messagesRef, userMsg);

      // 2. Call server API for AI response
      // Include recent history for context
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      chatHistory.push({ role: 'user', content });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // 3. Add AI response to Firestore
      const aiMsg = {
        userId: user.uid,
        role: 'model',
        content: data.text,
        timestamp: serverTimestamp(),
      };
      await addDoc(messagesRef, aiMsg);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider value={{ isChatOpen, setIsChatOpen, messages, sendMessage, isLoading }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
