import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-category-select',
  templateUrl: './category-select.component.html',
  styleUrls: ['./category-select.component.scss'],
})
export class CategorySelectComponent implements OnInit {
  @Input() categories;
  @Input() selectedCategories = [];
  @Output() onSubmit = new EventEmitter();
  catgeoryForm: FormGroup;
  categoryData = [];
  otherCategoryValue;
  otherCategory = { input: 'text', field: 'otherCategories', value: '', show: false, validation: { required: true } };
  constructor(
    private modal: ModalController
  ) { }
  ngOnInit() { 
    console.log(this.categories,"categories 22");
  }
}