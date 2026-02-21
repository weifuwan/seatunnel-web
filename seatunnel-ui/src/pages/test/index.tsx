// SimpleWebSocketTest.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { message } from 'antd';

interface Message {
  id: number;
  content: string;
  timestamp: string;
}

const SimpleWebSocketTest: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [status, setStatus] = useState('未连接');
  
  const stompClientRef = useRef<Client | null>(null);

  // 连接 WebSocket
  const connect = () => {
    setStatus('连接中...');
    
    const socket = new SockJS('http://192.168.1.115:9527/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        setIsConnected(true);
        setStatus('已连接');
        message.info('WebSocket 连接成功');
        
        // 订阅测试频道
        stompClient.subscribe('/topic/log/test', (message) => {
 
          const data = JSON.parse(message.body);
          const newMsg: Message = {
            id: Date.now(),
            content: JSON.stringify(data, null, 2),
            timestamp: new Date().toLocaleTimeString()
          };
          setMessages(prev => [newMsg, ...prev.slice(0, 9)]);
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
        setStatus('已断开');
      },
      onStompError: (error) => {
        setStatus(`连接错误: ${error.headers.message}`);
      }
    });

    stompClient.activate();
    stompClientRef.current = stompClient;
  };

  // 断开连接
  const disconnect = () => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
      setIsConnected(false);
      setStatus('已断开');
    }
  };

  // 发送测试消息
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      const response = await fetch('http://localhost:9527/api/websocket/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'test',
          content: inputMessage,
          type: 'test'
        })
      });
      
      if (response.ok) {
        setInputMessage('');
      }
    } catch (error) {
      console.error('发送失败:', error);
    }
  };

  // 发送测试日志
  const sendTestLog = async () => {
    try {
      await fetch('http://localhost:8080/api/websocket/log?workflowId=test&level=INFO&content=这是一条测试日志');
    } catch (error) {
      console.error('发送日志失败:', error);
    }
  };

  // 清理消息
  const clearMessages = () => {
    setMessages([]);
  };

  // 组件卸载时断开连接
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h2>WebSocket 连接测试</h2>
      
      <div style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 10 }}>
          状态: <span style={{ 
            color: isConnected ? 'green' : status.includes('错误') ? 'red' : 'black',
            fontWeight: 'bold'
          }}>{status}</span>
        </div>
        
        <div style={{ marginBottom: 10 }}>
          <button 
            onClick={connect} 
            disabled={isConnected}
            style={{ 
              marginRight: 10, 
              padding: '8px 16px',
              backgroundColor: isConnected ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: isConnected ? 'not-allowed' : 'pointer'
            }}
          >
            连接
          </button>
          
          <button 
            onClick={disconnect} 
            disabled={!isConnected}
            style={{ 
              marginRight: 10, 
              padding: '8px 16px',
              backgroundColor: !isConnected ? '#ccc' : '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: !isConnected ? 'not-allowed' : 'pointer'
            }}
          >
            断开
          </button>
          
          <button 
            onClick={clearMessages}
            style={{ 
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            清空消息
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 10 }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="输入要发送的消息..."
            style={{ 
              padding: '8px',
              width: '300px',
              marginRight: '10px',
              borderRadius: 4,
              border: '1px solid #ccc'
            }}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          
          <button 
            onClick={sendMessage} 
            disabled={!isConnected}
            style={{ 
              marginRight: 10, 
              padding: '8px 16px',
              backgroundColor: !isConnected ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: !isConnected ? 'not-allowed' : 'pointer'
            }}
          >
            发送消息
          </button>
          
          <button 
            onClick={sendTestLog} 
            disabled={!isConnected}
            style={{ 
              padding: '8px 16px',
              backgroundColor: !isConnected ? '#ccc' : '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: !isConnected ? 'not-allowed' : 'pointer'
            }}
          >
            发送测试日志
          </button>
        </div>
      </div>

      <div>
        <h3>接收到的消息 ({messages.length} 条):</h3>
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: 4,
          height: '300px',
          overflowY: 'auto',
          padding: '10px',
          backgroundColor: '#f8f9fa'
        }}>
          {messages.length === 0 ? (
            <div style={{ color: '#6c757d', textAlign: 'center', marginTop: '20px' }}>
              暂无消息，请先连接并发送消息
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                style={{ 
                  padding: '8px',
                  marginBottom: '8px',
                  borderBottom: '1px solid #eee',
                  backgroundColor: 'white',
                  borderRadius: 4
                }}
              >
                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                  [{msg.timestamp}]
                </div>
                <div style={{ marginTop: '4px', fontFamily: 'monospace', fontSize: '14px' }}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: 20, fontSize: '12px', color: '#6c757d' }}>
        提示: 确保后端运行在 http://localhost:8080，点击"连接"按钮建立 WebSocket 连接
      </div>
    </div>
  );
};

export default SimpleWebSocketTest;