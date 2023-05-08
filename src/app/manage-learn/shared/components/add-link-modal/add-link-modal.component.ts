import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ToastService } from '@app/app/manage-learn/core';
@Component({
  selector: 'app-add-link-modal',
  templateUrl: './add-link-modal.component.html',
  styleUrls: ['./add-link-modal.component.scss'],
})
export class AddLinkModalComponent implements OnInit {
  links:string='';
  isSubmit : boolean = false;
  @Output() eventEmit = new EventEmitter();
  constructor(private toastService:ToastService) { }

  ngOnInit() {}
  cancel(){
    this.eventEmit.emit();
  }
  submit() {
    if(this.links && !this.isSubmit){
      this.isSubmit = true;
      this.eventEmit.emit(this.links);
    }
  }
  
  onChange(event){
    let value =event.target.value
    if(this.validateLink(value)){
      event.target.value = value.slice(0, -1);
    }
  }

  pasteLink(event){
    let data=event.clipboardData.getData('Text')
    if(this.validateLink(data)){
      event.preventDefault()
    }
  }

  validateLink(link){
    let invalidCharacters = /^[^!@~#$%^*(){}><,\n; ]+$/
    if(invalidCharacters.test(link)){
     return false
    }else{
      this.toastService.showMessage('FRMELEMNTS_MSG_INVALID_ADDED_LINK','danger')
      return true
    }
  }
}