/**
 * Live Chat Dashboard
 * Real-time chat monitoring and agent takeover
 */

import { useState, useEffect, useRef } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Button,
  Badge,
  EmptyState,
  Avatar,
  Divider,
  Banner,
  Scrollable
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { io, Socket } from "socket.io-client";

interface ChatSession {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  status: string;
  lastMessage: string | null;
  lastMessageAt: Date | null;
  unreadCount: number;
  aiHandled: boolean;
}

interface Message {
  id: string;
  sender: string;
  message: string;
  sentAt: Date;
  agentName?: string | null;
  recommendedProducts?: string | null;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Find or create store
  let store = await prisma.store.findUnique({
    where: { shopDomain: session.shop },
  });

  if (!store) {
    store = await prisma.store.create({
      data: {
        shopDomain: session.shop,
        shopName: session.shop.replace('.myshopify.com', ''),
        isActive: true,
      },
    });
  }

  // Get active chat sessions
  const activeSessions = await prisma.chatSession.findMany({
    where: {
      storeId: store.id,
      status: {
        in: ['active', 'needs_agent', 'agent_takeover']
      }
    },
    include: {
      messages: {
        orderBy: { sentAt: 'desc' },
        take: 1
      },
      _count: {
        select: {
          messages: {
            where: {
              readByAgent: false,
              sender: 'CUSTOMER'
            }
          }
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  const sessions: ChatSession[] = activeSessions.map(s => ({
    id: s.id,
    customerName: s.customerName,
    customerEmail: s.customerEmail,
    status: s.status,
    lastMessage: s.messages[0]?.message || null,
    lastMessageAt: s.messages[0]?.sentAt || null,
    unreadCount: s._count.messages,
    aiHandled: s.aiHandled
  }));

  return json({
    sessions,
    storeId: store.id,
    storeDomain: store.shopDomain,
    agentName: session.firstName || 'Agent'
  });
};

export default function LiveChatDashboard() {
  const { sessions: initialSessions, storeId, agentName } = useLoaderData<typeof loader>();
  
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTakenOver, setIsTakenOver] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isCustomerTyping, setIsCustomerTyping] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Socket.IO connection
  useEffect(() => {
    const socket = io({
      path: '/socket.io'
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
      
      // Join admin room to receive all notifications
      socket.emit('join-admin-room', { storeId });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
    });

    // Listen for new chat sessions
    socket.on('new-session', (session: ChatSession) => {
      setSessions(prev => [session, ...prev]);
    });

    // Listen for agent requests
    socket.on('agent-requested', ({ sessionId }) => {
      setSessions(prev =>
        prev.map(s =>
          s.id === sessionId ? { ...s, status: 'needs_agent' } : s
        )
      );
      
      // Play notification sound
      playNotificationSound();
    });

    // Listen for new messages
    socket.on('new-message', (message: Message) => {
      if (selectedSessionId === message.sessionId) {
        setMessages(prev => [...prev, message]);
        
        // Mark as read by agent
        socket.emit('mark-read-by-agent', {
          sessionId: selectedSessionId,
          messageId: message.id
        });
      }
      
      // Update session in list
      setSessions(prev =>
        prev.map(s =>
          s.id === message.sessionId
            ? {
                ...s,
                lastMessage: message.message,
                lastMessageAt: message.sentAt,
                unreadCount: s.id === selectedSessionId ? 0 : s.unreadCount + 1
              }
            : s
        )
      );
    });

    // Listen for typing indicator
    socket.on('typing', ({ sessionId, userType }) => {
      // Show typing indicator for customer
      if (sessionId === selectedSessionId && userType === 'customer') {
        setIsCustomerTyping(true);
        
        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        // Hide typing indicator after 3 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
          setIsCustomerTyping(false);
        }, 3000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [storeId, selectedSessionId]);

  // Load messages when session is selected
  useEffect(() => {
    if (selectedSessionId) {
      loadMessages(selectedSessionId);
      
      // Join this specific chat room
      socketRef.current?.emit('join-chat', {
        sessionId: selectedSessionId,
        userType: 'agent'
      });
    }
  }, [selectedSessionId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?sessionId=${sessionId}`);
      const data = await response.json();
      setMessages(data.messages || []);
      
      // Check if already taken over
      const session = sessions.find(s => s.id === sessionId);
      setIsTakenOver(session?.status === 'agent_takeover');
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleTakeOver = () => {
    if (!selectedSessionId) return;

    socketRef.current?.emit('takeover-chat', {
      sessionId: selectedSessionId,
      agentId: `agent-${Date.now()}`,
      agentName: agentName
    });

    setIsTakenOver(true);

    // Send system message
    sendMessage({
      text: `👋 ${agentName} has joined the chat. How can I help you today?`,
      isSystem: true
    });
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedSessionId) return;

    sendMessage({
      text: messageInput,
      isSystem: false
    });

    setMessageInput('');
    
    // Stop typing indicator
    socketRef.current?.emit('typing', {
      sessionId: selectedSessionId,
      userType: 'agent',
      isTyping: false
    });
  };
  
  const handleTyping = () => {
    if (!selectedSessionId) return;
    
    // Send typing indicator
    socketRef.current?.emit('typing', {
      sessionId: selectedSessionId,
      userType: 'agent',
      isTyping: true
    });
  };

  const sendMessage = ({ text, isSystem }: { text: string; isSystem: boolean }) => {
    socketRef.current?.emit('send-message', {
      sessionId: selectedSessionId,
      message: text,
      sender: isSystem ? 'SYSTEM' : 'AGENT',
      agentName: agentName
    });
  };

  const playNotificationSound = () => {
    // Play notification sound
    const audio = new Audio('/notification.mp3');
    audio.play().catch(err => console.log('Audio play failed:', err));
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - d.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return d.toLocaleDateString();
  };

  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  return (
    <>
      <TitleBar title="Live Chat Dashboard" />
      <Page fullWidth>
        {!isConnected && (
          <Banner tone="warning">
            Connecting to chat server...
          </Banner>
        )}
        
        <Layout>
          {/* Left: Chat Sessions List */}
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="4">
                <InlineStack align="space-between">
                  <Text variant="headingMd" as="h2">Active Chats</Text>
                  <Badge tone={isConnected ? 'success' : 'critical'}>
                    {isConnected ? 'Online' : 'Offline'}
                  </Badge>
                </InlineStack>

                {sessions.length === 0 ? (
                  <EmptyState
                    heading="No active chats"
                    image="/empty-chat.svg"
                  >
                    <Text>Chat sessions will appear here when customers start conversations.</Text>
                  </EmptyState>
                ) : (
                  <BlockStack gap="2">
                    {sessions.map(session => (
                      <div
                        key={session.id}
                        className={`chat-session-card ${selectedSessionId === session.id ? 'selected' : ''}`}
                        onClick={() => setSelectedSessionId(session.id)}
                        style={{
                          padding: '12px',
                          border: selectedSessionId === session.id ? '2px solid #5C6AC4' : '1px solid #E1E3E5',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: selectedSessionId === session.id ? '#F6F6F7' : 'white'
                        }}
                      >
                        <InlineStack align="space-between" blockAlign="start">
                          <BlockStack gap="1">
                            <InlineStack gap="2">
                              <Text fontWeight="bold">
                                {session.customerName || session.customerEmail || 'Anonymous'}
                              </Text>
                              {session.status === 'needs_agent' && (
                                <Badge tone="attention">🚨 Needs Agent</Badge>
                              )}
                              {session.status === 'agent_takeover' && (
                                <Badge tone="success">Agent Active</Badge>
                              )}
                              {session.aiHandled && session.status === 'active' && (
                                <Badge>🤖 AI</Badge>
                              )}
                            </InlineStack>
                            <Text variant="bodySm" tone="subdued">
                              {session.lastMessage?.substring(0, 50)}
                              {session.lastMessage && session.lastMessage.length > 50 && '...'}
                            </Text>
                          </BlockStack>
                          
                          <BlockStack gap="1" align="end">
                            {session.unreadCount > 0 && (
                              <Badge tone="info">{session.unreadCount}</Badge>
                            )}
                            <Text variant="bodySm" tone="subdued">
                              {formatTime(session.lastMessageAt)}
                            </Text>
                          </BlockStack>
                        </InlineStack>
                      </div>
                    ))}
                  </BlockStack>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Right: Chat Window */}
          <Layout.Section>
            {selectedSession ? (
              <Card>
                <BlockStack gap="4">
                  {/* Header */}
                  <InlineStack align="space-between" blockAlign="center">
                    <BlockStack gap="1">
                      <Text variant="headingMd" as="h2">
                        {selectedSession.customerName || 'Customer'}
                      </Text>
                      <Text variant="bodySm" tone="subdued">
                        {selectedSession.customerEmail}
                      </Text>
                    </BlockStack>
                    
                    <InlineStack gap="2">
                      {!isTakenOver ? (
                        <Button variant="primary" onClick={handleTakeOver}>
                          Take Over Chat
                        </Button>
                      ) : (
                        <Badge tone="success">You are chatting</Badge>
                      )}
                    </InlineStack>
                  </InlineStack>

                  <Divider />

                  {/* Messages */}
                  <div style={{ height: '500px', overflow: 'auto' }}>
                    <BlockStack gap="3">
                      {messages.map(msg => (
                        <div
                          key={msg.id}
                          style={{
                            display: 'flex',
                            justifyContent: msg.sender === 'CUSTOMER' ? 'flex-start' : 'flex-end'
                          }}
                        >
                          <div
                            style={{
                              maxWidth: '70%',
                              padding: '12px',
                              borderRadius: '12px',
                              backgroundColor:
                                msg.sender === 'CUSTOMER' ? '#F6F6F7' :
                                msg.sender === 'AI' ? '#E3F2FD' :
                                msg.sender === 'AGENT' ? '#5C6AC4' : '#FFF4E5',
                              color: msg.sender === 'AGENT' ? 'white' : 'black'
                            }}
                          >
                            <Text fontWeight={msg.sender !== 'CUSTOMER' ? 'semibold' : 'regular'}>
                              {msg.sender === 'AI' && '🤖 '}
                              {msg.sender === 'AGENT' && '👤 '}
                              {msg.sender === 'SYSTEM' && 'ℹ️ '}
                              {msg.sender === 'AGENT' && msg.agentName && `${msg.agentName}: `}
                            </Text>
                            <Text>{msg.message}</Text>
                            <Text variant="bodySm" tone="subdued">
                              {formatTime(msg.sentAt)}
                            </Text>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </BlockStack>
                  </div>

                  <Divider />
                  
                  {/* Typing Indicator */}
                  {isCustomerTyping && (
                    <div style={{ padding: '8px 16px', fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                      Customer is typing...
                    </div>
                  )}

                  {/* Input */}
                  {isTakenOver ? (
                    <InlineStack gap="2">
                      <div style={{ flex: 1 }}>
                        <TextField
                          label=""
                          value={messageInput}
                          onChange={(value) => {
                            setMessageInput(value);
                            handleTyping();
                          }}
                          placeholder="Type your message..."
                          autoComplete="off"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                      </div>
                      <Button variant="primary" onClick={handleSendMessage}>
                        Send
                      </Button>
                    </InlineStack>
                  ) : (
                    <Banner tone="info">
                      AI is currently handling this chat. Click "Take Over" to join the conversation.
                    </Banner>
                  )}
                </BlockStack>
              </Card>
            ) : (
              <Card>
                <EmptyState
                  heading="Select a chat to begin"
                  image="/chat-placeholder.svg"
                >
                  <Text>Choose a chat session from the list to view the conversation and assist the customer.</Text>
                </EmptyState>
              </Card>
            )}
          </Layout.Section>
        </Layout>
      </Page>
    </>
  );
}
