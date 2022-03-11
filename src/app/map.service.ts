import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from '../environments/environment';

@Injectable({
    providedIn: 'root'
})
/**
 * A class who handles all the communication with the backend server.
 */
export class MapService {

    private apiUrl: string = environment.apiUrl;
    private headers: HttpHeaders = new HttpHeaders()
        .set("Access-Control-Allow-Origin", "*")
        .set("Access-Control-Allow-Methods", "GET, POST, DELETE, HEAD, OPTIONS")
        .set("Access-Control-Allow-Headers", "*");

    constructor(private http: HttpClient) {
    }

    /**
     * The **addMap()** function sends a http POST request to the backend with the {@link map}. If the name already
     * exists on the server the map will be overwritten (update).
     *
     * @param map The {@link JSON} of the whole map.
     * @return An {@link Observable} to which you can subscribe to know if the operation has been properly handled.
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
     * The **getMap()** function sends a http GET request to the backend to get the {@link GuidoMap} with the given
     * {@link name}.
     *
     * @param name The name of the {@link GuidoMap}.
     * @return An {@link Observable} to which you can subscribe and which will return a {@link JSON} of the {@link GuidoMap}.
     */
    getMap(name: String): Observable<any> {
        return this.http.get(`${this.apiUrl}/map?map=${name}`, {headers: this.headers});
    }

    /**
     * The **deleteMap()** function sends a http DELETE request to the backend to delete the {@link GuidoMap} with the
     * given {@link name}.
     *
     * @param name The name of the {@link GuidoMap}.
     * @return An {@link Observable} to which you can subscribe to know if the operation has been properly handled.
     */
    deleteMap(name: String): Observable<any> {
        return this.http.delete(`${this.apiUrl}/?map=${name}`, {headers: this.headers});
    }
}
