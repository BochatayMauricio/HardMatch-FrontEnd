import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../Services/chatbot.service';
import { ChatMessage } from '../../Interfaces/chatbot.interface';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownComponent],
  templateUrl: './chatbot-widget.component.html',
  styleUrls: ['./chatbot-widget.component.css']
})
export class ChatWidgetComponent {
  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;

  isOpen = false;
  isLoading = false;
  isTyping = false;
  userInput = '';
  
  history: ChatMessage[] = [];

  constructor(private chatService: ChatService) {}

  toggleChat() {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      if (this.history.length === 0) {
        this.typeWriter('¡Hola! Soy **Scrapy**, el experto de HardMatch. ¿En qué puedo ayudarte hoy?');
      } else {
        this.scrollToBottom();
      }
    }
  }

  private typeWriter(fullText: string) {
    this.isTyping = true; 

    const botMsg: ChatMessage = { role: 'model', parts: [{ text: '' }] };
    this.history.push(botMsg);

    let i = 0;
    const speed = 30; 

    const interval = setInterval(() => {
      if (i < fullText.length) {
        // Solo agregamos la letra al objeto, NO recreamos el arreglo entero
        botMsg.parts[0].text += fullText.charAt(i);
        
        this.scrollToBottom();
        i++;
      } else {
        clearInterval(interval);
        this.isTyping = false;
      }
    }, speed);
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isLoading || this.isTyping) return;

    const userText = this.userInput;
    this.userInput = ''; 
    
    const historyToSend = this.history.filter((msg, index) => {
      return !(index === 0 && msg.role === 'model');
    });

    const newUserMsg: ChatMessage = { role: 'user', parts: [{ text: userText }] };
    this.history.push(newUserMsg);
    
    this.scrollToBottom();
    this.isLoading = true;

    this.chatService.sendMessage({ message: userText, history: historyToSend }).subscribe({
      next: (res) => {
        this.isLoading = false; 
        if (res.success) {
          this.typeWriter(res.reply); 
        }
      },
      error: (err) => {
        console.error('Error en el chat:', err);
        this.isLoading = false;
        this.history.push({ role: 'model', parts: [{ text: 'Ups, tuve un cortocircuito. Intenta de nuevo más tarde.' }] });
        this.scrollToBottom();
      }
    });
  }

  private scrollToBottom(): void {
    // Un pequeño delay para permitir que Angular dibuje la letra nueva en el HTML
    setTimeout(() => {
      try {
        if (this.chatScrollContainer && this.chatScrollContainer.nativeElement) {
          const container = this.chatScrollContainer.nativeElement;
          container.scrollTop = container.scrollHeight;
        } else {
          // Respaldo por si Angular se marea con el ViewChild
          const chatElement = document.querySelector('.chat-messages');
          if (chatElement) {
            chatElement.scrollTop = chatElement.scrollHeight;
          }
        }
      } catch(err) { }
    }, 15);
  }
}