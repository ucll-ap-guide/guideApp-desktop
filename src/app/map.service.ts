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

    /**
     * The **addMap()** function sends a http POST request to the backend with the JSON. If the name already exists on
     * the server the map will be overwritten (update).
     *
     * @param map The JSON of the whole map.
     * @return An observable to which you can subscribe to know if the operation has been properly handled.
     */
    addMap(map: JSON): Observable<any> {
        return this.http.post(this.apiUrl, {headers: this.headers, params: map});
    }

    /**
     * The **getAllMapNames()** function sends a http GET request to the backend to get the names of all the maps.
     *
     * @return An observable to which you can subscribe and which will return an {@link Array} of `strings`.
     */
    getAllMapNames(): Observable<any> {
        return this.http.get(`${this.apiUrl}/maps`, {headers: this.headers});
    }

    /**
     * The **getMap()** function sends a http GET request to the backend to get the names of all the maps.
     *
     * @return An observable to which you can subscribe and which will return an {@link Array} of `strings`.
     */
    getMap(name: String): Observable<any> {
        return this.http.get(`${this.apiUrl}/map?map=${name}`, {headers: this.headers});
    }
}
