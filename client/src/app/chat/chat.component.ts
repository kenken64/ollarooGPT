import { ChangeDetectorRef, Component, ElementRef, Inject, HostListener, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { Message } from '../model/message';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { OllamaService } from '../services/ollama.service';
import { markdownToHtml } from '../markdown-renderer/transform-markdown';
import { SunoApiService } from '../services/suno.api.service';
import Corbado from '@corbado/web-js';
import { SessionUser } from "@corbado/types";
import { Router } from '@angular/router';
import { db } from '../shared/prompt-db';
import { liveQuery } from 'dexie';
import { DeviceDetectorService } from 'ngx-device-detector';
import {
  MatBottomSheet,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface DialogData {
  imageUrl?: string;
  lyrics?: string;
}

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
  responseMessage:string | undefined;
  pdfUrl: string = "";
  screenAvailWidth: number = 0;
  user: SessionUser | undefined = undefined
  userEmail?: string = "";
  userName?: string = "";
  chatOwnerUsername: string = "Ollaroo";
  promptItemLists$:any;
  isMobileView?: boolean;
  private _bottomSheet = inject(MatBottomSheet);
  pageSize = 6; // Number of items per page
  currentPage = 1; // Current page number (1-based)
  totalRecords = 0;
  totalPages = 0;
  lastPageRecords = 0;
  messageNow: Date = new Date();
  
  @ViewChild('userMessages')
  private inputMessageRef?: ElementRef;

  @ViewChild('formDirective') 
  private chatFormEle?: FormGroupDirective;

  constructor(private fb: FormBuilder, 
        private ollamaService: OllamaService, 
        private sunoSvc: SunoApiService, private router:Router,
        private deviceService: DeviceDetectorService,
        private cdr: ChangeDetectorRef,
        public dialog: MatDialog) { 
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

  donate(){
    this.dialog
      .open(DialogExpandDonationComponent)
      .afterClosed()
      .subscribe(() => console.log('Open an Image'));
  }

  openSendMsgBottomSheet(): void {
    const bottomSheetRef = this._bottomSheet.open(BottomSheetOverviewSendMsgSheet);
    bottomSheetRef.afterDismissed().subscribe((result) => {
      if (result) {
        this.messageNow = new Date();
        if(result === 'SM'){
          this.messageNow = new Date();
          this.sendMessage();
        }else if(result === 'APDF'){
          this.talktoPDF();
        }else if(result === "GS"){
          this.generateSong();
        }else if(result === "UIM"){
          // console.log("upload image")
        }else if(result === 'UPPDF'){

        }
      }
    });
  }

  populatePromptMsg(promptMsg: string){
    this.messageForm.patchValue({text:promptMsg});
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPromptItems();
      this.loadTotalRecords()
    }
  }

  openImage(imageUrl: string) {
    this.dialog
      .open(DialogExpandImageComponent, { data: { imageUrl } })
      .afterClosed()
      .subscribe(() => console.log('Open an Image'));
  }

  async openLyricsDialog(inlyrics?: string){
    let lyrics = await markdownToHtml(inlyrics!)
    this.dialog
      .open(DialogExpandLyricsComponent, { data: { lyrics } })
      .afterClosed()
      .subscribe(() => console.log('Open an Lyrics Window'));
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPromptItems();
      this.loadTotalRecords();
    }
  }

  // Load the total number of records
  loadTotalRecords() {
    db.promptItems
      .where('email')
      .equals(this.userEmail!)
      .count()
      .then(count => {
        this.totalRecords = count;
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        this.calculateLastPageRecords();
      });
  }

  // Calculate how many records are on the last page
  calculateLastPageRecords() {
    const remainder = this.totalRecords % this.pageSize;
    this.lastPageRecords = remainder === 0 ? this.pageSize : remainder;
  }

  // clear records from dexie
  async clearHistory(){
    await db.promptItems.clear();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    
    if(innerWidth< 430){
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
    this.userEmail = this.user?.orig;
    this.userName = this.user?.name;
    this.loadTotalRecords();
    this.loadPromptItems();
    if(!Corbado.isAuthenticated){
      this.router.navigate([''])
    }
  } 

  loadPromptItems(){
    this.promptItemLists$ = liveQuery(() => db.promptItems
      .where('email').equals(this.userEmail!)
      .offset((this.currentPage - 1) * this.pageSize) // Skip items for previous pages
      .limit(this.pageSize) // Limit the number of items to the page size
      .reverse().toArray());
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
            this.messages.push({text: imageUrl, sender: this.userName!+' ('+this.userEmail! + ')', 
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
              var fileblob = this.b64toBlob(base64Data, 'application/pdf');
              this.pdfUrl = window.URL.createObjectURL(fileblob); 
              this.messages.push({text: this.fileName, 
                  sender: this.userName!+' ('+this.userEmail! + ')', timestamp: new Date(), type:'pdf'});
          }
          reader.readAsDataURL(event.target.files[0]);
          this.ollamaService.uploadPDFFile(formData).then(async (response)  => {
            if(response.match(/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/gm)){
              console.log("contains dot n number !");
            }
            this.messages.push({text: response, 
                sender: this.chatOwnerUsername, timestamp: new Date(), type:'msg'});
            this.messageSent = false;
            input.value = '';
          });  
      }
    }
  }

  sendMessage() {
    if(this.messageForm.valid){
      const text = this.messageForm.value.text;
      this.messages.push({text: text, sender: this.userName!+' ('+this.userEmail! + ')', 
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
    if(this.messageForm.valid){
      const text = this.messageForm.value.text;
      this.messages.push({text: text, sender: this.userName!+' ('+this.userEmail! +')', 
              timestamp: new Date(), type:'msg'});
      this.addPromptMessagetoDexie(text);
      this.messageSent = true;
      this.ollamaService.chatwithOllamaPDF(text).then(async (response) => {
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
      this.messages.push({text: text, sender: this.userName!+' ('+this.userEmail! +')', 
              timestamp: new Date(), type:'msg'});
      this.addPromptMessagetoDexie(text);
      this.messageSent = true;
      this.sunoSvc.generateSongFromSuno(text).then(async (response) => {
        if(response[0]?.status === 'streaming'){
          this.messages.push({text: response[0]?.audio_url, 
                  sender: this.chatOwnerUsername, 
                  timestamp: new Date(), 
                  type:'audio',
                  lyrics: response[0]?.prompt,
                  image_url: response[0].image_url,
                  title: response[0].title
                });
          this.messageSent = false;
        }else{
          this.messages.push({text: "Error generating song", 
            sender: this.chatOwnerUsername, 
            timestamp: new Date(), 
            type:'msg'});
          this.messageSent = false;
        }
      });
      this.messageForm.reset();
    }
  }

  scrollToBottom(): void {
    try {
      this.cdr.detectChanges();
      this.inputMessageRef!.nativeElement.scrollTop = this.inputMessageRef?.nativeElement.scrollHeight;
    } catch(err) { }                 
  }

  async logout(){
    if (Corbado.isAuthenticated) {
      Corbado.logout();
      db.clearAuthToken();
      this.router.navigate(['']);
    }
  }

  gotoDocuments(){
    this.router.navigate(['documents'])
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

@Component({
  selector: 'app-dialog-expand-image',
  templateUrl: './dialog-expand-image.component.html',
  styleUrls: ['./dialog-expand-image.component.css'],
})
export class DialogExpandImageComponent implements OnInit{
  imageUrl: string | undefined;
  
  constructor(
    public dialogRef: MatDialogRef<DialogExpandImageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit(): void {
    this.imageUrl = this.data.imageUrl;
    console.log(this.imageUrl)
  }

  closeImage() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-dialog-expand-donate',
  templateUrl: './dialog-expand-donate.component.html',
  styleUrls: ['./dialog-expand-donate.component.css'],
})
export class DialogExpandDonationComponent implements OnInit{
  imageUrl: string ="/assets/payme.png";
  
  constructor(
    public dialogRef: MatDialogRef<DialogExpandImageComponent>
  ) {}

  ngOnInit(): void {
    
  }

  closeImage() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-dialog-expand-image',
  templateUrl: './dialog-expand-lyrics.component.html',
  styleUrls: ['./dialog-expand-lyrics.component.css'],
})
export class DialogExpandLyricsComponent implements OnInit{
  lyricsText: string | undefined;
  public htmlContent: SafeHtml = '';
  
  constructor(
    public dialogRef: MatDialogRef<DialogExpandImageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.lyricsText = this.data.lyrics;
    let words = this.lyricsText!.split(' ');
    words = words.map((word) => {
      // Check if the first character is uppercase
      if (this.isFirstCharUpperCase(word)) {
        return "<br>" + word; 
      }else if (word.includes(']')) {
        console.log(`Word contains ']' : ${word}`);
        return word + "<br>"; 
      }
 
      return word; // Return the word as is if it's not uppercase
    });
    const updatedStr = words.join(' ');
    this.htmlContent = this.sanitizer.bypassSecurityTrustHtml(updatedStr);
  }

  isFirstCharUpperCase(word: string): boolean {
    return /^[A-Z]/.test(word);
  }  

  closeImage() {
    this.dialogRef.close();
  }
}

