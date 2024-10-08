import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View, Text, TextInput, FlatList } from "react-native";
import socket from "./socket";

const ChatForm = ({ color, messages, onSend, username, onClear }) => {
  const [message, setMessage] = useState('');

  const sendMessage = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <View style={[styles.formContainer, { backgroundColor: color }]}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{item.username}: {item.message}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <TextInput
        placeholder='Digite sua mensagem'
        value={message}
        onChangeText={setMessage}
        style={styles.input}
      />
      <View style={styles.buttonContainer}>
        <Pressable style={[styles.button]} onPress={sendMessage}>
          <Text style={styles.buttonText}>Enviar</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.clearButton]} onPress={onClear}>
          <Text style={styles.buttonText}>Limpar</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default function App() {
  const [messages, setMessages] = useState([]);
  const usernameBlue = 'Kim';
  const usernameRed = 'Briel';

  useEffect(() => {
    const storedMessages = JSON.parse(localStorage.getItem('messages')) || [];
    setMessages(storedMessages);
    socket.emit('join_room', 'blue');
    socket.emit('join_room', 'red');

    socket.on('receive_message', ({ message, username }) => {
      const newMessages = [...messages, { message, username }];
      setMessages(newMessages);
      localStorage.setItem('messages', JSON.stringify(newMessages));
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  const handleSend = (message, username) => {
    socket.emit('send_message', { message, username });
    const newMessages = [...messages, { message, username }];
    setMessages(newMessages);
    localStorage.setItem('messages', JSON.stringify(newMessages));
  };

  const handleClear = () => {
    setMessages([]); // Limpa as mensagens do estado
    localStorage.removeItem('messages'); // Limpa o localStorage
  };

  return (
    <View style={styles.container}>
      <ChatForm
        color="#1c1c1c"
        messages={messages}
        onSend={(message) => handleSend(message, usernameBlue)}
        username={usernameBlue}
        onClear={handleClear}
      />
      <ChatForm
        color="#1c1c1c"
        messages={messages}
        onSend={(message) => handleSend(message, usernameRed)}
        username={usernameRed}
        onClear={handleClear}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#121212',
  },
  formContainer: {
    flex: 1,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    justifyContent: 'space-between',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 5,
    borderRadius: 5,
    color: 'white',
    backgroundColor: '#333',
  },
  buttonContainer: {
    flexDirection: 'column', // Alinha os botões um embaixo do outro
    alignItems: 'center', // Centraliza os botões
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
    width: '40%', // Largura reduzida dos botões
    marginBottom: 10, // Espaço entre os botões
  },
  clearButton: {
    backgroundColor: '#b22222', // Vermelho mais fosco
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  messageContainer: {
    backgroundColor: '#222',
    borderRadius: 5,
    padding: 10,
    marginBottom: 5,
  },
  message: {
    color: 'white',
  },
});

