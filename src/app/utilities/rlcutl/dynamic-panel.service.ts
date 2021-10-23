import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders,  HttpErrorResponse } from '@angular/common/http';

@Injectable()

export class DynamicPanelService {
    public options;

    getCardsUrl = "http://localhost:50397/api/getdbcontrols";
    postCardsUrl = "http://localhost:50397/api/postdbcontrols";

    constructor(private http: HttpClient) { 
        this.options = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    }

    getCards() {
        return this.http.get(this.getCardsUrl, { headers: this.options, observe: 'response' })
        .pipe((tap<any>(response => { return response; })),
        catchError(this.handleError('apiGetRequest')));
    }

    postCards(cards) {
        return this.http.post(this.postCardsUrl, JSON.stringify(cards), { headers: this.options, observe: 'response' })
        .pipe((tap<any>(response => { return response; })),
        catchError(this.handleError('apiPostRequest')));
    }

     // API error handling
  private handleError(operation: String) {
    return (err: HttpErrorResponse) => {
      let errMsg = `error in ${operation}()  status: ${err.status}, ${err.statusText || ''}, ${err} `;
     // console.log(`${errMsg}`)
      if (err instanceof HttpErrorResponse) {

      //  console.log(`status: ${err.status}, ${err.statusText}`);

      }
      return throwError(err);
    }
  }

//     public apiHeaders; //request/response headers
//   public options;

//   constructor(private http: Http) {
//       this.apiHeaders = new Headers({ 'Content-Type': 'application/json' });
//       this.options = new RequestOptions({ headers: this.apiHeaders });
//    }

//    // get API request
//    public getCards():Observable<any>{
//       return this.http.get(this.getCardsUrl, this.options)
//             .pipe((map(this.parseData)));
//             // catchError(this.handleError('apiGetRequest')));
//    }

//    // post API request
//    public postCards(obj?: any):Observable<any>{     
//       return this.http.post(this.postCardsUrl, obj, this.options)
//             .pipe((map(this.parseData)),
//             catchError(this.handleError('apiPostRequest')));
//    }

//    // Parse the API response to json
//    public parseData(res: Response) {
//         let body = res.json();
//         return body || {};
//     }

//     // API error handling
//   private handleError(operation: String) {
//         return (err: any) => {
//             let errMsg = `error in ${operation}()  status: ${err.status}, ${err.statusText || ''}, ${err} `;
//             console.log(`${errMsg}`)
//             if(err instanceof HttpErrorResponse) {
                
//                 console.log(`status: ${err.status}, ${err.statusText}`);
                
//             }
//             return Observable.throw(err);
//         }
//     }
}