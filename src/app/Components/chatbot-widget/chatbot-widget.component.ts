import { Component, ElementRef, ViewChild, AfterViewChecked, Renderer2 } from '@angular/core';
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
export class ChatWidgetComponent implements AfterViewChecked {
  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;

  isOpen = false;
  isFullscreen = false; 
  isLoading = false;
  isTyping = false;
  userInput = '';
  
  history: ChatMessage[] = [];

  constructor(
    private chatService: ChatService,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  ngAfterViewChecked() {
    const links = this.el.nativeElement.querySelectorAll('.chat-messages a');
    
    links.forEach((link: HTMLAnchorElement) => {
      if (link.getAttribute('target') !== '_blank') {
        this.renderer.setAttribute(link, 'target', '_blank');
        this.renderer.setAttribute(link, 'rel', 'noopener noreferrer'); 
      }
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      if (this.history.length === 0) {
        this.typeWriter('¡Hola! Soy *Scrapy*, el experto de HardMatch. ¿En qué puedo ayudarte hoy?');
      } else {
        this.hacerScroll(true); 
      }
    } else {
      this.isFullscreen = false; 
    }
  }

  // --- ACÁ ESTÁ LA FUNCIÓN QUE FALTABA ---
  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    setTimeout(() => this.hacerScroll(true), 200); 
  }

  private typeWriter(fullText: string) {
    this.isTyping = true; 

    const botMsg: ChatMessage = { role: 'model', parts: [{ text: '' }] };
    this.history.push(botMsg);

    let i = 0;
    const speed = 30; 

    const interval = setInterval(() => {
      if (i < fullText.length) {
        botMsg.parts[0].text += fullText.charAt(i);
        this.hacerScroll(); // Scroll inteligente automático
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
    
    this.hacerScroll(true); 
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
        this.hacerScroll(true); 
      }
    });
  }

  // --- ACÁ ESTÁ LA OTRA FUNCIÓN CLAVE ---
  private hacerScroll(forzar: boolean = false): void {
    setTimeout(() => {
      try {
        if (this.chatScrollContainer && this.chatScrollContainer.nativeElement) {
          const container = this.chatScrollContainer.nativeElement;
          const distanciaAlFondo = container.scrollHeight - container.scrollTop - container.clientHeight;
          const tolerancia = 100;

          if (forzar || distanciaAlFondo <= tolerancia) {
            container.scrollTo({
              top: container.scrollHeight,
              behavior: 'smooth'
            });
          }
        }
      } catch(err) { }
    }, 15);
  }
}