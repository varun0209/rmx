import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class RmgridService {

    constructor(private http: HttpClient) { }
}