import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-link-learning-resources',
  templateUrl: './link-learning-resources.component.html',
  styleUrls: ['./link-learning-resources.component.scss'],
})
export class LinkLearningResourcesComponent implements OnInit {
  title;

  filters = [{
    name: "All",
    icon: '',
    value: []
  }, {
    name: "Collections",
    icon: 'file_copy',
    value: ["application/vnd.ekstep.content-collection"]
  }, {
    name: "Documents",
    icon: 'insert_drive_file',
    value: ["application/pdf", "application/epub"]
  }, {
    name: "video",
    icon: 'play_circle_outline',
    value: ["video/mp4", "video/x-youtube", "video/webm"]
  }, {
    name: "interactive",
    icon: 'touch_app',
    value: ["application/vnd.ekstep.ecml-archive", "application/vnd.ekstep.h5p-archive", "application/vnd.ekstep.html-archive"]
  }];
  dataList={
       "count":3497,
       "content":[
          {
             "name":" Practice time_Hindi ",
             "id":"do_31302446154579968014349",
             "link":"https://qa.bodh.shikshalokam.org/resources/play/content/do_31302446154579968014349"
          },
          {
             "name":"\"Disadvantaged group\" in Right To Education act (RTE) : Did You Know?",
             "id":"do_3128812241620254721830",
             "link":"https://qa.bodh.shikshalokam.org/resources/play/content/do_3128812241620254721830"
          },
          {
             "name":"\"Weaker section\" in Right To Education act, 2009 : Did You Know?",
             "id":"do_3128812341787279361837",
             "link":"https://qa.bodh.shikshalokam.org/resources/play/content/do_3128812341787279361837"
          },
          {
             "name":"1 Becoming aware of areas of improvement",
             "id":"do_312461433824493568113381",
             "link":"https://qa.bodh.shikshalokam.org/resources/play/content/do_312461433824493568113381"
          },
          {
             "name":"1 Being a school leader in India",
             "id":"do_312468653843972096217603",
             "link":"https://qa.bodh.shikshalokam.org/resources/play/content/do_312468653843972096217603"
          },
          {
             "name":"1 Introducing the school development plan",
             "id":"do_312473641958858752119711",
             "link":"https://qa.bodh.shikshalokam.org/resources/play/content/do_312473641958858752119711"
          },
          {
             "name":"1 Introduction to change",
             "id":"do_312471679947603968218870",
             "link":"https://qa.bodh.shikshalokam.org/resources/play/content/do_312471679947603968218870"
          },
          {
             "name":"1 Perspectives on teacher development",
             "id":"do_312465053341499392115349",
             "link":"https://qa.bodh.shikshalokam.org/resources/play/content/do_312465053341499392115349"
          },
          {
             "name":"1 Prioritising your work and managing your time effectively as a school leader",
             "id":"do_312470257401192448118336",
             "link":"https://qa.bodh.shikshalokam.org/resources/play/content/do_312470257401192448118336"
          },
          {
             "name":"1 Promoting equity and inclusion through leadership",
             "id":"do_312461472596566016113394",
             "link":"https://qa.bodh.shikshalokam.org/resources/play/content/do_312461472596566016113394"
          },
          {
             "name":"1 The change context",
             "id":"do_31247931680157696011191",
             "link":"https://qa.bodh.shikshalokam.org/resources/play/content/do_31247931680157696011191"
          },
          {
             "name":"1 The importance of addressing diversity issues",
             "id":"do_312472438186647552219068",
             "link":"https://qa.bodh.shikshalokam.org/resources/play/content/do_312472438186647552219068"
          },
          {
             "name":"1 The importance of addressing diversity issues - Activity 1",
             "id":"do_312472448124387328219071",
             "link":"https://qa.bodh.shikshalokam.org/resources/play/content/do_312472448124387328219071"
          },
          {
             "name":"1 The importance of addressing diversity issues - Activity 2",
             "id":"do_312472449314750464119233",
             "link":"https://qa.bodh.shikshalokam.org/resources/play/content/do_312472449314750464119233"
          },
          {
             "name":"1 The importance of addressing diversity issues - Activity 3",
             "id":"do_312472452692328448219073",
             "link":"https://qa.bodh.shikshalokam.org/resources/play/content/do_312472452692328448219073"
          },
          {
             "name":"1 The importance of addressing diversity issues - Activity 4",
             "id":"do_312472459926659072219077",
             "link":"https://qa.bodh.shikshalokam.org/resources/play/content/do_312472459926659072219077"
          },
          {
             "name":"1 Types of resources within and outside the school",
             "id":"do_312461634252070912213326",
             "link":"https://qa.bodh.shikshalokam.org/resources/play/content/do_312461634252070912213326"
          },
          {
             "name":"1 Understanding formative and summative assessment",
             "id":"do_312460764300263424113062",
             "link":"https://qa.bodh.shikshalokam.org/resources/play/content/do_312460764300263424113062"
          },
          {
             "name":"1 What a school self-review is, and its advantages and challenges",
             "id":"do_312473169978834944119574",
             "link":"https://qa.bodh.shikshalokam.org/resources/play/content/do_312473169978834944119574"
          },
          {
             "name":"1 What coaching and mentoring have in common",
             "id":"do_312461560128339968113449",
             "link":"https://qa.bodh.shikshalokam.org/resources/play/content/do_312461560128339968113449"
          },
          {
             "name":"1 What is school culture and its impact on learning",
             "id":"do_312460929971642368113221",
             "link":"https://qa.bodh.shikshalokam.org/resources/play/content/do_312460929971642368113221"
          },
          {
             "name":"1 What technology and skills do you have access to?",
             "id":"do_312463871403139072114607",
             "link":"https://qa.bodh.shikshalokam.org/resources/play/content/do_312463871403139072114607"
          },
          {
             "name":"1 Working collaboratively with your state",
             "id":"do_312470917722218496218450",
             "link":"https://qa.bodh.shikshalokam.org/resources/play/content/do_312470917722218496218450"
          },
          {
             "name":"1.2. Not and Very(M)",
             "id":"do_31225409761605222412011",
             "link":"https://qa.bodh.shikshalokam.org/resources/play/content/do_31225409761605222412011"
          },
          {
             "name":"1.3  Section 1 Test(M)",
             "id":"do_31225357049694617611963",
             "link":"https://qa.bodh.shikshalokam.org/resources/play/content/do_31225357049694617611963"
          }
       ]
 }

  constructor() { }

  ngOnInit() { }
  close() { }
}
