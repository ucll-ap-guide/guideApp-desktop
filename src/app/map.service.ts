import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from '../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MapService {

    private apiUrl: string = environment.apiUrl;
    private headers: HttpHeaders = new HttpHeaders()
        .set("Access-Control-Allow-Origin", "*")
        .set("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS")
        .set("Access-Control-Allow-Headers", "*");

    constructor(private http: HttpClient) {
    }

    addMap(map: JSON): Observable<any> {
        return this.http.post(this.apiUrl, {headers: this.headers, params: map});
    }

    getAllMapNames(): Observable<any> {
        return this.http.get(`${this.apiUrl}/maps`, {headers: this.headers});
    }

    getMap(name: String): Observable<any> {
        return this.http.get(`${this.apiUrl}/map?map=${name}`, {headers: this.headers});
    }
}
