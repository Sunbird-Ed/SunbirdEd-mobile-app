import { Component, Input } from '@angular/core';
import { Events } from '@app/util/events';
import { ModalController } from '@ionic/angular';
import { HintComponent } from '../hint/hint.component';

@Component({
  selector: 'app-question-heading',
  templateUrl: './question-heading.component.html',
  styleUrls: ['./question-heading.component.scss'],
})
export class QuestionHeadingComponent {

  text: string;
  @Input() data;
  @Input() inputIndex;
  @Input() enableQuestionReadOut: boolean;
  showQuestionNumber = false;
  play = false;

  
  constructor(private events: Events, private modalCtrl: ModalController) {
    this.events.subscribe('speech', data => {
      this.play = false;
    })
  }


  playQuestion(question, options, type) {
    this.play = true;
    // this.textToSpeech.speechFromText({text:question}).then(success =>{

    //   let url = options.length > 0 ?   this.addOptionsToUrl(options , type) :
    //   this.play = false;
    //   }).catch(error =>{

    //     console.log(JSON.stringify(error));
    //   });
  }
  addOptionsToUrl(options, type: string) {
    // let url = type === 'multiSelect' ? 'you can select multiple options ' : 'select one option form following ';
    // this.textToSpeech.speechFromText({ text: url }).then(async success => {
    //   // options.forEach( async (option,optionIndex) =>{
    //   for (let i = 0; i < options.length; i++) {
    //     let url = 'option ' + (i + 1) + options[i]['label'];
    //     await this.textToSpeech.speechFromText({ text: url }).then(success => {
    //     }).catch(
    //       error => {
    //         this.play = false;
    //       }
    //     );
    //   }
    //   this.play = false;
    // }).catch(error => {
    //   this.play = false;
    //   console.log(JSON.stringify(error));
    // });
  }

  pauseQuestion() {
  }

  async openHint(hint) {
    let hintModal = await this.modalCtrl.create({
      component: HintComponent,
      componentProps: {
        hint,
      },
    });
    hintModal.present();
  }

}
