
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MentorService } from '../services/mentor.service';

@Component({
  selector: 'app-mentor-details',
  templateUrl: './mentor-details.page.html',
  styleUrls: ['./mentor-details.page.scss']
})
export class MentorDetailsPage implements OnInit {

  mentors: any[] = []; // Initialize as an empty object
  mentor: any
  slots: any[] = []

  constructor(private route: ActivatedRoute, private mentorService: MentorService) {}

  ngOnInit() {
    // Get the mentor ID from the route parameter
    const mentorId = this.route.snapshot.paramMap.get('mentorId');
    console.log(mentorId)
    
    this.mentors = this.mentorService.getMentorsList()
    // console.log(`Mentors : ${JSON.stringify(this.mentors)}`)
    let res = this.mentors.find(i => i.mentor.id === mentorId)
    this.mentor = res.mentor
    this.slots = res.slots
    console.log(res)
  }
}







