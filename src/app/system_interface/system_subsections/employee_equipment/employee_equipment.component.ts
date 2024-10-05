import { Component, Output, EventEmitter, Input, NgModule, OnInit, DoCheck } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';

import { DataService } from '../../../data/data.service';
import { ChangingTheStateService } from '../../../change/changing-the-state.service';

import { FormsModule } from '@angular/forms';
import { NgOptimizedImage, IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';

@Component({
    selector: 'employee-equipment',
    standalone: true,
    imports: [HttpClientModule, FormsModule, NgOptimizedImage],
    providers: [DataService, {
        provide: IMAGE_LOADER,
        useValue: (config: ImageLoaderConfig) => {
            return `http://localhost:3000/icons?icon_name=${config.src}`
        }
    }],
    templateUrl: './employee_equipment.component.html',
    styleUrls: ['./employee_equipment.component.css', './employee_equipment_style_dop.component.css']
})

export class EmployeeEquipment implements OnInit {
    
    @Input() updateEmployeeEquipment: boolean = false;
    @Output() onClick = new EventEmitter();

    array__bundle_objects: any = [];
    array__structured_data_for_a_table: any = [];

    number__the_sum_of_the_list_pages: number = 0;
    number__current_page: number = 0;
    number__skipping_requests: number = 0;

    string__search_text: any;

    array__page_numbering: any = [];

    constructor(private dataService: DataService, private http: HttpClient, private CHTSS: ChangingTheStateService) {
        this.CHTSS.updateComponentEmployeeEquipment.subscribe(() => {
            if (this.number__skipping_requests != 0) {
                this.ngOnInit();
            }
            this.number__skipping_requests = this.number__skipping_requests + 1;
        });
    }

    performingASearchByAGivenValue() {
        let value: number = this.string__search_text;
        let found_people = this.array__bundle_objects.filter((obj: any) => {
            if (obj.fcs.includes(this.string__search_text)) {
                return obj;
            }
            if (isNaN(value*1) == false) {
                if (obj.office == (value*1)) {
                    return obj;
                }
            }
        });
        this.array__bundle_objects = found_people;
    }
    createStructuringTheListOfEmployees(array: any, chunkSize: number): any {
        if (array.length != 0) {
            let res = [];
            for ( let i = 0; i < array.length; i += chunkSize ) {
                let chunk = array.slice(i, i + chunkSize);
                res.push(chunk);
            }
            return res;
        }
    }
    calcTheNumberOfPagesInTheList(split_list: any): number {
        return split_list.length;
    }
    createAnArrayOfNumbers(number_of_pages: number) {
        this.array__page_numbering = Array.from({length: number_of_pages}, (_, i) => i + 1);
    }
    changingTheDisplayedListPage(page_number: number) {
        if (page_number != -1 && page_number >= 0 ) {
            this.number__current_page = page_number
            this.array__bundle_objects = this.array__structured_data_for_a_table[page_number];
        }
    }

    deleteEmployeeEquipment(employee_technician_bundle_index: number) {
        try {
            let xhr = new XMLHttpRequest();
            xhr.open('DELETE', 'http://localhost:3000/employee_equipment');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({
                id: employee_technician_bundle_index
            }));
            xhr.onload = () => {
                if (xhr.status == 200) {
                    let obj = this.array__bundle_objects[this.array__bundle_objects.indexOf(this.array__bundle_objects.filter((item: any) => item.id == employee_technician_bundle_index)[0])];
                    this.CHTSS.dataOnTheRemovalOfTheEmployeeTechnicianBundle.next({
                        name: obj.name,
                        fcs: obj.fcs,
                    });
                }
            };
        } catch (error) {
            console.log(error);
        }
    }

    editingTheEmployeeTechnicianBundle(employee_technician_bundle_index: number) {
        this.CHTSS.dataOnEditingTheEmployeeTechnicianBundle.next(employee_technician_bundle_index);
    }

    getFillingTheTable() {
        this.array__structured_data_for_a_table = this.createStructuringTheListOfEmployees(this.array__bundle_objects, 14);
        if ( this.array__structured_data_for_a_table.length != 0 ) {
            this.array__bundle_objects = this.array__structured_data_for_a_table[this.number__current_page];
        }
        this.number__the_sum_of_the_list_pages = this.calcTheNumberOfPagesInTheList(this.array__structured_data_for_a_table);
        this.createAnArrayOfNumbers(this.number__the_sum_of_the_list_pages);
    }

    ngOnInit() {
        this.http.get('http://localhost:3000/staff', {observe: 'response'}).subscribe(res => {
            this.array__bundle_objects = res.body;
            this.getFillingTheTable();
            this.dataService.changingEmployeeEquipmentData(res.body);
        });
    }
}