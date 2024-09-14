import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output, ViewChild, inject } from '@angular/core';
import { Message } from '../model/message';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { OllamaService } from '../services/ollama.service';
import { markdownToHtml } from '../markdown-renderer/transform-markdown';
import { SunoApiService } from '../services/suno.api.service';
import Corbado from '@corbado/web-js';
import { SessionUser } from "@corbado/types";
import { Router } from '@angular/router';
import { db, PromptItem } from '../shared/prompt-db';
import { liveQuery } from 'dexie';
import { DeviceDetectorService } from 'ngx-device-detector';
import {
  MatBottomSheet,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy{
  messages: Message[] = [];
  messageForm: FormGroup;
  messageSent : boolean = false;
  fileName:string = '';
  responseMessage:string = "";
  pdfUrl: string = "";
  screenAvailWidth: number = 0;
  user: SessionUser | undefined = undefined
  userEmail?: string = "";
  chatOwnerUsername: string = "NUS ISS GPT";
  promptItemLists$:any;
  isMobileView?: boolean;
  private _bottomSheet = inject(MatBottomSheet);

  @ViewChild('userMessages')
  private inputMessageRef?: ElementRef;

  @ViewChild('formDirective') 
  private chatFormEle?: FormGroupDirective;

  constructor(private fb: FormBuilder, 
        private ollamaService: OllamaService, private cdRef: ChangeDetectorRef,
        private sunoSvc: SunoApiService, private router:Router,
        private deviceService: DeviceDetectorService,
        private cdr: ChangeDetectorRef) { 
    this.messageForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(3)]],
    });    
  }

  async addPromptMessagetoDexie(promptMsg:string) {
    await db.addPromptItem({
      email: this.user?.orig,
      prompt: promptMsg,
      postedDate: new Date()
    });
  }

  ngOnDestroy(): void {
      // clean up resources
  }

  openSendMsgBottomSheet(): void {
    console.log("open bottom sheet");
    const bottomSheetRef = this._bottomSheet.open(BottomSheetOverviewSendMsgSheet);
    bottomSheetRef.afterDismissed().subscribe((result) => {
      if (result) {
        if(result === 'SM'){
          this.sendMessage();
        }else if(result === 'APDF'){
          this.talktoPDF();
        }else if(result === "GS"){
          this.generateSong();
        }
      }
    });
  }

  populatePromptMsg(){
    console.log("populate prompt msg");
  }

  async clearHistory(){
    await db.promptItems.clear();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    console.log(event.target.innerWidth);
    
    if(innerWidth< 430){
      console.log("change mobile view")
      this.isMobileView = this.deviceService.isMobile();
    }
    this.cdr.detectChanges();
  }

  async ngOnInit() {
    // Load and initialize Corbado SDK when component mounts
    await Corbado.load({
        projectId: "pro-0317338422706138772",
        darkMode: 'off',
    });
    // Get the user data from the Corbado SDK
    this.user = Corbado.user
    console.log(this.user?.name);
    console.log(this.user?.orig);
    this.userEmail = this.user?.orig;
    this.promptItemLists$ = liveQuery(() => db.promptItems
      .where('email').equals(this.userEmail!)
      .toArray());
    if(!Corbado.isAuthenticated){
      this.router.navigate([''])
    }
  } 

  onFileSelected(event: any) {
    this.messageSent = true;
    let imageUrl: string = "";
    const file:File = event.target?.files[0];
    const input = event.target as HTMLInputElement;
    if (file) {
        this.fileName = file.name;
        const formData = new FormData();
        formData.append("file", file);
        var reader = new FileReader();
        reader.onload = (event:any) => {
            imageUrl = event.target.result;
            console.log(imageUrl);
            this.messages.push({text: imageUrl, sender: this.userEmail!, 
                timestamp: new Date(), type:'img'});
        }
        reader.readAsDataURL(event.target.files[0]);
        this.ollamaService.uploadFile(formData).then(async (response)  => {
          if(response.match(/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/gm)){
            console.log("contains dot n number !");
          }
          this.responseMessage = await markdownToHtml(response);
          this.messages.push({text: this.responseMessage, 
              sender: this.chatOwnerUsername, timestamp: new Date(), type:'msg'});
          this.messageSent = false;
          input.value="";
        });  
    }
  }

  b64toBlob(b64Data:any, contentType=''){
    const byteCharacters = atob(b64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArrays = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArrays], {type: contentType});
    return blob;
  }

  onPDFFileSelected(event: any) {
    console.log("dddd");
    this.messageSent = true;
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const pdfFile = input.files[0];
      if (pdfFile) {
          this.fileName = pdfFile.name;
          const formData = new FormData();
          formData.append("pdf-file", pdfFile);
          var reader = new FileReader();
          reader.onload = (event:any) => {
              let pdfBase64 = event.target.result;
              pdfBase64.replace(/^[^,]+,/, '');
              const base64Data = pdfBase64.split(',')[1];
              console.log(base64Data);
              var fileblob = this.b64toBlob(base64Data, 'application/pdf');
              this.pdfUrl = window.URL.createObjectURL(fileblob); 
              console.log(this.pdfUrl);
              this.messages.push({text: this.fileName, 
                  sender: this.userEmail!, timestamp: new Date(), type:'pdf'});
          }
          reader.readAsDataURL(event.target.files[0]);
          this.ollamaService.uploadPDFFile(formData).then(async (response)  => {
            if(response.match(/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/gm)){
              console.log("contains dot n number !");
            }
            console.log(response);
            this.messages.push({text: response, 
                sender: this.chatOwnerUsername, timestamp: new Date(), type:'msg'});
            this.messageSent = false;
            input.value = '';
          });  
      }
    }
  }

  sendMessage() {
    console.log("Sending...");
    if(this.messageForm.valid){
      const text = this.messageForm.value.text;
      console.log('User: ' + text);
      this.messages.push({text: text, sender: this.userEmail!, 
                timestamp: new Date(), type:'msg'});
      this.addPromptMessagetoDexie(text);
      this.messageSent = true;
      this.ollamaService.chatwithOllama(text).then(async (response) => {
        this.responseMessage = await markdownToHtml(response);
        this.messages.push({text: this.responseMessage, 
            sender: this.chatOwnerUsername, timestamp: new Date(), type:'msg'});
        this.messageSent = false;
      });

      this.messageForm.reset();
      this.chatFormEle?.resetForm();
      this.scrollToBottom();
    }
  }

  talktoPDF(){
    console.log("Sending...");
    if(this.messageForm.valid){
      const text = this.messageForm.value.text;
      console.log('User: ' + text);
      this.messages.push({text: text, sender: this.userEmail!, 
              timestamp: new Date(), type:'msg'});
      this.addPromptMessagetoDexie(text);
      this.messageSent = true;
      this.ollamaService.chatwithOllamaPDF(text).then(async (response) => {
        console.log(response);
        this.responseMessage = await markdownToHtml(response);
        this.messages.push({text: this.responseMessage, 
              sender: this.chatOwnerUsername, timestamp: new Date(), type:'msg'});
        this.messageSent = false;
      });

      this.messageForm.reset();
      this.scrollToBottom();
    }
  }

  generateSong(): void {
    if(this.messageForm.valid){
      const text = this.messageForm.value.text;
      console.log('User: ' + text);
      this.messages.push({text: text, sender: this.userEmail!, 
              timestamp: new Date(), type:'msg'});
      this.messageSent = true;
      this.sunoSvc.generateSongFromSuno(text).then(async (response) => {
        console.log(response[0]?.audio_url);
        console.log(response[0]?.status);
        if(response[0]?.status === 'streaming'){
          this.messages.push({text: response[0]?.audio_url, 
                  sender: this.chatOwnerUsername, timestamp: new Date(), type:'audio'});
          this.messageSent = false;
        }
      });
      this.messageForm.reset();
    }
  }

  scrollToBottom(): void {
    try {
      this.cdRef.detectChanges();
      this.inputMessageRef!.nativeElement.scrollTop = this.inputMessageRef?.nativeElement.scrollHeight;
    } catch(err) { }                 
  }

  async logout(){
    if (Corbado.isAuthenticated) {
      Corbado.logout();
      this.router.navigate(['']);
    }
  }
}

@Component({
  selector: 'chat-bottom-sheet',
  templateUrl: 'bottom-sheet-send-msg-sheet.html'
})
export class BottomSheetOverviewSendMsgSheet {
  
  private _bottomSheetRef =
    inject<MatBottomSheetRef<BottomSheetOverviewSendMsgSheet>>(MatBottomSheetRef);

  bottomSheetCommand(event: MouseEvent, command: string): void {
    console.log("emit mesg")
    
    this._bottomSheetRef.dismiss(command);
    event.preventDefault();
  }
}
